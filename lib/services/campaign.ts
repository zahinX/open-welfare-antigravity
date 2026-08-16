import { createClient } from '@/lib/supabase/server'
import { Campaign, CampaignInsert, CampaignUpdate, CampaignStatus } from '@/lib/supabase/database.types'

export interface GetCampaignsOptions {
  status?: CampaignStatus
  limit?: number
}

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
}

/**
 * Retrieve a list of campaigns, optionally filtered by status and limited in quantity.
 */
export async function getCampaigns(
  options: GetCampaignsOptions = {}
): Promise<ServiceResponse<Campaign[]>> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching campaigns',
    }
  }
}

/**
 * Retrieve a single campaign by its UUID.
 */
export async function getCampaignById(
  id: string
): Promise<ServiceResponse<Campaign>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching campaign',
    }
  }
}

/**
 * Create a new campaign.
 */
export async function createCampaign(
  payload: CampaignInsert
): Promise<ServiceResponse<Campaign>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('campaigns')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error creating campaign',
    }
  }
}

/**
 * Update an existing campaign by ID.
 */
export async function updateCampaign(
  id: string,
  payload: CampaignUpdate
): Promise<ServiceResponse<Campaign>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('campaigns')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error updating campaign',
    }
  }
}

/**
 * Delete a campaign by ID.
 */
export async function deleteCampaign(
  id: string
): Promise<ServiceResponse<boolean>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: true, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error deleting campaign',
    }
  }
}
