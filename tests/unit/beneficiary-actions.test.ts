import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createBeneficiaryAction,
  updateBeneficiaryAction,
  deleteBeneficiaryAction,
} from '@/lib/actions/beneficiary.actions'
import { getUserProfile } from '@/lib/supabase/server'
import {
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
} from '@/lib/services/beneficiary'
import { revalidatePath } from 'next/cache'

// Mock dependencies
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  getUserProfile: vi.fn(),
}))

vi.mock('@/lib/services/beneficiary', () => ({
  createBeneficiary: vi.fn(),
  updateBeneficiary: vi.fn(),
  deleteBeneficiary: vi.fn(),
}))

describe('Beneficiary Server Actions (lib/actions/beneficiary.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createBeneficiaryAction', () => {
    it('should reject unauthenticated calls', async () => {
      vi.mocked(getUserProfile).mockResolvedValue(null)

      const result = await createBeneficiaryAction({
        full_name: 'Test Beneficiary',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })

    it('should reject non-admin users', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'u1' } as any,
        profile: { id: 'u1', role: 'volunteer', full_name: 'Volunteer User' } as any,
      })

      const result = await createBeneficiaryAction({
        full_name: 'Test Beneficiary',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Forbidden')
    })

    it('should reject invalid input data with field errors', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const result = await createBeneficiaryAction({
        full_name: 'A', // too short (< 2)
        family_size: 0, // must be >= 1
      } as any)

      expect(result.success).toBe(false)
      expect(result.fieldErrors).toBeDefined()
      expect(result.fieldErrors?.['full_name']).toBeDefined()
      expect(result.fieldErrors?.['family_size']).toBeDefined()
    })

    it('should create beneficiary and revalidate cache on valid admin call', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const mockCreated = {
        id: 'b1',
        full_name: 'Valid Beneficiary',
        family_size: 3,
        status: 'pending' as const,
        contact_phone: null,
        address: null,
        assessment_notes: null,
        created_at: '2026-08-18',
        updated_at: '2026-08-18',
      }

      vi.mocked(createBeneficiary).mockResolvedValue({
        data: mockCreated,
        error: null,
      })

      const result = await createBeneficiaryAction({
        full_name: 'Valid Beneficiary',
        family_size: 3,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCreated)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/beneficiaries')
    })
  })

  describe('updateBeneficiaryAction', () => {
    it('should update beneficiary and revalidate both list and detail paths', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const mockUpdated = {
        id: 'b1',
        full_name: 'Updated Beneficiary',
        family_size: 4,
        status: 'approved' as const,
        contact_phone: null,
        address: null,
        assessment_notes: null,
        created_at: '2026-08-18',
        updated_at: '2026-08-18',
      }

      vi.mocked(updateBeneficiary).mockResolvedValue({
        data: mockUpdated,
        error: null,
      })

      const result = await updateBeneficiaryAction('b1', {
        status: 'approved',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdated)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/beneficiaries')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/beneficiaries/b1')
    })
  })

  describe('deleteBeneficiaryAction', () => {
    it('should delete beneficiary and revalidate cache', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      vi.mocked(deleteBeneficiary).mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await deleteBeneficiaryAction('b1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/beneficiaries')
    })
  })
})
