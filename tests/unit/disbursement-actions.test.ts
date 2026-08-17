import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createDisbursementAction,
  updateDisbursementAction,
  deleteDisbursementAction,
} from '@/lib/actions/disbursement.actions'
import { getUserProfile } from '@/lib/supabase/server'
import {
  createDisbursement,
  updateDisbursement,
  deleteDisbursement,
} from '@/lib/services/disbursement'
import { revalidatePath } from 'next/cache'

// Mock dependencies
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  getUserProfile: vi.fn(),
}))

vi.mock('@/lib/services/disbursement', () => ({
  createDisbursement: vi.fn(),
  updateDisbursement: vi.fn(),
  deleteDisbursement: vi.fn(),
}))

const VALID_BENEFICIARY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const VALID_CAMPAIGN_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'

describe('Disbursement Server Actions (lib/actions/disbursement.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createDisbursementAction', () => {
    it('should reject unauthenticated calls', async () => {
      vi.mocked(getUserProfile).mockResolvedValue(null)

      const result = await createDisbursementAction({
        beneficiary_id: VALID_BENEFICIARY_ID,
        amount_value: 100,
        description: 'Aid grant',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })

    it('should reject non-admin users', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'u1' } as any,
        profile: { id: 'u1', role: 'public', full_name: 'Public User' } as any,
      })

      const result = await createDisbursementAction({
        beneficiary_id: VALID_BENEFICIARY_ID,
        amount_value: 100,
        description: 'Aid grant',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Forbidden')
    })

    it('should reject invalid amount and empty description', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const result = await createDisbursementAction({
        beneficiary_id: VALID_BENEFICIARY_ID,
        amount_value: -10, // must be > 0
        description: 'ab', // too short (< 3)
      })

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.['amount_value']).toBeDefined()
      expect(result.fieldErrors?.['description']).toBeDefined()
    })

    it('should record disbursement with logged_by injected and revalidate relevant paths', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'admin-99' } as any,
        profile: { id: 'admin-99', role: 'admin', full_name: 'Super Admin' } as any,
      })

      const mockCreated = {
        id: 'd1',
        beneficiary_id: VALID_BENEFICIARY_ID,
        campaign_id: VALID_CAMPAIGN_ID,
        amount_value: 500,
        description: 'Medical support grant',
        logged_by: 'admin-99',
        disbursed_at: '2026-08-18',
        created_at: '2026-08-18',
      }

      vi.mocked(createDisbursement).mockResolvedValue({
        data: mockCreated,
        error: null,
      })

      const result = await createDisbursementAction({
        beneficiary_id: VALID_BENEFICIARY_ID,
        campaign_id: VALID_CAMPAIGN_ID,
        amount_value: 500,
        description: 'Medical support grant',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCreated)
      expect(createDisbursement).toHaveBeenCalledWith(
        expect.objectContaining({
          beneficiary_id: VALID_BENEFICIARY_ID,
          campaign_id: VALID_CAMPAIGN_ID,
          amount_value: 500,
          description: 'Medical support grant',
          logged_by: 'admin-99',
        })
      )
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/beneficiaries')
      expect(revalidatePath).toHaveBeenCalledWith(
        `/dashboard/beneficiaries/${VALID_BENEFICIARY_ID}`
      )
      expect(revalidatePath).toHaveBeenCalledWith(
        `/dashboard/campaigns/${VALID_CAMPAIGN_ID}`
      )
    })
  })

  describe('updateDisbursementAction', () => {
    it('should update disbursement and revalidate related paths', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const mockUpdated = {
        id: 'd1',
        beneficiary_id: 'b1',
        campaign_id: null,
        amount_value: 600,
        description: 'Updated description',
        logged_by: 'a1',
        disbursed_at: '2026-08-18',
        created_at: '2026-08-18',
      }

      vi.mocked(updateDisbursement).mockResolvedValue({
        data: mockUpdated,
        error: null,
      })

      const result = await updateDisbursementAction('d1', {
        amount_value: 600,
        description: 'Updated description',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdated)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/beneficiaries')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/beneficiaries/b1')
    })
  })

  describe('deleteDisbursementAction', () => {
    it('should delete disbursement and revalidate cache', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      vi.mocked(deleteDisbursement).mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await deleteDisbursementAction('d1', 'b1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/beneficiaries')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/beneficiaries/b1')
    })
  })
})
