import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '@/lib/services/campaign'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Campaign Service Layer (lib/services/campaign.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCampaigns', () => {
    it('should return a list of campaigns successfully', async () => {
      const mockData = [
        { id: '1', title: 'Winter Relief', status: 'active', target_amount: 1000 },
        { id: '2', title: 'Food Drive', status: 'draft', target_amount: 500 },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getCampaigns()

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockData)
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should apply status and limit filters when provided', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getCampaigns({ status: 'active', limit: 5 })

      expect(result.error).toBeNull()
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active')
      expect(mockQuery.limit).toHaveBeenCalledWith(5)
    })

    it('should return an error when Supabase query fails', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getCampaigns()

      expect(result.data).toBeNull()
      expect(result.error).toBe('DB error')
    })
  })

  describe('getCampaignById', () => {
    it('should return a single campaign by ID', async () => {
      const mockCampaign = { id: 'c1', title: 'Health Clinic', status: 'active' }
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCampaign, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getCampaignById('c1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCampaign)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'c1')
    })

    it('should return an error if campaign is not found', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getCampaignById('non-existent')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Row not found')
    })
  })

  describe('createCampaign', () => {
    it('should insert and return a new campaign', async () => {
      const payload = {
        title: 'Education for All',
        description: 'Providing school supplies',
        target_amount: 5000,
        created_by: 'user-123',
      }
      const createdRecord = { id: 'c-new', ...payload, current_amount: 0, status: 'draft' }

      const mockQuery: any = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdRecord, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await createCampaign(payload)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(createdRecord)
      expect(mockQuery.insert).toHaveBeenCalledWith(payload)
    })
  })

  describe('updateCampaign', () => {
    it('should update and return the updated campaign', async () => {
      const updateData = { title: 'Updated Title', target_amount: 8000 }
      const updatedRecord = { id: 'c1', ...updateData }

      const mockQuery: any = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedRecord, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await updateCampaign('c1', updateData)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(updatedRecord)
      expect(mockQuery.update).toHaveBeenCalledWith(updateData)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'c1')
    })
  })

  describe('deleteCampaign', () => {
    it('should delete a campaign and return success', async () => {
      const mockQuery: any = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await deleteCampaign('c1')

      expect(result.error).toBeNull()
      expect(result.data).toBe(true)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'c1')
    })
  })
})
