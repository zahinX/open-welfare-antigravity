'use server'

import { revalidatePath } from 'next/cache'
import { getUserProfile } from '@/lib/supabase/server'
import {
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '@/lib/services/campaign'
import {
  createCampaignSchema,
  updateCampaignSchema,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '@/lib/validations/campaign'
import { Campaign } from '@/lib/supabase/database.types'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T | null
  error?: string | null
  fieldErrors?: Record<string, string[]>
}

/**
 * Server Action: Create a new campaign (Admin only).
 */
export async function createCampaignAction(
  rawInput: CreateCampaignInput
): Promise<ActionResult<Campaign>> {
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
        error: 'Forbidden. Only administrators can create campaigns.',
      }
    }

    // 2. Schema Validation
    const validation = createCampaignSchema.safeParse(rawInput)
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
        error: 'Invalid campaign data submitted.',
        fieldErrors,
      }
    }

    // 3. Delegate to Service Layer
    const { data, error } = await createCampaign({
      ...validation.data,
      created_by: authData.user.id,
    })

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to create campaign.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidatePath('/campaigns')

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
 * Server Action: Update an existing campaign (Admin only).
 */
export async function updateCampaignAction(
  id: string,
  rawInput: UpdateCampaignInput
): Promise<ActionResult<Campaign>> {
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
        error: 'Forbidden. Only administrators can update campaigns.',
      }
    }

    if (!id) {
      return {
        success: false,
        error: 'Campaign ID is required.',
      }
    }

    // 2. Schema Validation
    const validation = updateCampaignSchema.safeParse(rawInput)
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
    const { data, error } = await updateCampaign(id, validation.data)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to update campaign.',
      }
    }

    // 4. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    revalidatePath('/campaigns')
    revalidatePath(`/campaigns/${id}`)

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
 * Server Action: Delete a campaign (Admin only).
 */
export async function deleteCampaignAction(
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
        error: 'Forbidden. Only administrators can delete campaigns.',
      }
    }

    if (!id) {
      return {
        success: false,
        error: 'Campaign ID is required.',
      }
    }

    // 2. Delegate to Service Layer
    const { data, error } = await deleteCampaign(id)

    if (error || !data) {
      return {
        success: false,
        error: error || 'Failed to delete campaign.',
      }
    }

    // 3. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidatePath('/campaigns')

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
