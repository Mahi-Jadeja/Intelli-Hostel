import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Student from '../../src/models/Student.js';
import Room from '../../src/models/Room.js';
import HostelConfig from '../../src/models/HostelConfig.js';

describe('Hostel Endpoints', () => {
  let adminToken;
  let studentToken;
  let student1;
  let student2;

  beforeAll(async () => {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/intellihostel_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Room.deleteMany({});
    await HostelConfig.deleteMany({});

    // Create admin
    await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123',
      role: 'admin',
    });

    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin123',
      });

    adminToken = adminRes.body.data.token;

    // Create student 1
    const studentRes1 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Student One',
        email: 'student1@test.com',
        password: 'Password123',
        gender: 'male',
        branch: 'Computer Science',
        guardian: {
          name: 'Parent One',
          phone: '9876543210',
          email: 'parent1@test.com',
        },
      });

    studentToken = studentRes1.body.data.token;
    student1 = await Student.findOne({ email: 'student1@test.com' });

    // Create student 2
        await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Student Two',
        email: 'student2@test.com',
        password: 'Password123',
        gender: 'male',
        branch: 'Mechanical Engineering',
        guardian: {
          name: 'Parent Two',
          phone: '9876543211',
          email: 'parent2@test.com',
        },
      });

    student2 = await Student.findOne({ email: 'student2@test.com' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Room.deleteMany({});
    await HostelConfig.deleteMany({});
    await mongoose.disconnect();
  });

  describe('POST /api/v1/hostel/config', () => {
    it('should allow admin to create hostel config', async () => {
      const res = await request(app)
        .post('/api/v1/hostel/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          hostel_name: 'Boys Hostel',
          hostel_block: 'A',
          total_floors: 2,
          rooms_per_floor: 3,
          default_capacity: 2,
          block_gender: 'male',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.config.hostel_block).toBe('A');
      expect(res.body.data.config.total_floors).toBe(2);
    });

    it('should reject student access', async () => {
      await request(app)
        .post('/api/v1/hostel/config')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          hostel_name: 'Boys Hostel',
          hostel_block: 'A',
          total_floors: 2,
          rooms_per_floor: 3,
          default_capacity: 2,
          block_gender: 'male',
        })
        .expect(403);
    });
  });

  describe('POST /api/v1/hostel/generate-rooms', () => {
    beforeEach(async () => {
      await HostelConfig.create({
        hostel_name: 'Boys Hostel',
        hostel_block: 'A',
        total_floors: 2,
        rooms_per_floor: 3,
        default_capacity: 2,
        block_gender: 'male',
      });
    });

    it('should generate correct number of rooms', async () => {
      const res = await request(app)
        .post('/api/v1/hostel/generate-rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ hostel_block: 'A' })
        .expect(201);

      expect(res.body.data.generatedCount).toBe(6);

      const rooms = await Room.find({ hostel_block: 'A' }).sort({ room_no: 1 });
      expect(rooms).toHaveLength(6);
    });

    it('should generate correct room numbers', async () => {
      await request(app)
        .post('/api/v1/hostel/generate-rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ hostel_block: 'A' })
        .expect(201);

      const rooms = await Room.find({ hostel_block: 'A' }).sort({ room_no: 1 });

      const roomNumbers = rooms.map((room) => room.room_no);
      expect(roomNumbers).toEqual(['101', '102', '103', '201', '202', '203']);
    });

    it('should not regenerate occupied rooms', async () => {
      const room = await Room.create({
        room_no: '101',
        hostel_block: 'A',
        floor: 1,
        capacity: 2,
        students: [student1._id],
      });

      await request(app)
        .post('/api/v1/hostel/generate-rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ hostel_block: 'A' })
        .expect(400);
    });
  });

  describe('GET /api/v1/hostel/layout', () => {
    beforeEach(async () => {
      await HostelConfig.create({
        hostel_name: 'Boys Hostel',
        hostel_block: 'A',
        total_floors: 2,
        rooms_per_floor: 2,
        default_capacity: 2,
        block_gender: 'male',
      });

      await Room.insertMany([
        {
          room_no: '101',
          hostel_block: 'A',
          floor: 1,
          capacity: 2,
          students: [],
        },
        {
          room_no: '102',
          hostel_block: 'A',
          floor: 1,
          capacity: 2,
          students: [student1._id],
        },
        {
          room_no: '201',
          hostel_block: 'A',
          floor: 2,
          capacity: 2,
          students: [student1._id, student2._id],
        },
        {
          room_no: '202',
          hostel_block: 'A',
          floor: 2,
          capacity: 2,
          students: [],
        },
      ]);
    });

    it('should return grouped floor layout and stats', async () => {
      const res = await request(app)
        .get('/api/v1/hostel/layout?block=A')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.block).toBe('A');
      expect(res.body.data.floors).toHaveLength(2);
      expect(res.body.data.stats.totalRooms).toBe(4);
    });
  });

  describe('POST /api/v1/hostel/allocate', () => {
    let room1;
    let room2;

    beforeEach(async () => {
      room1 = await Room.create({
        room_no: '101',
        hostel_block: 'A',
        floor: 1,
        capacity: 2,
        students: [],
      });

      room2 = await Room.create({
        room_no: '102',
        hostel_block: 'A',
        floor: 1,
        capacity: 2,
        students: [],
      });
    });

    it('should allocate student to room and assign bed number', async () => {
      const res = await request(app)
        .post('/api/v1/hostel/allocate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student_id: student1._id.toString(),
          room_id: room1._id.toString(),
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      const updatedStudent = await Student.findById(student1._id);
      const updatedRoom = await Room.findById(room1._id);

      expect(updatedStudent.room_no).toBe('101');
      expect(updatedStudent.hostel_block).toBe('A');
      expect(updatedStudent.bed_no).toBe(1);
      expect(updatedRoom.students).toHaveLength(1);
    });

    it('should move student from old room to new room automatically', async () => {
      // First allocation
      await request(app)
        .post('/api/v1/hostel/allocate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student_id: student1._id.toString(),
          room_id: room1._id.toString(),
        })
        .expect(200);

      // Move to another room
      await request(app)
        .post('/api/v1/hostel/allocate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student_id: student1._id.toString(),
          room_id: room2._id.toString(),
        })
        .expect(200);

      const updatedStudent = await Student.findById(student1._id);
      const updatedRoom1 = await Room.findById(room1._id);
      const updatedRoom2 = await Room.findById(room2._id);

      expect(updatedStudent.room_no).toBe('102');
      expect(updatedRoom1.students).toHaveLength(0);
      expect(updatedRoom2.students).toHaveLength(1);
    });

    it('should not allow allocation to full room', async () => {
      room1.students = [student1._id, student2._id];
      await room1.save();

      await request(app)
        .post('/api/v1/hostel/allocate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student_id: student1._id.toString(),
          room_id: room1._id.toString(),
        })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/hostel/deallocate/:studentId', () => {
    let room;

    beforeEach(async () => {
      room = await Room.create({
        room_no: '101',
        hostel_block: 'A',
        floor: 1,
        capacity: 2,
        students: [student1._id],
      });

      student1.room_no = '101';
      student1.hostel_block = 'A';
      student1.floor = 1;
      student1.bed_no = 1;
      await student1.save();
    });

    it('should deallocate student and clear room fields', async () => {
      await request(app)
        .delete(`/api/v1/hostel/deallocate/${student1._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const updatedStudent = await Student.findById(student1._id);
      const updatedRoom = await Room.findById(room._id);

      expect(updatedStudent.room_no).toBe('');
      expect(updatedStudent.hostel_block).toBe('');
      expect(updatedStudent.bed_no).toBeNull();
      expect(updatedRoom.students).toHaveLength(0);
    });
  });

  describe('GET /api/v1/hostel/eligible-students', () => {
    it('should return only unallocated active hostellers', async () => {
      // Allocate student1 manually
      student1.room_no = '101';
      student1.hostel_block = 'A';
      await student1.save();

      const res = await request(app)
        .get('/api/v1/hostel/eligible-students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const ids = res.body.data.students.map((student) => student._id);

      expect(ids).toContain(student2._id.toString());
      expect(ids).not.toContain(student1._id.toString());
    });
  });
});