import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getPublicCampaigns,
  getPublicCampaignById,
} from '@/lib/services/campaign'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Public Campaign Service (lib/services/campaign.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPublicCampaigns', () => {
    it('should return active and completed campaigns successfully', async () => {
      const mockCampaigns = [
        { id: '1', title: 'Active Campaign', status: 'active', target_amount: 1000, current_amount: 500 },
        { id: '2', title: 'Completed Campaign', status: 'completed', target_amount: 2000, current_amount: 2000 },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockCampaigns, error: null }),
        limit: vi.fn().mockReturnThis(),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getPublicCampaigns()

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCampaigns)
      expect(mockQuery.in).toHaveBeenCalledWith('status', ['active', 'completed'])
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should apply limit filter when specified', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getPublicCampaigns({ limit: 3 })

      expect(result.error).toBeNull()
      expect(mockQuery.limit).toHaveBeenCalledWith(3)
    })

    it('should return an error when Supabase fails', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Network error' } }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getPublicCampaigns()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Network error')
    })
  })

  describe('getPublicCampaignById', () => {
    it('should return a public campaign when found', async () => {
      const mockCampaign = {
        id: 'c1',
        title: 'Emergency Aid',
        status: 'active',
        target_amount: 5000,
        current_amount: 1200,
      }

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCampaign, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getPublicCampaignById('c1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCampaign)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'c1')
      expect(mockQuery.in).toHaveBeenCalledWith('status', ['active', 'completed'])
    })

    it('should return error when public campaign is not found', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getPublicCampaignById('c-non-existent')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Row not found')
    })
  })
})
