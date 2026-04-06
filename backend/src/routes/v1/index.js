import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);

// We'll add more as we build them:
// router.use('/hostel', hostelRoutes);
// router.use('/complaints', complaintRoutes);
// router.use('/outpass', outpassRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/admin', adminRoutes);

export default router;