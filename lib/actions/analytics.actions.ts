'use server'

import { getUserProfile } from '@/lib/supabase/server'
import {
  getDashboardSummary,
  getBeneficiaryDistribution,
  getVolunteerParticipation,
  getDonationTrends,
  DashboardSummary,
  BeneficiaryDistribution,
  VolunteerParticipation,
  DonationTrendItem,
} from '@/lib/services/analytics'
import {
  getFinancialReport,
  getCampaignPerformanceReport,
  getBeneficiaryReport,
  getVolunteerReport,
  FinancialSummaryReport,
  CampaignPerformanceItem,
  BeneficiaryReportItem,
  VolunteerShiftReportItem,
} from '@/lib/services/reports'
import {
  analyticsFilterSchema,
  AnalyticsFilterInput,
} from '@/lib/validations/analytics'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T | null
  error?: string | null
  fieldErrors?: Record<string, string[]>
}

function formatZodErrors(issues: Array<{ path: (string | number | symbol)[]; message: string }>): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of issues) {
    const fieldName = issue.path.map(String).join('.')
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = []
    }
    fieldErrors[fieldName].push(issue.message)
  }
  return fieldErrors
}

async function requireAdminAuth(): Promise<{ error?: string }> {
  const authData = await getUserProfile()
  if (!authData || !authData.user) {
    return { error: 'Unauthorized. You must be logged in.' }
  }
  if (authData.profile.role !== 'admin') {
    return { error: 'Forbidden. Admin privileges required.' }
  }
  return {}
}

/**
 * Server Action: Get Admin Dashboard KPI Summary metrics.
 */
export async function getDashboardSummaryAction(): Promise<ActionResult<DashboardSummary>> {
  try {
    const authCheck = await requireAdminAuth()
    if (authCheck.error) {
      return { success: false, error: authCheck.error }
    }

    const { data, error } = await getDashboardSummary()
    if (error || !data) {
      return { success: false, error: error || 'Failed to fetch dashboard summary.' }
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Get Beneficiary Distribution breakdown.
 */
export async function getBeneficiaryDistributionAction(): Promise<ActionResult<BeneficiaryDistribution>> {
  try {
    const authCheck = await requireAdminAuth()
    if (authCheck.error) {
      return { success: false, error: authCheck.error }
    }

    const { data, error } = await getBeneficiaryDistribution()
    if (error || !data) {
      return { success: false, error: error || 'Failed to fetch beneficiary distribution.' }
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Get Volunteer Participation statistics.
 */
export async function getVolunteerParticipationAction(): Promise<ActionResult<VolunteerParticipation>> {
  try {
    const authCheck = await requireAdminAuth()
    if (authCheck.error) {
      return { success: false, error: authCheck.error }
    }

    const { data, error } = await getVolunteerParticipation()
    if (error || !data) {
      return { success: false, error: error || 'Failed to fetch volunteer participation.' }
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Get Daily Donation Trends for time-series charts.
 */
export async function getDonationTrendsAction(
  days = 30
): Promise<ActionResult<DonationTrendItem[]>> {
  try {
    const authCheck = await requireAdminAuth()
    if (authCheck.error) {
      return { success: false, error: authCheck.error }
    }

    const { data, error } = await getDonationTrends(days)
    if (error || !data) {
      return { success: false, error: error || 'Failed to fetch donation trends.' }
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Get Financial Summary Report.
 */
export async function getFinancialReportAction(
  rawFilter?: AnalyticsFilterInput
): Promise<ActionResult<FinancialSummaryReport>> {
  try {
    const authCheck = await requireAdminAuth()
    if (authCheck.error) {
      return { success: false, error: authCheck.error }
    }

    const validation = analyticsFilterSchema.safeParse(rawFilter || {})
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid filter criteria.',
        fieldErrors: formatZodErrors(validation.error.issues),
      }
    }

    const { data, error } = await getFinancialReport(validation.data)
    if (error || !data) {
      return { success: false, error: error || 'Failed to fetch financial report.' }
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Get Campaign Performance Report.
 */
export async function getCampaignPerformanceReportAction(
  rawFilter?: AnalyticsFilterInput
): Promise<ActionResult<CampaignPerformanceItem[]>> {
  try {
    const authCheck = await requireAdminAuth()
    if (authCheck.error) {
      return { success: false, error: authCheck.error }
    }

    const validation = analyticsFilterSchema.safeParse(rawFilter || {})
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid filter criteria.',
        fieldErrors: formatZodErrors(validation.error.issues),
      }
    }

    const { data, error } = await getCampaignPerformanceReport(validation.data)
    if (error || !data) {
      return { success: false, error: error || 'Failed to fetch campaign performance report.' }
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Get Beneficiary Assistance Report.
 */
export async function getBeneficiaryReportAction(
  rawFilter?: AnalyticsFilterInput
): Promise<ActionResult<BeneficiaryReportItem[]>> {
  try {
    const authCheck = await requireAdminAuth()
    if (authCheck.error) {
      return { success: false, error: authCheck.error }
    }

    const validation = analyticsFilterSchema.safeParse(rawFilter || {})
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid filter criteria.',
        fieldErrors: formatZodErrors(validation.error.issues),
      }
    }

    const { data, error } = await getBeneficiaryReport(validation.data)
    if (error || !data) {
      return { success: false, error: error || 'Failed to fetch beneficiary report.' }
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Server Action: Get Volunteer Shifts Attendance Report.
 */
export async function getVolunteerReportAction(
  rawFilter?: AnalyticsFilterInput
): Promise<ActionResult<VolunteerShiftReportItem[]>> {
  try {
    const authCheck = await requireAdminAuth()
    if (authCheck.error) {
      return { success: false, error: authCheck.error }
    }

    const validation = analyticsFilterSchema.safeParse(rawFilter || {})
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid filter criteria.',
        fieldErrors: formatZodErrors(validation.error.issues),
      }
    }

    const { data, error } = await getVolunteerReport(validation.data)
    if (error || !data) {
      return { success: false, error: error || 'Failed to fetch volunteer report.' }
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}
