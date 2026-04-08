import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Student from '../../src/models/Student.js';
import Outpass from '../../src/models/Outpass.js';

describe('Guardian Outpass Approval Endpoints', () => {
  let studentProfile;
  let validToken;
  let expiredToken;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/intellihostel_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Outpass.deleteMany({});

    // Create student
    await request(app).post('/api/v1/auth/register').send({
      name: 'Test Student',
      email: 'test@test.com',
      password: 'Password123',
      gender: 'male',
      branch: 'Computer Science',
      guardian: {
        name: 'Guardian',
        phone: '9876543210',
        email: 'guardian@test.com',
      },
    });

    studentProfile = await Student.findOne({ email: 'test@test.com' });

    // Valid pending outpass
    const validOutpass = await Outpass.create({
      student_id: studentProfile._id,
      from_date: new Date('2025-12-01'),
      to_date: new Date('2025-12-03'),
      reason: 'Family visit',
      guardian_email: 'guardian@test.com',
      status: 'pending',
      email_sent: true,
    });
    validToken = validOutpass.approval_token;

    // Expired outpass
    const expiredOutpass = await Outpass.create({
      student_id: studentProfile._id,
      from_date: new Date('2020-01-01'),
      to_date: new Date('2020-01-03'),
      reason: 'Expired test',
      guardian_email: 'guardian@test.com',
      status: 'pending',
      token_expires_at: new Date('2020-01-01'),
      email_sent: true,
    });
    expiredToken = expiredOutpass.approval_token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Outpass.deleteMany({});
    await mongoose.disconnect();
  });

  describe('GET /api/v1/outpass/guardian-action/:token', () => {
    it('should return outpass details for valid token', async () => {
      const res = await request(app)
        .get(`/api/v1/outpass/guardian-action/${validToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.outpass.student_name).toBe('Test Student');
    });

    it('should reject expired token', async () => {
      await request(app)
        .get(`/api/v1/outpass/guardian-action/${expiredToken}`)
        .expect(400);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/v1/outpass/guardian-action/invalid-token-123')
        .expect(404);
    });
  });

  describe('PATCH /api/v1/outpass/guardian-action/:token/decision', () => {
    it('should approve outpass successfully', async () => {
      const res = await request(app)
        .patch(`/api/v1/outpass/guardian-action/${validToken}/decision`)
        .send({ decision: 'approved' })
        .expect(200);

      expect(res.body.data.status).toBe('approved');

      const dbOutpass = await Outpass.findOne({ approval_token: validToken });
      expect(dbOutpass.status).toBe('approved');
    });

    it('should reject outpass successfully', async () => {
      const res = await request(app)
        .patch(`/api/v1/outpass/guardian-action/${validToken}/decision`)
        .send({ decision: 'rejected' })
        .expect(200);

      expect(res.body.data.status).toBe('guardian_rejected');
    });

    it('should prevent double decision', async () => {
      await request(app)
        .patch(`/api/v1/outpass/guardian-action/${validToken}/decision`)
        .send({ decision: 'approved' })
        .expect(200);

      await request(app)
        .patch(`/api/v1/outpass/guardian-action/${validToken}/decision`)
        .send({ decision: 'rejected' })
        .expect(400);
    });
  });
});