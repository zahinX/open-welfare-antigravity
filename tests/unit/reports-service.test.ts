import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getFinancialReport,
  getCampaignPerformanceReport,
  getBeneficiaryReport,
  getVolunteerReport,
} from '@/lib/services/reports'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Reports Service Layer (lib/services/reports.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFinancialReport', () => {
    it('should aggregate donations and disbursements into a unified ledger', async () => {
      const mockDonations = [
        {
          id: 'don-1',
          amount: 5000,
          currency: 'BDT',
          converted_amount: 5000,
          payment_method: 'bkash',
          payment_status: 'completed',
          donor_name: 'John Doe',
          donor_name_override: null,
          is_anonymous: false,
          created_at: '2026-08-18T10:00:00Z',
          campaign_id: 'c-1',
          campaigns: { title: 'Flood Relief' },
        },
      ]

      const mockDisbursements = [
        {
          id: 'disb-1',
          amount_value: 2000,
          description: 'Emergency Food Kits',
          disbursed_at: '2026-08-18T12:00:00Z',
          created_at: '2026-08-18T12:00:00Z',
          campaign_id: 'c-1',
          beneficiary_id: 'b-1',
          campaigns: { title: 'Flood Relief' },
          beneficiaries: { full_name: 'Karim Ali' },
        },
      ]

      const mockDonationsQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDonations, error: null }),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }

      const mockDisbursementsQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDisbursements, error: null }),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }

      const supabaseMock = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'donations') return mockDonationsQuery
          if (table === 'disbursements') return mockDisbursementsQuery
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await getFinancialReport()

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.totalDonations).toBe(5000)
      expect(result.data?.totalDisbursements).toBe(2000)
      expect(result.data?.netBalance).toBe(3000)
      expect(result.data?.donationCount).toBe(1)
      expect(result.data?.disbursementCount).toBe(1)
      expect(result.data?.items.length).toBe(2)
      // Disbursement at 12:00 should come before donation at 10:00
      expect(result.data?.items[0].type).toBe('disbursement')
      expect(result.data?.items[1].type).toBe('donation')
    })

    it('should filter by date and campaign ID when provided', async () => {
      const mockDonationsQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      const mockDisbursementsQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      const supabaseMock = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'donations') return mockDonationsQuery
          if (table === 'disbursements') return mockDisbursementsQuery
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await getFinancialReport({
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        campaignId: 'c-1',
      })

      expect(result.error).toBeNull()
      expect(mockDonationsQuery.gte).toHaveBeenCalledWith('created_at', '2026-08-01')
      expect(mockDonationsQuery.lte).toHaveBeenCalledWith('created_at', '2026-08-31')
      expect(mockDonationsQuery.eq).toHaveBeenCalledWith('campaign_id', 'c-1')
    })
  })

  describe('getCampaignPerformanceReport', () => {
    it('should calculate campaign progress and disbursement metrics', async () => {
      const mockCampaigns = [
        {
          id: 'c-1',
          title: 'Flood Relief',
          status: 'active',
          currency: 'BDT',
          target_amount: 100000,
          current_amount: 80000,
          deadline_at: '2026-12-31',
          created_at: '2026-08-01',
          donations: [{ id: 'd1', amount: 50000 }, { id: 'd2', amount: 30000 }],
          disbursements: [{ id: 'dis1', amount_value: 25000 }],
        },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockCampaigns, error: null }),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getCampaignPerformanceReport()

      expect(result.error).toBeNull()
      expect(result.data?.length).toBe(1)
      const c = result.data![0]
      expect(c.title).toBe('Flood Relief')
      expect(c.raisedAmount).toBe(80000)
      expect(c.progressPercentage).toBe(80)
      expect(c.disbursedAmount).toBe(25000)
      expect(c.netBalance).toBe(55000)
      expect(c.donorCount).toBe(2)
    })
  })

  describe('getBeneficiaryReport', () => {
    it('should aggregate disbursements per beneficiary', async () => {
      const mockBeneficiaries = [
        {
          id: 'b-1',
          full_name: 'Fatima Begum',
          contact_phone: '01800000000',
          family_size: 4,
          status: 'approved',
          created_at: '2026-08-10',
          disbursements: [{ id: 'd1', amount_value: 5000 }, { id: 'd2', amount_value: 3000 }],
        },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBeneficiaries, error: null }),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getBeneficiaryReport()

      expect(result.error).toBeNull()
      expect(result.data?.length).toBe(1)
      const b = result.data![0]
      expect(b.fullName).toBe('Fatima Begum')
      expect(b.totalDisbursedAmount).toBe(8000)
      expect(b.disbursementsCount).toBe(2)
    })
  })

  describe('getVolunteerReport', () => {
    it('should aggregate volunteer shift signups and attendance', async () => {
      const mockShifts = [
        {
          id: 's-1',
          title: 'Shelter Build',
          location: 'Kurigram',
          start_time: '2026-09-01T10:00:00Z',
          end_time: '2026-09-01T16:00:00Z',
          max_volunteers: 10,
          volunteer_signups: [{ id: 'u1', attended: true }, { id: 'u2', attended: false }],
        },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockShifts, error: null }),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getVolunteerReport()

      expect(result.error).toBeNull()
      expect(result.data?.length).toBe(1)
      const s = result.data![0]
      expect(s.title).toBe('Shelter Build')
      expect(s.signupsCount).toBe(2)
      expect(s.attendedCount).toBe(1)
      expect(s.attendanceRate).toBe(50)
    })
  })
})
