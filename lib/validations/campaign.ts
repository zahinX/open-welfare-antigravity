import { z } from 'zod'

export const campaignStatusSchema = z.enum(['draft', 'active', 'completed', 'cancelled'])

export const createCampaignSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' })
    .max(200, { message: 'Title cannot exceed 200 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' }),
  target_amount: z
    .coerce
    .number()
    .min(0, { message: 'Target amount cannot be negative' })
    .default(0),
  status: campaignStatusSchema.default('draft'),
  deadline_at: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Deadline must be a valid datetime string',
    })
    .transform((val) => (val ? new Date(val).toISOString() : null))
    .nullable()
    .optional(),
})

export const updateCampaignSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' })
    .max(200, { message: 'Title cannot exceed 200 characters' })
    .optional(),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' })
    .optional(),
  target_amount: z
    .coerce
    .number()
    .min(0, { message: 'Target amount cannot be negative' })
    .optional(),
  current_amount: z
    .coerce
    .number()
    .min(0, { message: 'Current amount cannot be negative' })
    .optional(),
  status: campaignStatusSchema.optional(),
  deadline_at: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Deadline must be a valid datetime string',
    })
    .transform((val) => (val ? new Date(val).toISOString() : null))
    .nullable()
    .optional(),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
