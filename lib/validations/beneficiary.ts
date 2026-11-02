import { z } from 'zod'

export const beneficiaryStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'inactive',
])

export const createBeneficiarySchema = z.object({
  full_name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters long' })
    .max(200, { message: 'Full name cannot exceed 200 characters' }),
  contact_phone: z
    .string()
    .max(30, { message: 'Contact phone cannot exceed 30 characters' })
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  address: z
    .string()
    .max(500, { message: 'Address cannot exceed 500 characters' })
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  family_size: z.coerce
    .number()
    .int({ message: 'Family size must be an integer' })
    .min(1, { message: 'Family size must be at least 1' })
    .default(1),
  assessment_notes: z
    .string()
    .max(2000, { message: 'Assessment notes cannot exceed 2000 characters' })
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  status: beneficiaryStatusSchema.default('pending'),
})

export const updateBeneficiarySchema = z.object({
  full_name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters long' })
    .max(200, { message: 'Full name cannot exceed 200 characters' })
    .optional(),
  contact_phone: z
    .string()
    .max(30, { message: 'Contact phone cannot exceed 30 characters' })
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  address: z
    .string()
    .max(500, { message: 'Address cannot exceed 500 characters' })
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  family_size: z.coerce
    .number()
    .int({ message: 'Family size must be an integer' })
    .min(1, { message: 'Family size must be at least 1' })
    .optional(),
  assessment_notes: z
    .string()
    .max(2000, { message: 'Assessment notes cannot exceed 2000 characters' })
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  status: beneficiaryStatusSchema.optional(),
})

export type CreateBeneficiaryInput = z.input<typeof createBeneficiarySchema>
export type UpdateBeneficiaryInput = z.input<typeof updateBeneficiarySchema>
export type CreateBeneficiaryOutput = z.infer<typeof createBeneficiarySchema>
export type UpdateBeneficiaryOutput = z.infer<typeof updateBeneficiarySchema>
