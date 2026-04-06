import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getRoom,
  getDashboardStats,
} from '../../controllers/student.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import validate from '../../middleware/validate.js';
import { updateProfileSchema } from '../../validations/student.validation.js';

const router = Router();

// All student routes require authentication
// Instead of adding requireAuth to each route individually,
// we apply it to ALL routes in this router
router.use(requireAuth);

/**
 * @swagger
 * /api/v1/student/profile:
 *   get:
 *     summary: Get student profile
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Profile not found
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /api/v1/student/profile:
 *   put:
 *     summary: Update student profile
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               college_id:
 *                 type: string
 *               branch:
 *                 type: string
 *               year:
 *                 type: number
 *               semester:
 *                 type: number
 *               guardian:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 */
router.put('/profile', validate(updateProfileSchema), updateProfile);

/**
 * @swagger
 * /api/v1/student/room:
 *   get:
 *     summary: Get room allocation info with roommates
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Room data (null if not allocated)
 */
router.get('/room', getRoom);

/**
 * @swagger
 * /api/v1/student/dashboard-stats:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated stats from all modules
 */
router.get('/dashboard-stats', getDashboardStats);

export default router;