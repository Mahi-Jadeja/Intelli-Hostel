import crypto from 'crypto';
import HostelConfig from '../models/HostelConfig.js';
import Room from '../models/Room.js';
import Student from '../models/Student.js';
import AppError from './AppError.js';
import { BRANCHES, STUDENT_GENDERS } from '../constants/enums.js';

/**
 * Create a random seed string.
 *
 * This seed is returned by preview and must be sent back on execute.
 * That keeps "random" allocation deterministic between preview and execute.
 */
export const createAllocationSeed = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Convert a string into a numeric seed.
 *
 * We need a number-based seed for the pseudo-random generator below.
 */
const stringToSeed = (value) => {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash || 1;
};

/**
 * Small seeded random number generator.
 *
 * Same seed = same sequence of random numbers
 */
const mulberry32 = (seed) => {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Shuffle array deterministically using a seed.
 *
 * This gives us "random" order that is reproducible.
 */
const shuffleWithSeed = (items, seedValue) => {
  const result = [...items];
  const random = mulberry32(stringToSeed(seedValue));

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

/**
 * Normalize selected blocks:
 * - trim
 * - uppercase
 * - remove duplicates
 */
const normalizeSelectedBlocks = (blocks = []) => {
  return [...new Set(blocks.map((block) => block.trim().toUpperCase()))];
};

/**
 * Check whether a student is already allocated.
 */
const isAllocated = (student) => {
  return Boolean(student.room_no && student.hostel_block);
};

/**
 * Sort rooms in the required order:
 * 1. block alphabetical
 * 2. lower floor first
 * 3. lower room number first
 */
const sortRooms = (a, b) => {
  const blockCompare = a.hostel_block.localeCompare(b.hostel_block);
  if (blockCompare !== 0) return blockCompare;

  if (a.floor !== b.floor) {
    return a.floor - b.floor;
  }

  return a.room_no.localeCompare(b.room_no, undefined, { numeric: true });
};

/**
 * Get the next free bed number inside a room snapshot.
 *
 * Example:
 * occupied beds = [1, 3]
 * next free bed = 2
 */
const getNextAvailableBedNo = (room) => {
  const occupiedBeds = new Set(
    room.occupants.map((occupant) => occupant.bed_no).filter(Boolean)
  );

  for (let bedNo = 1; bedNo <= room.capacity; bedNo++) {
    if (!occupiedBeds.has(bedNo)) {
      return bedNo;
    }
  }

  return null;
};

/**
 * Convert real Room document into a plain simulation snapshot.
 *
 * We never mutate the real DB in preview mode.
 * We only mutate these in-memory snapshots.
 */
const buildRoomSnapshot = (room) => ({
  room_id: room._id.toString(),
  room_no: room.room_no,
  hostel_block: room.hostel_block,
  floor: room.floor,
  capacity: room.capacity,
  status: room.status,
  occupants: room.students.map((student) => ({
    student_id: student._id.toString(),
    bed_no: student.bed_no ?? null,
  })),
});

/**
 * Convert Student document into a lightweight allocation object.
 */
const buildStudentSnapshot = (student) => ({
  student_id: student._id.toString(),
  name: student.name,
  email: student.email,
  gender: student.gender,
  branch: student.branch,
  year: student.year,
  current_room_no: student.room_no || '',
  current_block: student.hostel_block || '',
});

/**
 * Load hostel configs for the target scope.
 *
 * If selected blocks are provided, ensure all of them exist.
 */
const loadConfigMap = async (selectedBlocks = []) => {
  const filter =
    selectedBlocks.length > 0
      ? { hostel_block: { $in: selectedBlocks } }
      : {};

  const configs = await HostelConfig.find(filter).sort({ hostel_block: 1 });

  if (!configs.length) {
    throw new AppError('No hostel blocks are configured for bulk allocation', 400);
  }

  if (selectedBlocks.length > 0) {
    const foundBlocks = new Set(configs.map((config) => config.hostel_block));
    const missingBlocks = selectedBlocks.filter(
      (block) => !foundBlocks.has(block)
    );

    if (missingBlocks.length > 0) {
      throw new AppError(
        `Hostel config not found for block(s): ${missingBlocks.join(', ')}`,
        404
      );
    }
  }

  return new Map(configs.map((config) => [config.hostel_block, config]));
};

/**
 * Load all rooms for the target blocks.
 *
 * We populate only bed_no because preview needs to know
 * which beds are already occupied.
 */
const loadRoomSnapshots = async (targetBlocks) => {
  const rooms = await Room.find({
    hostel_block: { $in: targetBlocks },
  })
    .populate('students', 'bed_no')
    .sort({ hostel_block: 1, floor: 1, room_no: 1 });

  return rooms.map(buildRoomSnapshot);
};

/**
 * Get candidate students and skipped students for the chosen scope.
 *
 * Part 1 rule for reshuffle_selected_blocks:
 * - only students currently allocated in those selected blocks are candidates
 * - unallocated students are skipped in that scope
 *
 * This keeps the scope safe and predictable.
 */
const getCandidateStudents = async ({ scope, selectedBlocks }) => {
  const students = await Student.find({
    is_active: true,
    is_hosteller: true,
  }).sort({ name: 1 });

  const candidates = [];
  const skipped = [];

  for (const student of students) {
    const hasValidGender = STUDENT_GENDERS.includes(student.gender);
    const hasValidBranch = BRANCHES.includes(student.branch);

    if (!hasValidGender || !hasValidBranch) {
      skipped.push({
        student_id: student._id.toString(),
        name: student.name,
        reason: 'Missing required standardized gender or branch data',
      });
      continue;
    }

    const allocated = isAllocated(student);

    if (scope === 'unallocated') {
      if (allocated) {
        skipped.push({
          student_id: student._id.toString(),
          name: student.name,
          reason: 'Already allocated and not included in unallocated scope',
        });
      } else {
        candidates.push(student);
      }
      continue;
    }

    if (scope === 'reshuffle_selected_blocks') {
      if (allocated && selectedBlocks.includes(student.hostel_block)) {
        candidates.push(student);
      } else {
        skipped.push({
          student_id: student._id.toString(),
          name: student.name,
          reason:
            allocated
              ? 'Allocated outside selected blocks'
              : 'Unallocated students are not included in selected-block reshuffle',
        });
      }
      continue;
    }

    // reshuffle_all
    candidates.push(student);
  }

  return { candidates, skipped };
};

/**
 * For reshuffle scopes, we remove candidate students from the room snapshots
 * so the simulation starts from a "cleared" version of the affected rooms.
 *
 * For unallocated scope, rooms stay as-is.
 */
const prepareRoomsForScope = ({ rooms, candidates, scope }) => {
  if (scope === 'unallocated') {
    return rooms.map((room) => ({
      ...room,
      occupants: [...room.occupants],
    }));
  }

  const candidateIds = new Set(
    candidates.map((student) => student._id.toString())
  );

  return rooms.map((room) => ({
    ...room,
    occupants: room.occupants.filter(
      (occupant) => !candidateIds.has(occupant.student_id)
    ),
  }));
};

/**
 * Allocate students into compatible rooms for RANDOM mode.
 *
 * Rules:
 * - student gender must match block gender
 * - room must not be maintenance
 * - room must have free capacity
 * - lower floor / lower room ordering is respected
 * - student order is shuffled by seed
 */
const allocateRandomStudents = ({ students, rooms, configMap }) => {
  const allocations = [];
  const unallocatedStudents = [];

  for (const student of students) {
    const compatibleRoom = rooms.find((room) => {
      const blockConfig = configMap.get(room.hostel_block);

      return (
        room.status !== 'maintenance' &&
        room.occupants.length < room.capacity &&
        blockConfig &&
        blockConfig.block_gender === student.gender
      );
    });

    if (!compatibleRoom) {
      unallocatedStudents.push({
        student_id: student.student_id,
        name: student.name,
        gender: student.gender,
        branch: student.branch,
        reason: `No available ${student.gender} bed found in current allocation scope`,
      });
      continue;
    }

    const bedNo = getNextAvailableBedNo(compatibleRoom);

    if (!bedNo) {
      unallocatedStudents.push({
        student_id: student.student_id,
        name: student.name,
        gender: student.gender,
        branch: student.branch,
        reason: `No available bed number found in room ${compatibleRoom.room_no}`,
      });
      continue;
    }

    compatibleRoom.occupants.push({
      student_id: student.student_id,
      bed_no: bedNo,
    });

    allocations.push({
      student_id: student.student_id,
      name: student.name,
      gender: student.gender,
      branch: student.branch,
      year: student.year,
      room_id: compatibleRoom.room_id,
      room_no: compatibleRoom.room_no,
      hostel_block: compatibleRoom.hostel_block,
      floor: compatibleRoom.floor,
      bed_no: bedNo,
    });
  }

  return {
    allocations,
    unallocatedStudents,
  };
};

/**
 * Simulate bulk allocation without touching the DB.
 *
 * Part 1 supports RANDOM mode only.
 */
export const simulateBulkAllocation = async ({
  mode,
  scope,
  selected_blocks = [],
  seed,
}) => {
  if (mode !== 'random') {
    throw new AppError(
      'This allocation mode will be implemented in the next part',
      400
    );
  }

  const normalizedBlocks = normalizeSelectedBlocks(selected_blocks);

  if (
    scope === 'reshuffle_selected_blocks' &&
    normalizedBlocks.length === 0
  ) {
    throw new AppError(
      'Please provide selected blocks for reshuffle_selected_blocks scope',
      400
    );
  }

  const configMap = await loadConfigMap(
    scope === 'reshuffle_selected_blocks' ? normalizedBlocks : []
  );

  const targetBlocks = [...configMap.keys()].sort();

  const { candidates, skipped } = await getCandidateStudents({
    scope,
    selectedBlocks: normalizedBlocks,
  });

  const roomSnapshots = await loadRoomSnapshots(targetBlocks);
  const preparedRooms = prepareRoomsForScope({
    rooms: roomSnapshots,
    candidates,
    scope,
  }).sort(sortRooms);

  const totalBedsInScope = preparedRooms
    .filter((room) => room.status !== 'maintenance')
    .reduce((sum, room) => sum + room.capacity, 0);

  const occupiedBedsBefore = preparedRooms
    .filter((room) => room.status !== 'maintenance')
    .reduce((sum, room) => sum + room.occupants.length, 0);

  const randomMaleStudents = shuffleWithSeed(
    candidates
      .filter((student) => student.gender === 'male')
      .map(buildStudentSnapshot),
    `${seed}-male`
  );

  const randomFemaleStudents = shuffleWithSeed(
    candidates
      .filter((student) => student.gender === 'female')
      .map(buildStudentSnapshot),
    `${seed}-female`
  );

  const maleResult = allocateRandomStudents({
    students: randomMaleStudents,
    rooms: preparedRooms,
    configMap,
  });

  const femaleResult = allocateRandomStudents({
    students: randomFemaleStudents,
    rooms: preparedRooms,
    configMap,
  });

  const allocations = [
    ...maleResult.allocations,
    ...femaleResult.allocations,
  ];

  const unallocatedStudents = [
    ...maleResult.unallocatedStudents,
    ...femaleResult.unallocatedStudents,
  ];

  return {
    mode,
    scope,
    seed,
    selected_blocks:
      scope === 'reshuffle_selected_blocks' ? normalizedBlocks : targetBlocks,

    summary: {
      totalEligibleStudents: candidates.length,
      studentsToAllocate: candidates.length,
      studentsSkipped: skipped.length,
      studentsCouldNotBeAllocated: unallocatedStudents.length,
      preferencePairsHonored: 0,
      fallbackAllocationsCount: 0,
    },

    room_stats: {
      totalRoomsConsidered: preparedRooms.length,
      totalBedsInScope,
      occupiedBedsBefore,
      availableBedsBeforeAllocation: totalBedsInScope - occupiedBedsBefore,
    },

    allocations,
    skipped_students: skipped,
    unallocated_students: unallocatedStudents,

    final_rooms: preparedRooms.map((room) => ({
      room_id: room.room_id,
      room_no: room.room_no,
      hostel_block: room.hostel_block,
      floor: room.floor,
      capacity: room.capacity,
      occupied: room.occupants.length,
      available_beds: room.capacity - room.occupants.length,
      status: room.status,
      occupants: room.occupants,
    })),

    meta: {
      candidate_student_ids: candidates.map((student) => student._id.toString()),
    },
  };
};

/**
 * Execute bulk allocation.
 *
 * Safety rule:
 * If preview says some students still cannot be allocated,
 * we reject execution instead of partially applying the reshuffle.
 */
export const executeBulkAllocationPlan = async ({
  mode,
  scope,
  selected_blocks = [],
  seed,
}) => {
  const preview = await simulateBulkAllocation({
    mode,
    scope,
    selected_blocks,
    seed,
  });

  if (preview.unallocated_students.length > 0) {
    throw new AppError(
      'Cannot execute bulk allocation because some students could not be allocated. Please review the preview first.',
      400
    );
  }

  const finalRoomMap = new Map(
    preview.final_rooms.map((room) => [room.room_id, room])
  );

  const candidateStudentIds = preview.meta.candidate_student_ids;
  const allocationMap = new Map(
    preview.allocations.map((allocation) => [
      allocation.student_id,
      allocation,
    ])
  );

  // Step 1: Update affected rooms
  const affectedRooms = await Room.find({
    _id: { $in: [...finalRoomMap.keys()] },
  });

  for (const room of affectedRooms) {
    const snapshot = finalRoomMap.get(room._id.toString());

    if (!snapshot) continue;

    room.students = snapshot.occupants.map((occupant) => occupant.student_id);
    await room.save();
  }

  // Step 2: Update all candidate students
  const candidateStudents = await Student.find({
    _id: { $in: candidateStudentIds },
  });

  for (const student of candidateStudents) {
    const assignedRoom = allocationMap.get(student._id.toString());

    if (assignedRoom) {
      student.room_no = assignedRoom.room_no;
      student.hostel_block = assignedRoom.hostel_block;
      student.floor = assignedRoom.floor;
      student.bed_no = assignedRoom.bed_no;
    } else {
      // In execute we normally never reach this because we reject
      // if unallocated_students.length > 0
      student.room_no = '';
      student.hostel_block = '';
      student.floor = null;
      student.bed_no = null;
    }

    await student.save();
  }

  return {
    preview,
    executed: {
      studentsAllocated: preview.allocations.length,
      roomsTouched: finalRoomMap.size,
    },
  };
};