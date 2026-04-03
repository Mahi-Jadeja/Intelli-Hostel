import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

// Mount auth routes under /auth
// Full path becomes: /api/v1/auth/...
router.use('/auth', authRoutes);

// We'll add more routes here as we build them:
// router.use('/student', studentRoutes);
// router.use('/hostel', hostelRoutes);
// router.use('/complaints', complaintRoutes);
// router.use('/outpass', outpassRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/admin', adminRoutes);

export default router;