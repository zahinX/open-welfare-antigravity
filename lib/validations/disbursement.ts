import { z } from 'zod'

export const createDisbursementSchema = z.object({
  beneficiary_id: z
    .string()
    .uuid({ message: 'Valid beneficiary ID is required' }),
  campaign_id: z
    .string()
    .uuid({ message: 'Campaign ID must be a valid UUID' })
    .or(z.literal(''))
    .nullable()
    .optional()
    .transform((val) => (val && typeof val === 'string' && val.trim() !== '' ? val.trim() : null)),
  amount_value: z.coerce
    .number()
    .min(0.01, { message: 'Disbursement amount must be greater than 0' }),
  description: z
    .string()
    .min(3, { message: 'Description must be at least 3 characters long' })
    .max(1000, { message: 'Description cannot exceed 1000 characters' }),
  disbursed_at: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Disbursed date must be a valid datetime string',
    })
    .transform((val) => (val ? new Date(val).toISOString() : new Date().toISOString())),
})

export const updateDisbursementSchema = z.object({
  beneficiary_id: z
    .string()
    .uuid({ message: 'Valid beneficiary ID is required' })
    .optional(),
  campaign_id: z
    .string()
    .uuid({ message: 'Campaign ID must be a valid UUID' })
    .or(z.literal(''))
    .nullable()
    .optional()
    .transform((val) => (val && typeof val === 'string' && val.trim() !== '' ? val.trim() : null)),
  amount_value: z.coerce
    .number()
    .min(0.01, { message: 'Disbursement amount must be greater than 0' })
    .optional(),
  description: z
    .string()
    .min(3, { message: 'Description must be at least 3 characters long' })
    .max(1000, { message: 'Description cannot exceed 1000 characters' })
    .optional(),
  disbursed_at: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Disbursed date must be a valid datetime string',
    })
    .transform((val) => (val ? new Date(val).toISOString() : undefined)),
})

export type CreateDisbursementInput = z.input<typeof createDisbursementSchema>
export type UpdateDisbursementInput = z.input<typeof updateDisbursementSchema>
export type CreateDisbursementOutput = z.infer<typeof createDisbursementSchema>
export type UpdateDisbursementOutput = z.infer<typeof updateDisbursementSchema>
