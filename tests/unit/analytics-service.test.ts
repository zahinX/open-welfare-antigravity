import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getDashboardSummary,
  getBeneficiaryDistribution,
  getVolunteerParticipation,
  getDonationTrends,
} from '@/lib/services/analytics'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Analytics Service Layer (lib/services/analytics.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboardSummary', () => {
    it('should aggregate metrics across tables accurately', async () => {
      const mockDonations = [
        { converted_amount: 5000, amount: 5000, payment_status: 'completed' },
        { converted_amount: 3000, amount: 3000, payment_status: 'completed' },
      ]
      const mockCampaigns = [
        { id: 'c1', status: 'active' },
        { id: 'c2', status: 'completed' },
      ]
      const mockBeneficiaries = [{ id: 'b1', status: 'approved' }, { id: 'b2', status: 'pending' }]
      const mockDisbursements = [{ amount_value: 2500 }, { amount_value: 1500 }]
      const mockShifts = [
        { id: 's1', start_time: '2099-01-01T00:00:00Z' },
        { id: 's2', start_time: '2020-01-01T00:00:00Z' },
      ]
      const mockSignups = [
        { id: 'u1', attended: true },
        { id: 'u2', attended: false },
      ]
      const mockProfiles = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }]

      const supabaseMock = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'donations') return { select: vi.fn().mockResolvedValue({ data: mockDonations, error: null }) }
          if (table === 'campaigns') return { select: vi.fn().mockResolvedValue({ data: mockCampaigns, error: null }) }
          if (table === 'beneficiaries') return { select: vi.fn().mockResolvedValue({ data: mockBeneficiaries, error: null }) }
          if (table === 'disbursements') return { select: vi.fn().mockResolvedValue({ data: mockDisbursements, error: null }) }
          if (table === 'volunteer_shifts') return { select: vi.fn().mockResolvedValue({ data: mockShifts, error: null }) }
          if (table === 'volunteer_signups') return { select: vi.fn().mockResolvedValue({ data: mockSignups, error: null }) }
          if (table === 'profiles') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }) }) }
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await getDashboardSummary()

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.totalDonationsAmount).toBe(8000)
      expect(result.data?.totalDonationsCount).toBe(2)
      expect(result.data?.activeCampaignsCount).toBe(1)
      expect(result.data?.totalCampaignsCount).toBe(2)
      expect(result.data?.totalBeneficiariesCount).toBe(2)
      expect(result.data?.totalDisbursedAmount).toBe(4000)
      expect(result.data?.totalShiftsCount).toBe(2)
      expect(result.data?.upcomingShiftsCount).toBe(1)
      expect(result.data?.attendanceRate).toBe(50)
      expect(result.data?.totalVolunteersCount).toBe(3)
    })

    it('should return error when a table query fails', async () => {
      const selectMock: any = vi.fn().mockImplementation(() => {
        const p = Promise.resolve({ data: null, error: { message: 'DB connection error' } }) as any
        p.eq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB connection error' } })
        return p
      })

      const supabaseMock = {
        from: vi.fn().mockReturnValue({
          select: selectMock,
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await getDashboardSummary()

      expect(result.data).toBeNull()
      expect(result.error).toContain('query failed')
    })
  })

  describe('getBeneficiaryDistribution', () => {
    it('should categorize beneficiaries by status and family size', async () => {
      const mockBeneficiaries = [
        { id: '1', status: 'approved', family_size: 2 },
        { id: '2', status: 'approved', family_size: 4 },
        { id: '3', status: 'pending', family_size: 5 },
        { id: '4', status: 'rejected', family_size: 8 },
      ]

      const supabaseMock = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: mockBeneficiaries, error: null }),
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await getBeneficiaryDistribution()

      expect(result.error).toBeNull()
      expect(result.data?.total).toBe(4)
      expect(result.data?.byStatus.approved).toBe(2)
      expect(result.data?.byStatus.pending).toBe(1)
      expect(result.data?.byStatus.rejected).toBe(1)

      const familyMap = Object.fromEntries(result.data!.byFamilySize.map((f) => [f.range, f.count]))
      expect(familyMap['1-2 members']).toBe(1)
      expect(familyMap['3-4 members']).toBe(1)
      expect(familyMap['5-6 members']).toBe(1)
      expect(familyMap['7+ members']).toBe(1)
    })
  })

  describe('getVolunteerParticipation', () => {
    it('should compute attendance rate and individual shift stats', async () => {
      const mockShifts = [
        {
          id: 's1',
          title: 'Shift 1',
          location: 'Dhaka',
          start_time: '2026-09-01',
          max_volunteers: 10,
          volunteer_signups: [{ id: 'u1', attended: true }, { id: 'u2', attended: true }],
        },
        {
          id: 's2',
          title: 'Shift 2',
          location: 'Chittagong',
          start_time: '2026-09-02',
          max_volunteers: 5,
          volunteer_signups: [{ id: 'u3', attended: false }],
        },
      ]

      const supabaseMock = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockShifts, error: null }),
          }),
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await getVolunteerParticipation()

      expect(result.error).toBeNull()
      expect(result.data?.totalShifts).toBe(2)
      expect(result.data?.totalSignups).toBe(3)
      expect(result.data?.totalAttended).toBe(2)
      expect(result.data?.attendanceRate).toBe(67)
      expect(result.data?.shiftsWithAttendance[0].attendance_rate).toBe(100)
      expect(result.data?.shiftsWithAttendance[1].attendance_rate).toBe(0)
    })
  })

  describe('getDonationTrends', () => {
    it('should group donations by date correctly', async () => {
      const today = new Date().toISOString().split('T')[0]
      const mockDonations = [
        { converted_amount: 1000, amount: 1000, created_at: `${today}T10:00:00Z` },
        { converted_amount: 2500, amount: 2500, created_at: `${today}T14:00:00Z` },
      ]

      const supabaseMock = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockDonations, error: null }),
            }),
          }),
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await getDonationTrends(7)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      const todayItem = result.data?.find((d) => d.date === today)
      expect(todayItem?.amount).toBe(3500)
      expect(todayItem?.count).toBe(2)
    })
  })
})
