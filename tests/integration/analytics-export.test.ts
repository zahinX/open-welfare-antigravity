import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/export/reports/route'
import { NextRequest } from 'next/server'
import { getUserProfile } from '@/lib/supabase/server'
import * as reportsService from '@/lib/services/reports'

vi.mock('@/lib/supabase/server', () => ({
  getUserProfile: vi.fn(),
}))

vi.mock('@/lib/services/reports', () => ({
  getFinancialReport: vi.fn(),
  getCampaignPerformanceReport: vi.fn(),
  getBeneficiaryReport: vi.fn(),
  getVolunteerReport: vi.fn(),
}))

describe('GET /api/export/reports (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(getUserProfile).mockResolvedValue(null as any)

    const req = new NextRequest('http://localhost:3000/api/export/reports?type=financial')
    const res = await GET(req)

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('should return 403 when user is not an admin', async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: { id: 'volunteer-1' } as any,
      profile: { id: 'volunteer-1', role: 'volunteer' } as any,
    })

    const req = new NextRequest('http://localhost:3000/api/export/reports?type=financial')
    const res = await GET(req)

    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('Forbidden')
  })

  it('should return 400 when invalid type parameter is supplied', async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: { id: 'admin-1' } as any,
      profile: { id: 'admin-1', role: 'admin' } as any,
    })

    const req = new NextRequest('http://localhost:3000/api/export/reports?type=invalid_type')
    const res = await GET(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid export parameters')
  })

  it('should return 200 and text/csv headers on successful financial export', async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: { id: 'admin-1' } as any,
      profile: { id: 'admin-1', role: 'admin' } as any,
    })

    vi.mocked(reportsService.getFinancialReport).mockResolvedValue({
      data: {
        totalDonations: 1000,
        totalDisbursements: 500,
        netBalance: 500,
        donationCount: 1,
        disbursementCount: 1,
        items: [
          {
            id: 't-1',
            type: 'donation',
            date: '2026-08-18T10:00:00Z',
            title: 'Donation',
            donorOrBeneficiary: 'Anonymous',
            campaignTitle: null,
            amount: 1000,
            currency: 'BDT',
            convertedAmount: 1000,
            paymentMethodOrStatus: 'bkash',
          },
        ],
      },
      error: null,
    })

    const req = new NextRequest('http://localhost:3000/api/export/reports?type=financial')
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="report-financial-')
    const text = await res.text()
    expect(text).toContain('"Transaction ID","Type"')
    expect(text).toContain('"t-1","DONATION"')
  })

  it('should return 200 and text/csv for campaign report export', async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: { id: 'admin-1' } as any,
      profile: { id: 'admin-1', role: 'admin' } as any,
    })

    vi.mocked(reportsService.getCampaignPerformanceReport).mockResolvedValue({
      data: [
        {
          id: 'c-1',
          title: 'Flood Relief',
          status: 'active',
          currency: 'BDT',
          targetAmount: 50000,
          raisedAmount: 25000,
          progressPercentage: 50,
          disbursedAmount: 10000,
          netBalance: 15000,
          donorCount: 10,
          deadlineAt: null,
          createdAt: '2026-08-01',
        },
      ],
      error: null,
    })

    const req = new NextRequest('http://localhost:3000/api/export/reports?type=campaigns')
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    const text = await res.text()
    expect(text).toContain('"Campaign ID","Title","Status"')
    expect(text).toContain('"Flood Relief"')
  })
})
