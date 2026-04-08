import mongoose from 'mongoose';
import request from 'supertest';
import { jest } from '@jest/globals';

// ✅ Mock BEFORE imports
jest.unstable_mockModule('../../src/utils/email.js', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPaymentReminder: jest.fn().mockResolvedValue(),
}));

// Static imports (safe)
import User from '../../src/models/User.js';
import Student from '../../src/models/Student.js';
import Payment from '../../src/models/Payment.js';

let app;
let sendPaymentReminder;

describe('Payment Reminder Endpoints', () => {
  let adminToken;
  let studentProfile;

  beforeAll(async () => {
    // ✅ Import mocked module AFTER mocking
    const emailModule = await import('../../src/utils/email.js');
    sendPaymentReminder = emailModule.sendPaymentReminder;

    // ✅ Import app AFTER mocking (VERY IMPORTANT)
    app = (await import('../../src/app.js')).default;

    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/intellihostel_test';

    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Payment.deleteMany({});
    jest.clearAllMocks();

    // Create student
    await request(app).post('/api/v1/auth/register').send({
      name: 'Remind Me',
      email: 'remind@test.com',
      password: 'Password123',
      gender: 'male',
      branch: 'Computer Science',
      guardian: {
        name: 'Guardian',
        phone: '1234567890',
        email: 'guardian@test.com',
      },
    });

    studentProfile = await Student.findOne({
      email: 'remind@test.com',
    });

    // Create admin
    await User.create({
      name: 'Admin',
      email: 'mahijadeja0409@gmail.com',
      password: 'Admin123',
      role: 'admin',
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'mahijadeja0409@gmail.com',
        password: 'Admin123',
      });

    adminToken = res.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Payment.deleteMany({});
    await mongoose.disconnect();
  });

  describe('POST /api/v1/payments/reminders', () => {
    it('should send reminder for specific pending payment', async () => {
      const payment = await Payment.create({
        student_id: studentProfile._id,
        amount: 5000,
        type: 'hostel_fee',
        due_date: new Date(),
        status: 'pending',
      });

      const res = await request(app)
        .post('/api/v1/payments/reminders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ payment_id: payment._id.toString() })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.emailsSent).toBe(1);
      expect(sendPaymentReminder).toHaveBeenCalled();

      const updated = await Payment.findById(payment._id);
      expect(updated.reminder_count).toBe(1);
      expect(updated.last_reminder_type).toBe('manual');
    });

    it('should reject reminder for paid payment', async () => {
      const payment = await Payment.create({
        student_id: studentProfile._id,
        amount: 5000,
        type: 'hostel_fee',
        due_date: new Date(),
        status: 'paid',
      });

      await request(app)
        .post('/api/v1/payments/reminders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ payment_id: payment._id.toString() })
        .expect(400);
    });

    it('should skip duplicate manual reminders if already sent today', async () => {
      const payment = await Payment.create({
        student_id: studentProfile._id,
        amount: 3000,
        type: 'mess_fee',
        due_date: new Date(),
        status: 'pending',
        last_reminder_sent_at: new Date(),
        last_reminder_type: 'manual',
        reminder_count: 1,
      });

      const res = await request(app)
        .post('/api/v1/payments/reminders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ payment_id: payment._id.toString() })
        .expect(200);

      expect(res.body.data.emailsSent).toBe(1);

      const updated = await Payment.findById(payment._id);
      expect(updated.reminder_count).toBe(2);
    });
  });
});