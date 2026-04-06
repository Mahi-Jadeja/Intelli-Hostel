import Student from '../models/Student.js';
import Room from '../models/Room.js';
import Complaint from '../models/Complaint.js';
import Outpass from '../models/Outpass.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Get student profile
 *
 * GET /api/v1/student/profile
 *
 * Finds the Student document linked to the authenticated user.
 * Returns full profile data (personal, academic, hostel, guardian).
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user.id was set by requireAuth middleware
    // It contains the User document's _id
    const student = await Student.findOne({ user_id: req.user.id });

    if (!student) {
      return next(new AppError('Student profile not found', 404));
    }

    sendSuccess(res, 200, 'Profile retrieved successfully', { student });
  } catch (error) {
    next(error);
  }
};

/**
 * Update student profile
 *
 * PUT /api/v1/student/profile
 *
 * Updates ONLY the fields that are present in req.body.
 * req.body has already been validated and cleaned by Zod middleware.
 * Fields not in the Zod schema are automatically stripped.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user_id: req.user.id });

    if (!student) {
      return next(new AppError('Student profile not found', 404));
    }

    // Get the validated data from req.body
    // Zod has already stripped any unauthorized fields
    const updates = req.body;

    // Handle guardian nested object separately
    // If updates include guardian, we need to MERGE with existing
    // not replace the entire guardian object
    if (updates.guardian) {
      // Object.assign merges properties
      // Existing guardian: { name: "Mom", phone: "123" }
      // Update: { guardian: { phone: "456" } }
      // Result: { name: "Mom", phone: "456" }  ← name preserved!
      student.guardian = {
        ...student.guardian.toObject(),
        // .toObject() converts Mongoose subdocument to plain JS object
        // Required because Mongoose subdocuments have special prototype
        ...updates.guardian,
      };
      delete updates.guardian;
      // Remove from updates so it doesn't get set again below
    }

    // Apply remaining updates
    // Object.keys gives us an array of the field names in updates
    // We loop through and set each one on the student document
    Object.keys(updates).forEach((key) => {
      student[key] = updates[key];
    });

    // If name was updated, also update the User document
    // Keep name in sync between User and Student
    if (updates.name) {
      await User.findByIdAndUpdate(req.user.id, { name: updates.name });
    }

    // Save the student document
    // This triggers any pre-save hooks and validators
    await student.save();

    sendSuccess(res, 200, 'Profile updated successfully', { student });
  } catch (error) {
    next(error);
  }
};

/**
 * Get room allocation info
 *
 * GET /api/v1/student/room
 *
 * Fetches the student's room from the ROOM MODEL (not student fields).
 * This gives us accurate, real-time room data including roommates.
 *
 * FIX from teammate's code:
 * She read room info from student.hostel_details — that's a COPY that
 * could be stale. We query the Room model directly for fresh data.
 */
export const getRoom = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user_id: req.user.id });

    if (!student) {
      return next(new AppError('Student profile not found', 404));
    }

    // Check if student has a room assigned
    if (!student.room_no || !student.hostel_block) {
      return sendSuccess(res, 200, 'No room allocated yet', {
        room: null,
        bed_no: null,
      });
    }

    // Find the room from the Room model
    // populate('students') replaces student ObjectIds with actual documents
    const room = await Room.findOne({
      room_no: student.room_no,
      hostel_block: student.hostel_block,
    }).populate('students', 'name email college_id branch year phone bed_no profile_pic');
    // Second argument to populate = which fields to include
    // Only fetches the fields we need (not the entire student document)

    if (!room) {
      return sendSuccess(res, 200, 'Room not found in system', {
        room: null,
        bed_no: student.bed_no,
      });
    }

    sendSuccess(res, 200, 'Room info retrieved successfully', {
      room: {
        room_no: room.room_no,
        hostel_block: room.hostel_block,
        floor: room.floor,
        capacity: room.capacity,
        occupied: room.occupied,
        status: room.status,
        roommates: room.students.filter(
          (s) => s._id.toString() !== student._id.toString()
        ),
        // Filter out the current student from the roommates list
        // They don't need to see themselves as a "roommate"
      },
      bed_no: student.bed_no,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics
 *
 * GET /api/v1/student/dashboard-stats
 *
 * Aggregates data from multiple collections to give the
 * student an overview of their hostel life.
 *
 * Returns all data in ONE API call instead of 5 separate calls.
 * This is better for performance (fewer HTTP requests).
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user_id: req.user.id });

    if (!student) {
      return next(new AppError('Student profile not found', 404));
    }

    const studentId = student._id;

    // Run ALL queries in parallel using Promise.all
    // This is MUCH faster than running them one by one
    //
    // Sequential: Query1 (50ms) → Query2 (50ms) → Query3 (50ms) = 150ms
    // Parallel:   Query1 (50ms) ↗
    //             Query2 (50ms) → = ~50ms (all at the same time!)
    //             Query3 (50ms) ↘
    const [
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      totalOutpasses,
      pendingOutpasses,
      approvedOutpasses,
      pendingPayments,
      recentComplaints,
      recentOutpasses,
    ] = await Promise.all([
      // Complaint counts
      Complaint.countDocuments({ student_id: studentId }),
      Complaint.countDocuments({ student_id: studentId, status: 'pending' }),
      Complaint.countDocuments({ student_id: studentId, status: 'resolved' }),

      // Outpass counts
      Outpass.countDocuments({ student_id: studentId }),
      Outpass.countDocuments({ student_id: studentId, status: 'pending' }),
      Outpass.countDocuments({ student_id: studentId, status: 'approved' }),

      // Pending payments (need full documents for amount calculation)
      Payment.find({ student_id: studentId, status: 'pending' }),

      // Recent activity (last 5 of each, newest first)
      Complaint.find({ student_id: studentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('category status priority createdAt'),
      // .select() picks only the fields we need (less data transferred)

      Outpass.find({ student_id: studentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('reason status from_date to_date createdAt'),
    ]);

    // Calculate total pending payment amount
    const totalPendingAmount = pendingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    // .reduce() iterates through array and accumulates a value
    // Starting value = 0
    // Each iteration: sum = previous sum + current payment.amount
    // Example: [500, 300, 200].reduce((sum, val) => sum + val, 0) = 1000

    sendSuccess(res, 200, 'Dashboard stats retrieved', {
      room: {
        room_no: student.room_no || null,
        hostel_block: student.hostel_block || null,
        floor: student.floor,
        bed_no: student.bed_no,
      },
      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
        resolved: resolvedComplaints,
      },
      outpasses: {
        total: totalOutpasses,
        pending: pendingOutpasses,
        approved: approvedOutpasses,
      },
      payments: {
        pendingCount: pendingPayments.length,
        totalPendingAmount,
      },
      recent: {
        complaints: recentComplaints,
        outpasses: recentOutpasses,
      },
    });
  } catch (error) {
    next(error);
  }
};