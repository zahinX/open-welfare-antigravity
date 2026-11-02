import { createClient } from '@/lib/supabase/server'
import {
  Disbursement,
  DisbursementInsert,
  DisbursementUpdate,
} from '@/lib/supabase/database.types'

export interface GetDisbursementsOptions {
  beneficiaryId?: string
  campaignId?: string
  limit?: number
  offset?: number
}

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
}

export interface DisbursementWithDetails extends Disbursement {
  beneficiaries?: {
    id: string
    full_name: string
    contact_phone: string | null
    status: string
  } | null
  campaigns?: {
    id: string
    title: string
    currency: string
  } | null
  profiles?: {
    id: string
    full_name: string
  } | null
}

export interface DisbursementStats {
  totalAmount: number
  totalCount: number
}

/**
 * Retrieve a list of disbursements with related beneficiary and campaign metadata.
 */
export async function getDisbursements(
  options: GetDisbursementsOptions = {}
): Promise<ServiceResponse<DisbursementWithDetails[]>> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('disbursements')
      .select(`
        *,
        beneficiaries:beneficiary_id (id, full_name, contact_phone, status),
        campaigns:campaign_id (id, title, currency),
        profiles:logged_by (id, full_name)
      `)
      .order('disbursed_at', { ascending: false })

    if (options.beneficiaryId) {
      query = query.eq('beneficiary_id', options.beneficiaryId)
    }

    if (options.campaignId) {
      query = query.eq('campaign_id', options.campaignId)
    }

    if (typeof options.offset === 'number' && options.offset > 0) {
      const limit = options.limit || 20
      query = query.range(options.offset, options.offset + limit - 1)
    } else if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as unknown as DisbursementWithDetails[], error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching disbursements',
    }
  }
}

/**
 * Convenience helper: Retrieve disbursements for a specific beneficiary.
 */
export async function getDisbursementsByBeneficiary(
  beneficiaryId: string
): Promise<ServiceResponse<DisbursementWithDetails[]>> {
  return getDisbursements({ beneficiaryId })
}

/**
 * Convenience helper: Retrieve disbursements funded by a specific campaign.
 */
export async function getDisbursementsByCampaign(
  campaignId: string
): Promise<ServiceResponse<DisbursementWithDetails[]>> {
  return getDisbursements({ campaignId })
}

/**
 * Retrieve a single disbursement by ID with linked metadata.
 */
export async function getDisbursementById(
  id: string
): Promise<ServiceResponse<DisbursementWithDetails>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('disbursements')
      .select(`
        *,
        beneficiaries:beneficiary_id (id, full_name, contact_phone, status),
        campaigns:campaign_id (id, title, currency),
        profiles:logged_by (id, full_name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as unknown as DisbursementWithDetails, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching disbursement',
    }
  }
}

/**
 * Create a new disbursement record.
 */
export async function createDisbursement(
  payload: DisbursementInsert
): Promise<ServiceResponse<Disbursement>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('disbursements')
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
      error: err instanceof Error ? err.message : 'Unknown error creating disbursement',
    }
  }
}

/**
 * Update an existing disbursement record.
 */
export async function updateDisbursement(
  id: string,
  payload: DisbursementUpdate
): Promise<ServiceResponse<Disbursement>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('disbursements')
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
      error: err instanceof Error ? err.message : 'Unknown error updating disbursement',
    }
  }
}

/**
 * Delete a disbursement record by ID.
 */
export async function deleteDisbursement(
  id: string
): Promise<ServiceResponse<boolean>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('disbursements')
      .delete()
      .eq('id', id)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: true, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error deleting disbursement',
    }
  }
}

/**
 * Aggregate summary statistics for all disbursements.
 */
export async function getDisbursementStats(): Promise<ServiceResponse<DisbursementStats>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('disbursements')
      .select('amount_value')

    if (error) {
      return { data: null, error: error.message }
    }

    const totalCount = data?.length || 0
    const totalAmount = data?.reduce(
      (acc, item) => acc + (Number(item.amount_value) || 0),
      0
    ) || 0

    return {
      data: {
        totalAmount,
        totalCount,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error calculating disbursement stats',
    }
  }
}
