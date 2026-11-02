import { createClient } from '@/lib/supabase/server'
import {
  Beneficiary,
  BeneficiaryInsert,
  BeneficiaryUpdate,
  BeneficiaryStatus,
} from '@/lib/supabase/database.types'

export interface GetBeneficiariesOptions {
  status?: BeneficiaryStatus
  search?: string
  limit?: number
  offset?: number
}

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
}

export interface BeneficiaryWithStats extends Beneficiary {
  total_disbursed: number
  disbursement_count: number
}

/**
 * Retrieve a list of beneficiaries, optionally filtered by status and search keyword.
 */
export async function getBeneficiaries(
  options: GetBeneficiariesOptions = {}
): Promise<ServiceResponse<Beneficiary[]>> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('beneficiaries')
      .select('*')
      .order('created_at', { ascending: false })

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.search && options.search.trim() !== '') {
      const term = `%${options.search.trim()}%`
      query = query.or(`full_name.ilike.${term},contact_phone.ilike.${term},address.ilike.${term}`)
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

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching beneficiaries',
    }
  }
}

/**
 * Retrieve a single beneficiary by ID.
 */
export async function getBeneficiaryById(
  id: string
): Promise<ServiceResponse<Beneficiary>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('beneficiaries')
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
      error: err instanceof Error ? err.message : 'Unknown error fetching beneficiary',
    }
  }
}

/**
 * Retrieve a single beneficiary by ID with aggregated disbursement statistics (derived disbursed state).
 */
export async function getBeneficiaryWithStats(
  id: string
): Promise<ServiceResponse<BeneficiaryWithStats>> {
  try {
    const supabase = await createClient()
    const { data: beneficiary, error: bError } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', id)
      .single()

    if (bError || !beneficiary) {
      return { data: null, error: bError?.message || 'Beneficiary not found' }
    }

    const { data: disbursements, error: dError } = await supabase
      .from('disbursements')
      .select('amount_value')
      .eq('beneficiary_id', id)

    if (dError) {
      return { data: null, error: dError.message }
    }

    const disbursement_count = disbursements?.length || 0
    const total_disbursed = disbursements?.reduce(
      (acc, curr) => acc + (Number(curr.amount_value) || 0),
      0
    ) || 0

    return {
      data: {
        ...beneficiary,
        total_disbursed,
        disbursement_count,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching beneficiary stats',
    }
  }
}

/**
 * Create a new beneficiary record.
 */
export async function createBeneficiary(
  payload: BeneficiaryInsert
): Promise<ServiceResponse<Beneficiary>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('beneficiaries')
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
      error: err instanceof Error ? err.message : 'Unknown error creating beneficiary',
    }
  }
}

/**
 * Update an existing beneficiary record.
 */
export async function updateBeneficiary(
  id: string,
  payload: BeneficiaryUpdate
): Promise<ServiceResponse<Beneficiary>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('beneficiaries')
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
      error: err instanceof Error ? err.message : 'Unknown error updating beneficiary',
    }
  }
}

/**
 * Delete a beneficiary record by ID.
 */
export async function deleteBeneficiary(
  id: string
): Promise<ServiceResponse<boolean>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', id)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: true, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error deleting beneficiary',
    }
  }
}
