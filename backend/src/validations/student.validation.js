import { z } from 'zod';

/**
 * Profile update validation schema
 *
 * Students can update:
 *   ✅ Personal: name, phone, gender, dob, profile_pic
 *   ✅ Academic: college_id, branch, year, semester
 *   ✅ Guardian: guardian.name, guardian.phone
 *
 * Students CANNOT update (controlled by admin):
 *   ❌ email, user_id
 *   ❌ room_no, hostel_block, floor, bed_no
 *   ❌ is_active, is_hosteller
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),

  phone: z
    .string()
    .trim()
    .max(15, 'Phone number cannot exceed 15 characters')
    .optional(),

  gender: z
    .enum(['male', 'female', 'other', ''], {
      errorMap: () => ({ message: 'Gender must be male, female, or other' }),
    })
    .optional(),

  dob: z
    .string()
    .optional(),
    // We accept a date string (e.g., "2000-05-15")
    // The controller will convert it to a Date object if needed

  profile_pic: z
    .string()
    .max(500000, 'Profile picture data is too large')
    .optional(),
    // For now we accept a base64 string or URL
    // In production you'd use file upload to S3/Cloudinary

  college_id: z
    .string()
    .trim()
    .max(30, 'College ID cannot exceed 30 characters')
    .optional(),

  branch: z
    .string()
    .trim()
    .max(50, 'Branch cannot exceed 50 characters')
    .optional(),

  year: z
    .number()
    .int('Year must be a whole number')
    .min(1, 'Year must be between 1 and 5')
    .max(5, 'Year must be between 1 and 5')
    .optional(),

  semester: z
    .number()
    .int('Semester must be a whole number')
    .min(1, 'Semester must be between 1 and 10')
    .max(10, 'Semester must be between 1 and 10')
    .optional(),

  guardian: z
    .object({
      name: z.string().trim().max(50, 'Guardian name too long').optional(),
      phone: z.string().trim().max(15, 'Guardian phone too long').optional(),
    })
    .optional(),
    // Nested object validation
    // Zod handles nested objects naturally
    // { guardian: { name: "Mrs. Smith", phone: "+91..." } }
});