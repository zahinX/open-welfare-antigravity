'use server'

import { revalidatePath } from 'next/cache'
import { getUserProfile } from '@/lib/supabase/server'
import {
  createShift,
  updateShift,
  deleteShift,
  signUpForShift,
  cancelSignUp,
  markAttendance,
} from '@/lib/services/volunteer'
import {
  createShiftSchema,
  updateShiftSchema,
  signUpSchema,
  markAttendanceSchema,
  CreateShiftInput,
  UpdateShiftInput,
  SignUpInput,
  MarkAttendanceInput,
} from '@/lib/validations/volunteer'
import { VolunteerShift, VolunteerSignup } from '@/lib/supabase/database.types'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T | null
  error?: string | null
  fieldErrors?: Record<string, string[]>
}

/**
 * Helper to extract formatted Zod validation issues.
 */
function formatZodErrors(issues: Array<{ path: (string | number | symbol)[]; message: string }>): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of issues) {
    const fieldName = issue.path.map(String).join('.')
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = []
    }
    fieldErrors[fieldName].push(issue.message)
  }
  return fieldErrors
}

/**
 * Server Action: Create a new volunteer shift (Admin only).
 */
export async function createShiftAction(
  rawInput: CreateShiftInput
): Promise<ActionResult<VolunteerShift>> {
  try {
    // 1. Auth & Admin Role Check
    const authData = await getUserProfile()
    if (!authData || !authData.user) {
      return {
        success: false,
        error: 'Unauthorized. You must be logged in.',
      }
    }

    if (authData.profile.role !== 'admin') {
      return {
        success: false,
        error: 'Forbidden. Only administrators can create volunteer shifts.',
      }
    }

    // 2. Schema Validation
    const validation = createShiftSchema.safeParse(rawInput)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid shift data submitted.',
        fieldErrors: formatZodErrors(validation.error.issues),
      }
    }

    // 3. Delegate to Service Layer
    const { data, error } = await createShift({
      ...validation.data,
      created_by: authData.user.id,
    })

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to create volunteer shift.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/dashboard/volunteers/shifts')
    revalidatePath('/volunteer')

    return {
      success: true,
      data,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Update an existing volunteer shift (Admin only).
 */
export async function updateShiftAction(
  id: string,
  rawInput: UpdateShiftInput
): Promise<ActionResult<VolunteerShift>> {
  try {
    // 1. Auth & Admin Role Check
    const authData = await getUserProfile()
    if (!authData || !authData.user) {
      return {
        success: false,
        error: 'Unauthorized. You must be logged in.',
      }
    }

    if (authData.profile.role !== 'admin') {
      return {
        success: false,
        error: 'Forbidden. Only administrators can update volunteer shifts.',
      }
    }

    if (!id) {
      return {
        success: false,
        error: 'Shift ID is required.',
      }
    }

    // 2. Schema Validation
    const validation = updateShiftSchema.safeParse(rawInput)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid update data submitted.',
        fieldErrors: formatZodErrors(validation.error.issues),
      }
    }

    // 3. Delegate to Service Layer
    const { data, error } = await updateShift(id, validation.data)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to update volunteer shift.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/dashboard/volunteers/shifts')
    revalidatePath(`/dashboard/volunteers/shifts/${id}`)
    revalidatePath('/volunteer')

    return {
      success: true,
      data,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Delete a volunteer shift (Admin only).
 */
export async function deleteShiftAction(
  id: string
): Promise<ActionResult<boolean>> {
  try {
    // 1. Auth & Admin Role Check
    const authData = await getUserProfile()
    if (!authData || !authData.user) {
      return {
        success: false,
        error: 'Unauthorized. You must be logged in.',
      }
    }

    if (authData.profile.role !== 'admin') {
      return {
        success: false,
        error: 'Forbidden. Only administrators can delete volunteer shifts.',
      }
    }

    if (!id) {
      return {
        success: false,
        error: 'Shift ID is required.',
      }
    }

    // 2. Delegate to Service Layer
    const { data, error } = await deleteShift(id)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to delete volunteer shift.',
      }
    }

    // 3. Cache Invalidation
    revalidatePath('/dashboard/volunteers/shifts')
    revalidatePath('/volunteer')

    return {
      success: true,
      data: true,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Sign up for a volunteer shift (Authenticated users).
 */
export async function signUpAction(
  rawInput: SignUpInput
): Promise<ActionResult<VolunteerSignup>> {
  try {
    // 1. Auth Check
    const authData = await getUserProfile()
    if (!authData || !authData.user) {
      return {
        success: false,
        error: 'Unauthorized. You must be logged in to sign up for a volunteer shift.',
      }
    }

    // 2. Schema Validation
    const validation = signUpSchema.safeParse(rawInput)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid shift sign-up request.',
        fieldErrors: formatZodErrors(validation.error.issues),
      }
    }

    // 3. Delegate to Service Layer (Includes capacity check)
    const { data, error } = await signUpForShift(validation.data.shift_id, authData.user.id)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to sign up for shift.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/volunteer')
    revalidatePath('/volunteer/profile')
    revalidatePath(`/dashboard/volunteers/shifts/${validation.data.shift_id}`)

    return {
      success: true,
      data,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Cancel a volunteer shift sign-up (Authenticated users).
 */
export async function cancelSignUpAction(
  shiftId: string
): Promise<ActionResult<boolean>> {
  try {
    // 1. Auth Check
    const authData = await getUserProfile()
    if (!authData || !authData.user) {
      return {
        success: false,
        error: 'Unauthorized. You must be logged in.',
      }
    }

    if (!shiftId) {
      return {
        success: false,
        error: 'Shift ID is required.',
      }
    }

    // 2. Delegate to Service Layer
    const { data, error } = await cancelSignUp(shiftId, authData.user.id)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to cancel shift signup.',
      }
    }

    // 3. Cache Invalidation
    revalidatePath('/volunteer')
    revalidatePath('/volunteer/profile')
    revalidatePath(`/dashboard/volunteers/shifts/${shiftId}`)

    return {
      success: true,
      data: true,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Mark attendance for a volunteer sign-up (Admin only).
 */
export async function markAttendanceAction(
  rawInput: MarkAttendanceInput,
  shiftId?: string
): Promise<ActionResult<VolunteerSignup>> {
  try {
    // 1. Auth & Admin Role Check
    const authData = await getUserProfile()
    if (!authData || !authData.user) {
      return {
        success: false,
        error: 'Unauthorized. You must be logged in.',
      }
    }

    if (authData.profile.role !== 'admin') {
      return {
        success: false,
        error: 'Forbidden. Only administrators can mark attendance.',
      }
    }

    // 2. Schema Validation
    const validation = markAttendanceSchema.safeParse(rawInput)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid attendance data submitted.',
        fieldErrors: formatZodErrors(validation.error.issues),
      }
    }

    // 3. Delegate to Service Layer
    const { data, error } = await markAttendance(validation.data.signup_id, validation.data.attended)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to update attendance record.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/dashboard/volunteers/shifts')
    if (shiftId) {
      revalidatePath(`/dashboard/volunteers/shifts/${shiftId}`)
    }

    return {
      success: true,
      data,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}
