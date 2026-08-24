'use server'

import { revalidatePath } from 'next/cache'
import { getUserProfile } from '@/lib/supabase/server'
import {
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
} from '@/lib/services/beneficiary'
import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
  CreateBeneficiaryInput,
  UpdateBeneficiaryInput,
} from '@/lib/validations/beneficiary'
import { Beneficiary } from '@/lib/supabase/database.types'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T | null
  error?: string | null
  fieldErrors?: Record<string, string[]>
}

/**
 * Server Action: Create a new beneficiary profile (Admin only).
 */
export async function createBeneficiaryAction(
  rawInput: CreateBeneficiaryInput
): Promise<ActionResult<Beneficiary>> {
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
        error: 'Forbidden. Only administrators can manage beneficiaries.',
      }
    }

    // 2. Schema Validation
    const validation = createBeneficiarySchema.safeParse(rawInput)
    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of validation.error.issues) {
        const fieldName = issue.path.join('.')
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = []
        }
        fieldErrors[fieldName].push(issue.message)
      }
      return {
        success: false,
        error: 'Invalid beneficiary data submitted.',
        fieldErrors,
      }
    }

    // 3. Delegate to Service Layer
    const { data, error } = await createBeneficiary(validation.data)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to create beneficiary record.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/dashboard/beneficiaries')

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
 * Server Action: Update an existing beneficiary profile (Admin only).
 */
export async function updateBeneficiaryAction(
  id: string,
  rawInput: UpdateBeneficiaryInput
): Promise<ActionResult<Beneficiary>> {
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
        error: 'Forbidden. Only administrators can update beneficiaries.',
      }
    }

    if (!id) {
      return {
        success: false,
        error: 'Beneficiary ID is required.',
      }
    }

    // 2. Schema Validation
    const validation = updateBeneficiarySchema.safeParse(rawInput)
    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of validation.error.issues) {
        const fieldName = issue.path.join('.')
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = []
        }
        fieldErrors[fieldName].push(issue.message)
      }
      return {
        success: false,
        error: 'Invalid update data submitted.',
        fieldErrors,
      }
    }

    // 3. Delegate to Service Layer
    const { data, error } = await updateBeneficiary(id, validation.data)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to update beneficiary record.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/dashboard/beneficiaries')
    revalidatePath(`/dashboard/beneficiaries/${id}`)

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
 * Server Action: Delete a beneficiary record (Admin only).
 */
export async function deleteBeneficiaryAction(
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
        error: 'Forbidden. Only administrators can delete beneficiaries.',
      }
    }

    if (!id) {
      return {
        success: false,
        error: 'Beneficiary ID is required.',
      }
    }

    // 2. Delegate to Service Layer
    const { data, error } = await deleteBeneficiary(id)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to delete beneficiary record.',
      }
    }

    // 3. Cache Invalidation
    revalidatePath('/dashboard/beneficiaries')

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
