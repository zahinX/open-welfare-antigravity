import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getBeneficiaries,
  getBeneficiaryById,
  getBeneficiaryWithStats,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
} from '@/lib/services/beneficiary'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Beneficiary Service Layer (lib/services/beneficiary.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBeneficiaries', () => {
    it('should return a list of beneficiaries successfully', async () => {
      const mockData = [
        { id: 'b1', full_name: 'Ahmed Khan', status: 'approved', family_size: 4 },
        { id: 'b2', full_name: 'Fatima Begum', status: 'pending', family_size: 2 },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getBeneficiaries()

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockData)
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should apply status, search, and pagination filters', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getBeneficiaries({
        status: 'approved',
        search: 'Ahmed',
        offset: 10,
        limit: 10,
      })

      expect(result.error).toBeNull()
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'approved')
      expect(mockQuery.or).toHaveBeenCalledWith(
        'full_name.ilike.%Ahmed%,contact_phone.ilike.%Ahmed%,address.ilike.%Ahmed%'
      )
      expect(mockQuery.range).toHaveBeenCalledWith(10, 19)
    })

    it('should return an error when Supabase query fails', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database connection failed' } }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getBeneficiaries()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database connection failed')
    })
  })

  describe('getBeneficiaryById', () => {
    it('should return a single beneficiary by ID', async () => {
      const mockBeneficiary = { id: 'b1', full_name: 'Ahmed Khan', status: 'approved' }
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockBeneficiary, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getBeneficiaryById('b1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockBeneficiary)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'b1')
    })

    it('should return an error if beneficiary is not found', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Beneficiary not found' } }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getBeneficiaryById('non-existent')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Beneficiary not found')
    })
  })

  describe('getBeneficiaryWithStats (Derived Disbursed State)', () => {
    it('should compute aggregated total_disbursed and disbursement_count', async () => {
      const mockBeneficiary = { id: 'b1', full_name: 'Ahmed Khan', status: 'approved' }
      const mockDisbursements = [
        { amount_value: 500 },
        { amount_value: 250 },
      ]

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'beneficiaries') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: mockBeneficiary, error: null }),
            }
          }
          if (table === 'disbursements') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockDisbursements, error: null }),
            }
          }
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await getBeneficiaryWithStats('b1')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('b1')
      expect(result.data?.total_disbursed).toBe(750)
      expect(result.data?.disbursement_count).toBe(2)
    })
  })

  describe('createBeneficiary', () => {
    it('should insert and return a new beneficiary', async () => {
      const payload = {
        full_name: 'Rashid Ali',
        contact_phone: '+8801700000000',
        address: 'Dhaka, Bangladesh',
        family_size: 5,
        status: 'pending' as const,
      }
      const createdRecord = { id: 'b-new', ...payload }

      const mockQuery: any = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdRecord, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await createBeneficiary(payload)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(createdRecord)
      expect(mockQuery.insert).toHaveBeenCalledWith(payload)
    })
  })

  describe('updateBeneficiary', () => {
    it('should update and return the updated beneficiary', async () => {
      const updateData = { status: 'approved' as const, family_size: 6 }
      const updatedRecord = { id: 'b1', full_name: 'Rashid Ali', ...updateData }

      const mockQuery: any = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedRecord, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await updateBeneficiary('b1', updateData)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(updatedRecord)
      expect(mockQuery.update).toHaveBeenCalledWith(updateData)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'b1')
    })
  })

  describe('deleteBeneficiary', () => {
    it('should delete a beneficiary and return success', async () => {
      const mockQuery: any = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await deleteBeneficiary('b1')

      expect(result.error).toBeNull()
      expect(result.data).toBe(true)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'b1')
    })
  })
})
