import { createClient } from '@/lib/supabase/server'
import { AnalyticsFilterInput } from '@/lib/validations/analytics'
import { ServiceResult } from './analytics'

export interface FinancialReportItem {
  id: string
  type: 'donation' | 'disbursement'
  date: string
  title: string
  donorOrBeneficiary: string
  campaignTitle: string | null
  amount: number
  currency: string
  convertedAmount: number
  paymentMethodOrStatus: string
}

export interface FinancialSummaryReport {
  totalDonations: number
  totalDisbursements: number
  netBalance: number
  donationCount: number
  disbursementCount: number
  items: FinancialReportItem[]
}

export interface CampaignPerformanceItem {
  id: string
  title: string
  status: string
  currency: string
  targetAmount: number
  raisedAmount: number
  progressPercentage: number
  disbursedAmount: number
  netBalance: number
  donorCount: number
  deadlineAt: string | null
  createdAt: string
}

export interface BeneficiaryReportItem {
  id: string
  fullName: string
  contactPhone: string | null
  familySize: number
  status: string
  totalDisbursedAmount: number
  disbursementsCount: number
  createdAt: string
}

export interface VolunteerShiftReportItem {
  id: string
  title: string
  location: string
  startTime: string
  endTime: string
  maxVolunteers: number
  signupsCount: number
  attendedCount: number
  attendanceRate: number
}

/**
 * Fetch unified financial summary report (combining donations & disbursements).
 */
export async function getFinancialReport(
  filter?: AnalyticsFilterInput
): Promise<ServiceResult<FinancialSummaryReport>> {
  try {
    const supabase = await createClient()

    let donationsQuery = supabase
      .from('donations')
      .select(`
        id,
        amount,
        currency,
        converted_amount,
        payment_method,
        payment_status,
        donor_name,
        donor_name_override,
        is_anonymous,
        created_at,
        campaign_id,
        campaigns ( title )
      `)
      .order('created_at', { ascending: false })

    let disbursementsQuery = supabase
      .from('disbursements')
      .select(`
        id,
        amount_value,
        description,
        disbursed_at,
        created_at,
        campaign_id,
        beneficiary_id,
        campaigns ( title ),
        beneficiaries ( full_name )
      `)
      .order('disbursed_at', { ascending: false })

    if (filter?.startDate) {
      donationsQuery = donationsQuery.gte('created_at', filter.startDate)
      disbursementsQuery = disbursementsQuery.gte('disbursed_at', filter.startDate)
    }

    if (filter?.endDate) {
      donationsQuery = donationsQuery.lte('created_at', filter.endDate)
      disbursementsQuery = disbursementsQuery.lte('disbursed_at', filter.endDate)
    }

    if (filter?.campaignId) {
      donationsQuery = donationsQuery.eq('campaign_id', filter.campaignId)
      disbursementsQuery = disbursementsQuery.eq('campaign_id', filter.campaignId)
    }

    const [donationsRes, disbursementsRes] = await Promise.all([
      donationsQuery,
      disbursementsQuery,
    ])

    if (donationsRes.error) throw new Error(donationsRes.error.message)
    if (disbursementsRes.error) throw new Error(disbursementsRes.error.message)

    const donations = donationsRes.data || []
    const disbursements = disbursementsRes.data || []

    let totalDonations = 0
    const donationItems: FinancialReportItem[] = donations.map((d: any) => {
      const convAmt = Number(d.converted_amount) || Number(d.amount) || 0
      totalDonations += convAmt

      const donorDisplay = d.is_anonymous
        ? 'Anonymous'
        : d.donor_name_override || d.donor_name || 'Anonymous'

      return {
        id: d.id,
        type: 'donation',
        date: d.created_at,
        title: d.campaigns?.title ? `Donation to ${d.campaigns.title}` : 'General Donation',
        donorOrBeneficiary: donorDisplay,
        campaignTitle: d.campaigns?.title || null,
        amount: Number(d.amount) || 0,
        currency: d.currency || 'BDT',
        convertedAmount: convAmt,
        paymentMethodOrStatus: d.payment_method || d.payment_status || 'completed',
      }
    })

    let totalDisbursements = 0
    const disbursementItems: FinancialReportItem[] = disbursements.map((disb: any) => {
      const amt = Number(disb.amount_value) || 0
      totalDisbursements += amt

      return {
        id: disb.id,
        type: 'disbursement',
        date: disb.disbursed_at || disb.created_at,
        title: disb.description || 'Disbursement',
        donorOrBeneficiary: disb.beneficiaries?.full_name || 'Beneficiary',
        campaignTitle: disb.campaigns?.title || null,
        amount: amt,
        currency: 'BDT',
        convertedAmount: amt,
        paymentMethodOrStatus: 'disbursed',
      }
    })

    // Interleave and sort by date descending
    const allItems = [...donationItems, ...disbursementItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return {
      data: {
        totalDonations: Math.round(totalDonations * 100) / 100,
        totalDisbursements: Math.round(totalDisbursements * 100) / 100,
        netBalance: Math.round((totalDonations - totalDisbursements) * 100) / 100,
        donationCount: donationItems.length,
        disbursementCount: disbursementItems.length,
        items: allItems,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch financial report',
    }
  }
}

/**
 * Fetch campaign performance report with target vs raised and disbursement tracking.
 */
export async function getCampaignPerformanceReport(
  filter?: AnalyticsFilterInput
): Promise<ServiceResult<CampaignPerformanceItem[]>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('campaigns')
      .select(`
        id,
        title,
        status,
        currency,
        target_amount,
        current_amount,
        deadline_at,
        created_at,
        donations ( id, amount, converted_amount ),
        disbursements ( id, amount_value )
      `)
      .order('created_at', { ascending: false })

    if (filter?.startDate) {
      query = query.gte('created_at', filter.startDate)
    }

    if (filter?.endDate) {
      query = query.lte('created_at', filter.endDate)
    }

    if (filter?.status) {
      query = query.eq('status', filter.status as any)
    }

    if (filter?.campaignId) {
      query = query.eq('id', filter.campaignId)
    }

    const { data: campaigns, error } = await query
    if (error) throw new Error(error.message)

    const list = campaigns || []
    const report: CampaignPerformanceItem[] = list.map((c: any) => {
      const donations = c.donations || []
      const disbursements = c.disbursements || []

      const target = Number(c.target_amount) || 0
      const raised = Number(c.current_amount) || donations.reduce((sum: number, d: any) => sum + (Number(d.converted_amount) || Number(d.amount) || 0), 0)
      const disbursed = disbursements.reduce((sum: number, d: any) => sum + (Number(d.amount_value) || 0), 0)
      const progress = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0
      const net = raised - disbursed

      return {
        id: c.id,
        title: c.title,
        status: c.status,
        currency: c.currency || 'BDT',
        targetAmount: target,
        raisedAmount: Math.round(raised * 100) / 100,
        progressPercentage: progress,
        disbursedAmount: Math.round(disbursed * 100) / 100,
        netBalance: Math.round(net * 100) / 100,
        donorCount: donations.length,
        deadlineAt: c.deadline_at,
        createdAt: c.created_at,
      }
    })

    return {
      data: report,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch campaign performance report',
    }
  }
}

/**
 * Fetch beneficiary report with received disbursement metrics.
 */
export async function getBeneficiaryReport(
  filter?: AnalyticsFilterInput
): Promise<ServiceResult<BeneficiaryReportItem[]>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('beneficiaries')
      .select(`
        id,
        full_name,
        contact_phone,
        family_size,
        status,
        created_at,
        disbursements ( id, amount_value )
      `)
      .order('created_at', { ascending: false })

    if (filter?.startDate) {
      query = query.gte('created_at', filter.startDate)
    }

    if (filter?.endDate) {
      query = query.lte('created_at', filter.endDate)
    }

    if (filter?.status) {
      query = query.eq('status', filter.status as any)
    }

    const { data: beneficiaries, error } = await query
    if (error) throw new Error(error.message)

    const list = beneficiaries || []
    const report: BeneficiaryReportItem[] = list.map((b: any) => {
      const disbursements = b.disbursements || []
      const totalDisbursed = disbursements.reduce(
        (sum: number, d: any) => sum + (Number(d.amount_value) || 0),
        0
      )

      return {
        id: b.id,
        fullName: b.full_name,
        contactPhone: b.contact_phone,
        familySize: Number(b.family_size) || 1,
        status: b.status,
        totalDisbursedAmount: Math.round(totalDisbursed * 100) / 100,
        disbursementsCount: disbursements.length,
        createdAt: b.created_at,
      }
    })

    return {
      data: report,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch beneficiary report',
    }
  }
}

/**
 * Fetch volunteer shift performance report with attendance metrics.
 */
export async function getVolunteerReport(
  filter?: AnalyticsFilterInput
): Promise<ServiceResult<VolunteerShiftReportItem[]>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('volunteer_shifts')
      .select(`
        id,
        title,
        location,
        start_time,
        end_time,
        max_volunteers,
        volunteer_signups ( id, attended )
      `)
      .order('start_time', { ascending: false })

    if (filter?.startDate) {
      query = query.gte('start_time', filter.startDate)
    }

    if (filter?.endDate) {
      query = query.lte('start_time', filter.endDate)
    }

    const { data: shifts, error } = await query
    if (error) throw new Error(error.message)

    const list = shifts || []
    const report: VolunteerShiftReportItem[] = list.map((s: any) => {
      const signups = s.volunteer_signups || []
      const signupsCount = signups.length
      const attendedCount = signups.filter((item: any) => item.attended).length
      const attendanceRate = signupsCount > 0 ? Math.round((attendedCount / signupsCount) * 100) : 0

      return {
        id: s.id,
        title: s.title,
        location: s.location,
        startTime: s.start_time,
        endTime: s.end_time,
        maxVolunteers: s.max_volunteers,
        signupsCount,
        attendedCount,
        attendanceRate,
      }
    })

    return {
      data: report,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch volunteer report',
    }
  }
}
