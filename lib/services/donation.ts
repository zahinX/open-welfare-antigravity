import { createClient } from '@/lib/supabase/server'
import { Donation, DonationInsert } from '@/lib/supabase/database.types'
import { ServiceResponse } from './campaign'

/**
 * Record a new donation towards a campaign.
 */
export async function createDonation(
  payload: DonationInsert
): Promise<ServiceResponse<Donation>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('donations')
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
      error: err instanceof Error ? err.message : 'Unknown error recording donation',
    }
  }
}

/**
 * Retrieve all donations for a specific campaign (Admin / internal use).
 */
export async function getDonationsByCampaignId(
  campaignId: string
): Promise<ServiceResponse<Donation[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching donations',
    }
  }
}

/**
 * Retrieve recent public donations for a campaign (for public display with privacy considerations).
 */
export async function getRecentPublicDonations(
  campaignId: string,
  limit: number = 10
): Promise<ServiceResponse<Donation[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching public donations',
    }
  }
}

/**
 * Retrieve all donations made by a specific donor profile.
 */
export async function getDonationsByDonorId(
  donorId: string
): Promise<ServiceResponse<Donation[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', donorId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching donor history',
    }
  }
}
