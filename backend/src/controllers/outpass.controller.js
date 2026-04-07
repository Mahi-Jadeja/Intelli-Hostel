import Outpass from '../models/Outpass.js';
import Student from '../models/Student.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';
import paginate from '../utils/pagination.js';

/**
 * Create a new outpass request
 *
 * POST /api/v1/outpass
 *
 * Student creates an outpass.
 * Status is always 'pending' initially.
 */
export const createOutpass = async (req, res, next) => {
  try {
    const { from_date, to_date, reason } = req.body;

    // Find the authenticated student's profile
    const student = await Student.findOne({ user_id: req.user.id });

    if (!student) {
      return next(new AppError('Student profile not found', 404));
    }

    // Create outpass request
    const outpass = await Outpass.create({
      student_id: student._id,
      from_date,
      to_date,
      reason,
      status: 'pending',
    });

    sendSuccess(res, 201, 'Outpass request submitted successfully', { outpass });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current student's outpass history
 *
 * GET /api/v1/outpass/mine
 *
 * Supports pagination.
 */
export const getMyOutpasses = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user_id: req.user.id });

    if (!student) {
      return next(new AppError('Student profile not found', 404));
    }

    const { page = 1, limit = 10 } = req.query;

    const result = await paginate(
      Outpass,
      { student_id: student._id },
      {
        page,
        limit,
        sort: '-createdAt',
      }
    );

    sendSuccess(res, 200, 'Outpass history retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all outpass requests (admin only)
 *
 * GET /api/v1/outpass
 *
 * Supports:
 * - pagination
 * - filtering by status
 */
export const getAllOutpasses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const result = await paginate(Outpass, filter, {
      page,
      limit,
      sort: '-createdAt',
      populate: {
        path: 'student_id',
        select: 'name email room_no hostel_block college_id phone branch year',
      },
    });

    sendSuccess(res, 200, 'Outpass requests retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single outpass by ID
 *
 * GET /api/v1/outpass/:id
 *
 * Student can view only own outpass.
 * Admin can view any outpass.
 */
export const getOutpassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const outpass = await Outpass.findById(id)
      .populate('student_id', 'name email room_no hostel_block college_id phone branch year')
      .populate('approved_by', 'name email role');

    if (!outpass) {
      return next(new AppError('Outpass not found', 404));
    }

    // If requester is student, ensure ownership
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user_id: req.user.id });

      if (!student || outpass.student_id._id.toString() !== student._id.toString()) {
        return next(new AppError('You can only view your own outpasses', 403));
      }
    }

    sendSuccess(res, 200, 'Outpass retrieved successfully', { outpass });
  } catch (error) {
    next(error);
  }
};

/**
 * Decide an outpass request (admin only)
 *
 * PATCH /api/v1/outpass/:id/decision
 *
 * Admin can approve or reject pending outpasses.
 * Once approved/rejected, decision cannot be changed.
 */
export const decideOutpass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_remark } = req.body;

    const outpass = await Outpass.findById(id);

    if (!outpass) {
      return next(new AppError('Outpass not found', 404));
    }

    // Prevent re-decision
    if (outpass.status !== 'pending') {
      return next(
        new AppError(
          `This outpass has already been ${outpass.status}. Decision cannot be changed.`,
          400
        )
      );
    }

    outpass.status = status;
    outpass.approved_by = req.user.id;

    if (admin_remark !== undefined) {
      outpass.admin_remark = admin_remark;
    }

    await outpass.save();

    await outpass.populate('student_id', 'name email room_no hostel_block');
    await outpass.populate('approved_by', 'name email role');

    sendSuccess(res, 200, `Outpass ${status} successfully`, { outpass });
  } catch (error) {
    next(error);
  }
};