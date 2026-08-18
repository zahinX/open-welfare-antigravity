import { z } from 'zod'

export const createShiftSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters long' })
      .max(200, { message: 'Title cannot exceed 200 characters' }),
    description: z
      .string()
      .min(5, { message: 'Description must be at least 5 characters long' })
      .max(2000, { message: 'Description cannot exceed 2000 characters' }),
    location: z
      .string()
      .min(2, { message: 'Location must be at least 2 characters long' })
      .max(300, { message: 'Location cannot exceed 300 characters' }),
    start_time: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Start time must be a valid datetime',
      })
      .transform((val) => new Date(val).toISOString()),
    end_time: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'End time must be a valid datetime',
      })
      .transform((val) => new Date(val).toISOString()),
    max_volunteers: z.coerce
      .number()
      .int({ message: 'Max volunteers must be an integer' })
      .min(1, { message: 'Max volunteers must be at least 1' }),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_time).getTime()
      const end = new Date(data.end_time).getTime()
      return end > start
    },
    {
      message: 'End time must be strictly after start time',
      path: ['end_time'],
    }
  )

export const updateShiftSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters long' })
      .max(200, { message: 'Title cannot exceed 200 characters' })
      .optional(),
    description: z
      .string()
      .min(5, { message: 'Description must be at least 5 characters long' })
      .max(2000, { message: 'Description cannot exceed 2000 characters' })
      .optional(),
    location: z
      .string()
      .min(2, { message: 'Location must be at least 2 characters long' })
      .max(300, { message: 'Location cannot exceed 300 characters' })
      .optional(),
    start_time: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Start time must be a valid datetime',
      })
      .transform((val) => new Date(val).toISOString())
      .optional(),
    end_time: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'End time must be a valid datetime',
      })
      .transform((val) => new Date(val).toISOString())
      .optional(),
    max_volunteers: z.coerce
      .number()
      .int({ message: 'Max volunteers must be an integer' })
      .min(1, { message: 'Max volunteers must be at least 1' })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        const start = new Date(data.start_time).getTime()
        const end = new Date(data.end_time).getTime()
        return end > start
      }
      return true
    },
    {
      message: 'End time must be strictly after start time',
      path: ['end_time'],
    }
  )

export const signUpSchema = z.object({
  shift_id: z.string().uuid({ message: 'A valid shift ID is required' }),
})

export const markAttendanceSchema = z.object({
  signup_id: z.string().uuid({ message: 'A valid signup ID is required' }),
  attended: z.boolean(),
})

export type CreateShiftInput = z.input<typeof createShiftSchema>
export type CreateShiftOutput = z.infer<typeof createShiftSchema>
export type UpdateShiftInput = z.input<typeof updateShiftSchema>
export type UpdateShiftOutput = z.infer<typeof updateShiftSchema>
export type SignUpInput = z.input<typeof signUpSchema>
export type MarkAttendanceInput = z.input<typeof markAttendanceSchema>
