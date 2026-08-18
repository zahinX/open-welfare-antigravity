import { z } from 'zod'

export const createDonationSchema = z.object({
  campaign_id: z.string().uuid({ message: 'Invalid campaign ID.' }),
  amount: z
    .coerce
    .number()
    .positive({ message: 'Donation amount must be greater than 0.' }),
  currency: z
    .string()
    .length(3, { message: 'Currency code must be a 3-letter ISO code.' })
    .transform((val) => val.toUpperCase().trim())
    .default('BDT'),
  donor_name: z
    .string()
    .max(100, { message: 'Donor name cannot exceed 100 characters.' })
    .optional()
    .nullable()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  donor_email: z
    .string()
    .email({ message: 'Please provide a valid email address for receipt.' })
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  payment_method: z
    .enum(['manual', 'cash', 'card', 'bkash', 'nagad', 'bank_transfer'])
    .default('manual'),
  is_anonymous: z.boolean().default(false),
})

export type CreateDonationInput = z.infer<typeof createDonationSchema>
export type CreateDonationRawInput = z.input<typeof createDonationSchema>
