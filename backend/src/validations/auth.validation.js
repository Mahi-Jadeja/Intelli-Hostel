import { z } from 'zod';

/**
 * Registration validation schema
 *
 * Validates the body of POST /api/v1/auth/register
 * NOTICE: There is NO "role" field here!
 * Users can ONLY register as students.
 * Admin accounts are created via the seed script.
 */
export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      // Shows when the field is completely missing from the body
    })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email')
    .toLowerCase(),
  // .toLowerCase() transforms the value (just like our Mongoose schema)
  // Zod can both VALIDATE and TRANSFORM data

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  // We could add regex for "must contain uppercase, number, symbol"
  // but for a college project, minimum length is sufficient
});
// Notice: registerSchema does NOT include 'role'
// Even if someone sends { role: "admin" } in the body,
// Zod's .parse() will strip it out because it's not in the schema
// This is the FIX for your teammate's critical vulnerability!

/**
 * Login validation schema
 *
 * Validates the body of POST /api/v1/auth/login
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
  // min(1) instead of min(6) because we're checking the password
  // against the database, not validating if it's "strong enough"
  // If someone has an old password with 4 chars, they should still login
});