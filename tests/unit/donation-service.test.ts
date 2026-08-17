import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createDonation,
  getDonationsByCampaignId,
  getRecentPublicDonations,
  getDonationsByDonorId,
} from '@/lib/services/donation'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Donation Service Layer (lib/services/donation.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createDonation', () => {
    it('should insert and return a new donation successfully', async () => {
      const payload = {
        campaign_id: 'c1-uuid',
        donor_id: 'u1-uuid',
        donor_name: 'John Doe',
        donor_email: 'john@example.com',
        amount: 50,
        currency: 'USD',
        converted_amount: 6000,
        exchange_rate: 120,
        payment_method: 'card',
        payment_status: 'completed',
        is_anonymous: false,
        is_public: true,
      }
      const createdRecord = { id: 'don-1', ...payload, created_at: new Date().toISOString() }

      const mockQuery: any = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdRecord, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await createDonation(payload)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(createdRecord)
      expect(mockQuery.insert).toHaveBeenCalledWith(payload)
    })

    it('should return error when Supabase insert fails', async () => {
      const mockQuery: any = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await createDonation({
        campaign_id: 'c1',
        amount: 100,
      } as any)

      expect(result.data).toBeNull()
      expect(result.error).toBe('Insert failed')
    })
  })

  describe('getDonationsByCampaignId', () => {
    it('should fetch all donations for a campaign ordered by created_at desc', async () => {
      const mockDonations = [
        { id: 'don-1', campaign_id: 'c1', amount: 1000 },
        { id: 'don-2', campaign_id: 'c1', amount: 2500 },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDonations, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getDonationsByCampaignId('c1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockDonations)
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'c1')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('getRecentPublicDonations', () => {
    it('should fetch completed donations limited to specified count', async () => {
      const mockDonations = [{ id: 'don-1', payment_status: 'completed', amount: 500 }]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockDonations, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getRecentPublicDonations('c1', 5)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockDonations)
      expect(mockQuery.limit).toHaveBeenCalledWith(5)
    })
  })

  describe('getDonationsByDonorId', () => {
    it('should fetch donations by donor ID', async () => {
      const mockDonations = [{ id: 'don-1', donor_id: 'user-1' }]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDonations, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getDonationsByDonorId('user-1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockDonations)
      expect(mockQuery.eq).toHaveBeenCalledWith('donor_id', 'user-1')
    })
  })
})
