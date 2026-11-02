'use server'

import { revalidatePath } from 'next/cache'
import { getUserProfile } from '@/lib/supabase/server'
import {
  createDisbursement,
  updateDisbursement,
  deleteDisbursement,
} from '@/lib/services/disbursement'
import {
  createDisbursementSchema,
  updateDisbursementSchema,
  CreateDisbursementInput,
  UpdateDisbursementInput,
} from '@/lib/validations/disbursement'
import { Disbursement } from '@/lib/supabase/database.types'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T | null
  error?: string | null
  fieldErrors?: Record<string, string[]>
}

/**
 * Server Action: Record a new disbursement (Admin only).
 */
export async function createDisbursementAction(
  rawInput: CreateDisbursementInput
): Promise<ActionResult<Disbursement>> {
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
        error: 'Forbidden. Only administrators can log disbursements.',
      }
    }

    // 2. Schema Validation
    const validation = createDisbursementSchema.safeParse(rawInput)
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
        error: 'Invalid disbursement data submitted.',
        fieldErrors,
      }
    }

    // 3. Delegate to Service Layer (with logged_by set to active admin user)
    const { data, error } = await createDisbursement({
      ...validation.data,
      logged_by: authData.user.id,
    })

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to record disbursement.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/dashboard/beneficiaries')
    revalidatePath(`/dashboard/beneficiaries/${validation.data.beneficiary_id}`)
    if (validation.data.campaign_id) {
      revalidatePath(`/dashboard/campaigns/${validation.data.campaign_id}`)
      revalidatePath('/dashboard/campaigns')
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

/**
 * Server Action: Update an existing disbursement log (Admin only).
 */
export async function updateDisbursementAction(
  id: string,
  rawInput: UpdateDisbursementInput
): Promise<ActionResult<Disbursement>> {
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
        error: 'Forbidden. Only administrators can update disbursements.',
      }
    }

    if (!id) {
      return {
        success: false,
        error: 'Disbursement ID is required.',
      }
    }

    // 2. Schema Validation
    const validation = updateDisbursementSchema.safeParse(rawInput)
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
    const { data, error } = await updateDisbursement(id, validation.data)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to update disbursement.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/dashboard/beneficiaries')
    if (data.beneficiary_id) {
      revalidatePath(`/dashboard/beneficiaries/${data.beneficiary_id}`)
    }
    if (data.campaign_id) {
      revalidatePath(`/dashboard/campaigns/${data.campaign_id}`)
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

/**
 * Server Action: Delete a disbursement log (Admin only).
 */
export async function deleteDisbursementAction(
  id: string,
  beneficiaryId?: string
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
        error: 'Forbidden. Only administrators can delete disbursements.',
      }
    }

    if (!id) {
      return {
        success: false,
        error: 'Disbursement ID is required.',
      }
    }

    // 2. Delegate to Service Layer
    const { data, error } = await deleteDisbursement(id)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to delete disbursement.',
      }
    }

    // 3. Cache Invalidation
    revalidatePath('/dashboard/beneficiaries')
    if (beneficiaryId) {
      revalidatePath(`/dashboard/beneficiaries/${beneficiaryId}`)
    }

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
