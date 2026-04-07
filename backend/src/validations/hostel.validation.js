import { z } from 'zod';

/**
 * Hostel config schema
 *
 * We use z.coerce.number() because form inputs usually send values as strings.
 * Example:
 *   "3" → automatically converted to 3
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
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z]$/.test(value), {
      message: 'Hostel block must be a single uppercase letter like A or B',
    }),

  total_floors: z.coerce
    .number({ required_error: 'Total floors is required' })
    .int('Total floors must be a whole number')
    .min(1, 'Total floors must be at least 1')
    .max(10, 'Total floors cannot exceed 10'),

  rooms_per_floor: z.coerce
    .number({ required_error: 'Rooms per floor is required' })
    .int('Rooms per floor must be a whole number')
    .min(1, 'Rooms per floor must be at least 1')
    .max(20, 'Rooms per floor cannot exceed 20'),

  default_capacity: z.coerce
    .number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(6, 'Capacity cannot exceed 6')
    .optional(),
});

/**
 * Generate rooms schema
 *
 * Admin only needs to specify the block.
 * The backend reads the rest from HostelConfig.
 */
export const generateRoomsSchema = z.object({
  hostel_block: z
    .string({ required_error: 'Hostel block is required' })
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z]$/.test(value), {
      message: 'Hostel block must be a single uppercase letter',
    }),
});

/**
 * Allocate room schema
 *
 * Admin chooses:
 * - which student
 * - which room
 *
 * Bed number is assigned automatically by backend.
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