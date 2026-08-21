import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getDashboardSummaryAction,
  getBeneficiaryDistributionAction,
  getVolunteerParticipationAction,
  getDonationTrendsAction,
  getFinancialReportAction,
  getCampaignPerformanceReportAction,
  getBeneficiaryReportAction,
  getVolunteerReportAction,
} from '@/lib/actions/analytics.actions'
import { getUserProfile } from '@/lib/supabase/server'
import * as analyticsService from '@/lib/services/analytics'
import * as reportsService from '@/lib/services/reports'

vi.mock('@/lib/supabase/server', () => ({
  getUserProfile: vi.fn(),
}))

vi.mock('@/lib/services/analytics', () => ({
  getDashboardSummary: vi.fn(),
  getBeneficiaryDistribution: vi.fn(),
  getVolunteerParticipation: vi.fn(),
  getDonationTrends: vi.fn(),
}))

vi.mock('@/lib/services/reports', () => ({
  getFinancialReport: vi.fn(),
  getCampaignPerformanceReport: vi.fn(),
  getBeneficiaryReport: vi.fn(),
  getVolunteerReport: vi.fn(),
}))

describe('Analytics Server Actions (lib/actions/analytics.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authorization Guards', () => {
    it('should reject unauthenticated requests', async () => {
      vi.mocked(getUserProfile).mockResolvedValue(null as any)

      const res = await getDashboardSummaryAction()
      expect(res.success).toBe(false)
      expect(res.error).toContain('Unauthorized')
    })

    it('should reject non-admin users', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'user-1' } as any,
        profile: { id: 'user-1', role: 'volunteer', full_name: 'Volunteer User' } as any,
      })

      const res = await getDashboardSummaryAction()
      expect(res.success).toBe(false)
      expect(res.error).toContain('Forbidden')
    })
  })

  describe('Action Executions for Admin', () => {
    beforeEach(() => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'admin-1' } as any,
        profile: { id: 'admin-1', role: 'admin', full_name: 'Admin User' } as any,
      })
    })

    it('should call getDashboardSummary and return success', async () => {
      vi.mocked(analyticsService.getDashboardSummary).mockResolvedValue({
        data: { totalDonationsAmount: 1000 } as any,
        error: null,
      })

      const res = await getDashboardSummaryAction()
      expect(res.success).toBe(true)
      expect(res.data?.totalDonationsAmount).toBe(1000)
    })

    it('should call getBeneficiaryDistribution and return success', async () => {
      vi.mocked(analyticsService.getBeneficiaryDistribution).mockResolvedValue({
        data: { total: 10 } as any,
        error: null,
      })

      const res = await getBeneficiaryDistributionAction()
      expect(res.success).toBe(true)
      expect(res.data?.total).toBe(10)
    })

    it('should call getVolunteerParticipation and return success', async () => {
      vi.mocked(analyticsService.getVolunteerParticipation).mockResolvedValue({
        data: { totalShifts: 5 } as any,
        error: null,
      })

      const res = await getVolunteerParticipationAction()
      expect(res.success).toBe(true)
      expect(res.data?.totalShifts).toBe(5)
    })

    it('should call getDonationTrends and return success', async () => {
      vi.mocked(analyticsService.getDonationTrends).mockResolvedValue({
        data: [{ date: '2026-08-18', amount: 500, count: 1 }],
        error: null,
      })

      const res = await getDonationTrendsAction(30)
      expect(res.success).toBe(true)
      expect(res.data?.length).toBe(1)
    })

    it('should call getFinancialReport with validated filter', async () => {
      vi.mocked(reportsService.getFinancialReport).mockResolvedValue({
        data: { totalDonations: 5000, totalDisbursements: 2000, netBalance: 3000 } as any,
        error: null,
      })

      const res = await getFinancialReportAction({ startDate: '2026-08-01' })
      expect(res.success).toBe(true)
      expect(res.data?.netBalance).toBe(3000)
      expect(reportsService.getFinancialReport).toHaveBeenCalledWith({ startDate: '2026-08-01' })
    })

    it('should return error when filter validation fails', async () => {
      const res = await getFinancialReportAction({ startDate: 'invalid-date-format' })
      expect(res.success).toBe(false)
      expect(res.error).toBe('Invalid filter criteria.')
      expect(res.fieldErrors?.startDate).toBeDefined()
    })

    it('should call getCampaignPerformanceReportAction and return success', async () => {
      vi.mocked(reportsService.getCampaignPerformanceReport).mockResolvedValue({
        data: [{ id: 'c1', title: 'Campaign 1' }] as any,
        error: null,
      })

      const res = await getCampaignPerformanceReportAction()
      expect(res.success).toBe(true)
      expect(res.data?.length).toBe(1)
    })

    it('should call getBeneficiaryReportAction and return success', async () => {
      vi.mocked(reportsService.getBeneficiaryReport).mockResolvedValue({
        data: [{ id: 'b1', fullName: 'Beneficiary 1' }] as any,
        error: null,
      })

      const res = await getBeneficiaryReportAction()
      expect(res.success).toBe(true)
      expect(res.data?.length).toBe(1)
    })

    it('should call getVolunteerReportAction and return success', async () => {
      vi.mocked(reportsService.getVolunteerReport).mockResolvedValue({
        data: [{ id: 's1', title: 'Shift 1' }] as any,
        error: null,
      })

      const res = await getVolunteerReportAction()
      expect(res.success).toBe(true)
      expect(res.data?.length).toBe(1)
    })
  })
})
