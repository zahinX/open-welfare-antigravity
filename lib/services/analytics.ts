import { createClient } from '@/lib/supabase/server'

export interface ServiceResult<T> {
  data: T | null
  error: string | null
}

export interface DashboardSummary {
  totalDonationsAmount: number
  totalDonationsCount: number
  activeCampaignsCount: number
  totalCampaignsCount: number
  totalBeneficiariesCount: number
  totalDisbursedAmount: number
  totalVolunteersCount: number
  totalShiftsCount: number
  upcomingShiftsCount: number
  attendanceRate: number
}

export interface BeneficiaryDistribution {
  byStatus: Record<string, number>
  byFamilySize: { range: string; count: number }[]
  total: number
}

export interface ShiftParticipationStat {
  id: string
  title: string
  location: string
  max_volunteers: number
  signups_count: number
  attended_count: number
  attendance_rate: number
  start_time: string
}

export interface VolunteerParticipation {
  totalShifts: number
  totalSignups: number
  totalAttended: number
  attendanceRate: number
  shiftsWithAttendance: ShiftParticipationStat[]
}

export interface DonationTrendItem {
  date: string
  amount: number
  count: number
}

/**
 * Fetch top-level dashboard summary metrics across donations, campaigns,
 * beneficiaries, disbursements, and volunteer shifts.
 */
export async function getDashboardSummary(): Promise<ServiceResult<DashboardSummary>> {
  try {
    const supabase = await createClient()

    // 1. Parallel queries for speed
    const [
      donationsRes,
      campaignsRes,
      beneficiariesRes,
      disbursementsRes,
      shiftsRes,
      signupsRes,
      volunteersRes,
    ] = await Promise.all([
      supabase.from('donations').select('converted_amount, amount, payment_status'),
      supabase.from('campaigns').select('id, status'),
      supabase.from('beneficiaries').select('id, status'),
      supabase.from('disbursements').select('amount_value'),
      supabase.from('volunteer_shifts').select('id, start_time'),
      supabase.from('volunteer_signups').select('id, attended'),
      supabase.from('profiles').select('id').eq('role', 'volunteer'),
    ])

    if (donationsRes.error) throw new Error(`Donations query failed: ${donationsRes.error.message}`)
    if (campaignsRes.error) throw new Error(`Campaigns query failed: ${campaignsRes.error.message}`)
    if (beneficiariesRes.error) throw new Error(`Beneficiaries query failed: ${beneficiariesRes.error.message}`)
    if (disbursementsRes.error) throw new Error(`Disbursements query failed: ${disbursementsRes.error.message}`)
    if (shiftsRes.error) throw new Error(`Shifts query failed: ${shiftsRes.error.message}`)
    if (signupsRes.error) throw new Error(`Signups query failed: ${signupsRes.error.message}`)

    const donations = donationsRes.data || []
    const totalDonationsAmount = donations.reduce((sum, d) => sum + (Number(d.converted_amount) || Number(d.amount) || 0), 0)
    const totalDonationsCount = donations.length

    const campaigns = campaignsRes.data || []
    const totalCampaignsCount = campaigns.length
    const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length

    const beneficiaries = beneficiariesRes.data || []
    const totalBeneficiariesCount = beneficiaries.length

    const disbursements = disbursementsRes.data || []
    const totalDisbursedAmount = disbursements.reduce((sum, d) => sum + (Number(d.amount_value) || 0), 0)

    const shifts = shiftsRes.data || []
    const nowIso = new Date().toISOString()
    const totalShiftsCount = shifts.length
    const upcomingShiftsCount = shifts.filter((s) => s.start_time >= nowIso).length

    const signups = signupsRes.data || []
    const totalSignups = signups.length
    const totalAttended = signups.filter((s) => s.attended).length
    const attendanceRate = totalSignups > 0 ? Math.round((totalAttended / totalSignups) * 100) : 0

    const totalVolunteersCount = (volunteersRes.data || []).length

    return {
      data: {
        totalDonationsAmount,
        totalDonationsCount,
        activeCampaignsCount,
        totalCampaignsCount,
        totalBeneficiariesCount,
        totalDisbursedAmount,
        totalVolunteersCount,
        totalShiftsCount,
        upcomingShiftsCount,
        attendanceRate,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch dashboard summary',
    }
  }
}

/**
 * Fetch beneficiary distribution categorized by status and family size groups.
 */
export async function getBeneficiaryDistribution(): Promise<ServiceResult<BeneficiaryDistribution>> {
  try {
    const supabase = await createClient()
    const { data: beneficiaries, error } = await supabase
      .from('beneficiaries')
      .select('id, status, family_size')

    if (error) throw new Error(error.message)

    const list = beneficiaries || []
    const byStatus: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      inactive: 0,
    }

    const familyRanges = {
      '1-2 members': 0,
      '3-4 members': 0,
      '5-6 members': 0,
      '7+ members': 0,
    }

    for (const b of list) {
      if (b.status && byStatus[b.status] !== undefined) {
        byStatus[b.status]++
      } else if (b.status) {
        byStatus[b.status] = 1
      }

      const size = Number(b.family_size) || 1
      if (size <= 2) familyRanges['1-2 members']++
      else if (size <= 4) familyRanges['3-4 members']++
      else if (size <= 6) familyRanges['5-6 members']++
      else familyRanges['7+ members']++
    }

    const byFamilySize = Object.entries(familyRanges).map(([range, count]) => ({
      range,
      count,
    }))

    return {
      data: {
        byStatus,
        byFamilySize,
        total: list.length,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch beneficiary distribution',
    }
  }
}

/**
 * Fetch volunteer participation metrics and per-shift breakdown.
 */
export async function getVolunteerParticipation(): Promise<ServiceResult<VolunteerParticipation>> {
  try {
    const supabase = await createClient()

    const { data: shifts, error } = await supabase
      .from('volunteer_shifts')
      .select(`
        id,
        title,
        location,
        start_time,
        max_volunteers,
        volunteer_signups (
          id,
          attended
        )
      `)
      .order('start_time', { ascending: false })

    if (error) throw new Error(error.message)

    const shiftList = shifts || []
    let totalSignups = 0
    let totalAttended = 0

    interface RawShiftSignup {
      attended: boolean | null
    }
    interface RawShiftData {
      id: string
      title: string
      location: string
      start_time: string
      max_volunteers: number
      volunteer_signups?: RawShiftSignup[] | null
    }

    const shiftsWithAttendance: ShiftParticipationStat[] = (shiftList as unknown as RawShiftData[]).map((shift) => {
      const signups = shift.volunteer_signups || []
      const signupsCount = signups.length
      const attendedCount = signups.filter((s) => s.attended).length
      const rate = signupsCount > 0 ? Math.round((attendedCount / signupsCount) * 100) : 0

      totalSignups += signupsCount
      totalAttended += attendedCount

      return {
        id: shift.id,
        title: shift.title,
        location: shift.location,
        start_time: shift.start_time,
        max_volunteers: shift.max_volunteers,
        signups_count: signupsCount,
        attended_count: attendedCount,
        attendance_rate: rate,
      }
    })

    const overallRate = totalSignups > 0 ? Math.round((totalAttended / totalSignups) * 100) : 0

    return {
      data: {
        totalShifts: shiftList.length,
        totalSignups,
        totalAttended,
        attendanceRate: overallRate,
        shiftsWithAttendance,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch volunteer participation',
    }
  }
}

/**
 * Fetch daily donation trends for the last N days (default 30 days).
 */
export async function getDonationTrends(days = 30): Promise<ServiceResult<DonationTrendItem[]>> {
  try {
    const supabase = await createClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateIso = startDate.toISOString()

    const { data: donations, error } = await supabase
      .from('donations')
      .select('converted_amount, amount, created_at')
      .gte('created_at', startDateIso)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    const trendMap = new Map<string, { amount: number; count: number }>()

    // Prepopulate past N days
    for (let i = 0; i <= days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (days - i))
      const key = d.toISOString().split('T')[0]
      trendMap.set(key, { amount: 0, count: 0 })
    }

    // Populate actual donation data
    for (const d of donations || []) {
      const dateKey = (d.created_at || '').split('T')[0]
      const amt = Number(d.converted_amount) || Number(d.amount) || 0
      const current = trendMap.get(dateKey) || { amount: 0, count: 0 }
      trendMap.set(dateKey, {
        amount: current.amount + amt,
        count: current.count + 1,
      })
    }

    const result: DonationTrendItem[] = Array.from(trendMap.entries()).map(([date, val]) => ({
      date,
      amount: Math.round(val.amount * 100) / 100,
      count: val.count,
    }))

    return {
      data: result,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch donation trends',
    }
  }
}
