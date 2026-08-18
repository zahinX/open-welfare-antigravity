import { z } from 'zod'

export const analyticsFilterSchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid start date format',
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid end date format',
    }),
  campaignId: z.string().uuid('Invalid campaign ID').optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
})

export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>

export const exportReportSchema = z.object({
  type: z.enum(['financial', 'campaigns', 'beneficiaries', 'volunteers'], {
    message: 'Invalid report type specified',
  }),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid start date format',
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid end date format',
    }),
  campaignId: z.string().uuid('Invalid campaign ID').optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
})

export type ExportReportInput = z.infer<typeof exportReportSchema>
