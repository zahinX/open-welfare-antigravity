import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getDisbursements,
  getDisbursementsByBeneficiary,
  getDisbursementsByCampaign,
  getDisbursementById,
  createDisbursement,
  updateDisbursement,
  deleteDisbursement,
  getDisbursementStats,
} from '@/lib/services/disbursement'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Disbursement Service Layer (lib/services/disbursement.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDisbursements', () => {
    it('should return a list of disbursements successfully', async () => {
      const mockData = [
        {
          id: 'd1',
          amount_value: 500,
          description: 'Winter clothing package',
          beneficiary_id: 'b1',
        },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getDisbursements()

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockData)
      expect(mockQuery.order).toHaveBeenCalledWith('disbursed_at', { ascending: false })
    })

    it('should filter by beneficiaryId and campaignId', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getDisbursements({
        beneficiaryId: 'b1',
        campaignId: 'c1',
        offset: 5,
        limit: 10,
      })

      expect(result.error).toBeNull()
      expect(mockQuery.eq).toHaveBeenCalledWith('beneficiary_id', 'b1')
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'c1')
      expect(mockQuery.range).toHaveBeenCalledWith(5, 14)
    })
  })

  describe('convenience helpers', () => {
    it('getDisbursementsByBeneficiary should filter by beneficiaryId', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      await getDisbursementsByBeneficiary('b1')
      expect(mockQuery.eq).toHaveBeenCalledWith('beneficiary_id', 'b1')
    })

    it('getDisbursementsByCampaign should filter by campaignId', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      await getDisbursementsByCampaign('c1')
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'c1')
    })
  })

  describe('getDisbursementById', () => {
    it('should return a single disbursement by ID', async () => {
      const mockRecord = { id: 'd1', amount_value: 300, description: 'Medical aid' }
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockRecord, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getDisbursementById('d1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockRecord)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'd1')
    })
  })

  describe('createDisbursement', () => {
    it('should create and return a disbursement record', async () => {
      const payload = {
        beneficiary_id: 'b1',
        amount_value: 200,
        description: 'Emergency food basket',
        logged_by: 'admin-1',
      }
      const created = { id: 'd-new', ...payload }

      const mockQuery: any = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: created, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await createDisbursement(payload)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(created)
      expect(mockQuery.insert).toHaveBeenCalledWith(payload)
    })
  })

  describe('updateDisbursement', () => {
    it('should update and return a disbursement record', async () => {
      const updateData = { amount_value: 250 }
      const updated = { id: 'd1', amount_value: 250 }

      const mockQuery: any = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await updateDisbursement('d1', updateData)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(updated)
      expect(mockQuery.update).toHaveBeenCalledWith(updateData)
    })
  })

  describe('deleteDisbursement', () => {
    it('should delete a disbursement and return success', async () => {
      const mockQuery: any = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await deleteDisbursement('d1')

      expect(result.error).toBeNull()
      expect(result.data).toBe(true)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'd1')
    })
  })

  describe('getDisbursementStats', () => {
    it('should calculate totalAmount and totalCount correctly', async () => {
      const mockData = [{ amount_value: 100 }, { amount_value: 200 }, { amount_value: 300 }]
      const mockQuery: any = {
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getDisbursementStats()

      expect(result.error).toBeNull()
      expect(result.data?.totalCount).toBe(3)
      expect(result.data?.totalAmount).toBe(600)
    })
  })
})
