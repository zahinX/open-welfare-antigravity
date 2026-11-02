import { createClient } from '@/lib/supabase/server'
import {
  VolunteerShift,
  VolunteerShiftInsert,
  VolunteerShiftUpdate,
  VolunteerSignup,
} from '@/lib/supabase/database.types'

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
}

export interface VolunteerShiftWithSignups extends VolunteerShift {
  signup_count: number
  spots_remaining: number
}

export interface VolunteerSignupWithProfile extends VolunteerSignup {
  profile?: {
    full_name: string
    phone: string | null
    role: string
  } | null
}

export interface VolunteerShiftDetail extends VolunteerShift {
  signups: VolunteerSignupWithProfile[]
  signup_count: number
  spots_remaining: number
}

export interface VolunteerSignupWithShift extends VolunteerSignup {
  shift?: VolunteerShift | null
}

export interface GetShiftsOptions {
  upcoming?: boolean
  search?: string
  limit?: number
  offset?: number
}

/**
 * Retrieve volunteer shifts with computed signup stats, optionally filtered by upcoming status or search keyword.
 */
export async function getShifts(
  options: GetShiftsOptions = {}
): Promise<ServiceResponse<VolunteerShiftWithSignups[]>> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('volunteer_shifts')
      .select('*, volunteer_signups(id)')
      .order('start_time', { ascending: true })

    if (options.upcoming) {
      query = query.gte('start_time', new Date().toISOString())
    }

    if (options.search && options.search.trim() !== '') {
      const term = `%${options.search.trim()}%`
      query = query.or(`title.ilike.${term},location.ilike.${term},description.ilike.${term}`)
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

    const shiftsWithSignups: VolunteerShiftWithSignups[] = (data || []).map((shift: any) => {
      const signups = shift.volunteer_signups || []
      const signup_count = Array.isArray(signups) ? signups.length : 0
      const spots_remaining = Math.max(0, Number(shift.max_volunteers) - signup_count)
      const { volunteer_signups: _, ...shiftData } = shift
      return {
        ...shiftData,
        signup_count,
        spots_remaining,
      }
    })

    return { data: shiftsWithSignups, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching volunteer shifts',
    }
  }
}

/**
 * Retrieve a single volunteer shift by ID with its full signup roster.
 */
export async function getShiftById(
  id: string
): Promise<ServiceResponse<VolunteerShiftDetail>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .select(`
        *,
        volunteer_signups (
          id,
          shift_id,
          user_id,
          attended,
          created_at,
          profiles:user_id (
            full_name,
            phone,
            role
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return { data: null, error: error?.message || 'Volunteer shift not found' }
    }

    const rawSignups = (data.volunteer_signups as any[]) || []
    const signups: VolunteerSignupWithProfile[] = rawSignups.map((s) => ({
      id: s.id,
      shift_id: s.shift_id,
      user_id: s.user_id,
      attended: s.attended,
      created_at: s.created_at,
      profile: s.profiles
        ? {
            full_name: s.profiles.full_name,
            phone: s.profiles.phone,
            role: s.profiles.role,
          }
        : null,
    }))

    const signup_count = signups.length
    const spots_remaining = Math.max(0, Number(data.max_volunteers) - signup_count)
    const { volunteer_signups: _, ...shiftData } = data

    return {
      data: {
        ...shiftData,
        signups,
        signup_count,
        spots_remaining,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching shift details',
    }
  }
}

/**
 * Create a new volunteer shift record.
 */
export async function createShift(
  payload: VolunteerShiftInsert
): Promise<ServiceResponse<VolunteerShift>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('volunteer_shifts')
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
      error: err instanceof Error ? err.message : 'Unknown error creating volunteer shift',
    }
  }
}

/**
 * Update an existing volunteer shift record.
 */
export async function updateShift(
  id: string,
  payload: VolunteerShiftUpdate
): Promise<ServiceResponse<VolunteerShift>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('volunteer_shifts')
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
      error: err instanceof Error ? err.message : 'Unknown error updating volunteer shift',
    }
  }
}

/**
 * Delete a volunteer shift record by ID.
 */
export async function deleteShift(
  id: string
): Promise<ServiceResponse<boolean>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('volunteer_shifts')
      .delete()
      .eq('id', id)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: true, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error deleting volunteer shift',
    }
  }
}

/**
 * Sign up a user for a shift with capacity enforcement.
 */
export async function signUpForShift(
  shiftId: string,
  userId: string
): Promise<ServiceResponse<VolunteerSignup>> {
  try {
    const supabase = await createClient()

    // 1. Fetch shift to verify capacity and existence
    const { data: shift, error: shiftError } = await supabase
      .from('volunteer_shifts')
      .select('id, max_volunteers')
      .eq('id', shiftId)
      .single()

    if (shiftError || !shift) {
      return { data: null, error: shiftError?.message || 'Volunteer shift not found' }
    }

    // 2. Count existing signups for capacity check
    const { data: existingSignups, error: countError } = await supabase
      .from('volunteer_signups')
      .select('id, user_id')
      .eq('shift_id', shiftId)

    if (countError) {
      return { data: null, error: countError.message }
    }

    const currentCount = existingSignups ? existingSignups.length : 0
    if (currentCount >= Number(shift.max_volunteers)) {
      return {
        data: null,
        error: 'This volunteer shift has reached maximum capacity.',
      }
    }

    // 3. Check if user is already signed up
    const alreadySignedUp = existingSignups?.some((s) => s.user_id === userId)
    if (alreadySignedUp) {
      return {
        data: null,
        error: 'You have already signed up for this shift.',
      }
    }

    // 4. Insert signup record
    const { data: signup, error: insertError } = await supabase
      .from('volunteer_signups')
      .insert({
        shift_id: shiftId,
        user_id: userId,
        attended: false,
      })
      .select()
      .single()

    if (insertError) {
      return { data: null, error: insertError.message }
    }

    return { data: signup, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error signing up for shift',
    }
  }
}

/**
 * Cancel a user's signup for a shift.
 */
export async function cancelSignUp(
  shiftId: string,
  userId: string
): Promise<ServiceResponse<boolean>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('volunteer_signups')
      .delete()
      .eq('shift_id', shiftId)
      .eq('user_id', userId)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: true, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error cancelling volunteer signup',
    }
  }
}

/**
 * Mark a volunteer signup attendance status (Admin only).
 */
export async function markAttendance(
  signupId: string,
  attended: boolean
): Promise<ServiceResponse<VolunteerSignup>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('volunteer_signups')
      .update({ attended })
      .eq('id', signupId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error marking attendance',
    }
  }
}

/**
 * Retrieve all signups for a given user with joined shift metadata.
 */
export async function getUserSignups(
  userId: string
): Promise<ServiceResponse<VolunteerSignupWithShift[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('volunteer_signups')
      .select(`
        *,
        volunteer_shifts:shift_id (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }

    const signupsWithShifts: VolunteerSignupWithShift[] = (data || []).map((s: any) => ({
      id: s.id,
      shift_id: s.shift_id,
      user_id: s.user_id,
      attended: s.attended,
      created_at: s.created_at,
      shift: s.volunteer_shifts || null,
    }))

    return { data: signupsWithShifts, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error fetching user signups',
    }
  }
}
