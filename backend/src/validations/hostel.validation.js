import { z } from 'zod';
import { BLOCK_GENDERS } from '../constants/enums.js';

/**
 * Hostel block configuration validation
 */
export const hostelConfigSchema = z.object({
  hostel_name: z
    .string({ required_error: 'Hostel name is required' })
    .trim()
    .min(2, 'Hostel name must be at least 2 characters')
    .max(100, 'Hostel name cannot exceed 100 characters'),

  hostel_block: z
    .string({ required_error: 'Hostel block is required' })
    .trim()
    .min(1, 'Hostel block is required')
    .max(1, 'Hostel block must be a single character')
    .transform((value) => value.toUpperCase()),

  block_gender: z.enum(BLOCK_GENDERS, {
    errorMap: () => ({
      message: 'Block gender must be either male or female',
    }),
  }),

  total_floors: z.coerce
    .number({ required_error: 'Total floors is required' })
    .int('Total floors must be a whole number')
    .min(1, 'Must have at least 1 floor')
    .max(10, 'Cannot exceed 10 floors'),

  rooms_per_floor: z.coerce
    .number({ required_error: 'Rooms per floor is required' })
    .int('Rooms per floor must be a whole number')
    .min(1, 'Must have at least 1 room per floor')
    .max(20, 'Cannot exceed 20 rooms per floor'),

  default_capacity: z.coerce
    .number()
    .int('Default capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(6, 'Capacity cannot exceed 6')
    .default(3),
});

/**
 * Generate rooms validation
 */
export const generateRoomsSchema = z.object({
  hostel_block: z
    .string({ required_error: 'Hostel block is required' })
    .trim()
    .min(1, 'Hostel block is required')
    .max(1, 'Hostel block must be a single character')
    .transform((value) => value.toUpperCase()),
});

/**
 * Manual allocate validation
 */
export const allocateRoomSchema = z.object({
  student_id: z
    .string({ required_error: 'Student ID is required' })
    .trim()
    .min(1, 'Student ID is required'),

  room_id: z
    .string({ required_error: 'Room ID is required' })
    .trim()
    .min(1, 'Room ID is required'),
});