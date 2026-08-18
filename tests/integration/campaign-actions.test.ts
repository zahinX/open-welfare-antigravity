import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createCampaignAction,
  updateCampaignAction,
  deleteCampaignAction,
} from '@/lib/actions/campaign.actions'
import * as campaignService from '@/lib/services/campaign'
import { getUserProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase server helper
vi.mock('@/lib/supabase/server', () => ({
  getUserProfile: vi.fn(),
}))

// Mock campaign service
vi.mock('@/lib/services/campaign', () => ({
  createCampaign: vi.fn(),
  updateCampaign: vi.fn(),
  deleteCampaign: vi.fn(),
}))

describe('Campaign Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCampaignAction', () => {
    it('should reject unauthenticated requests', async () => {
      vi.mocked(getUserProfile).mockResolvedValue(null)

      const result = await createCampaignAction({
        title: 'Emergency Medical Camp',
        description: 'Fundraiser for medical aid',
        target_amount: 10000,
        currency: 'BDT',
        status: 'draft',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })

    it('should reject non-admin users (e.g., volunteer or public)', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'user-vol' } as any,
        profile: { id: 'user-vol', role: 'volunteer', full_name: 'Jane Volunteer' } as any,
      })

      const result = await createCampaignAction({
        title: 'Emergency Medical Camp',
        description: 'Fundraiser for medical aid',
        target_amount: 10000,
        currency: 'BDT',
        status: 'draft',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Forbidden')
    })

    it('should return validation errors for invalid payload', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'admin-1' } as any,
        profile: { id: 'admin-1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const result = await createCampaignAction({
        title: 'Hi', // Less than 3 characters
        description: 'Short', // Less than 10 characters
        target_amount: -50, // Negative amount
        currency: 'INVALID_LONG_CODE', // Invalid currency
        status: 'draft',
      })

      expect(result.success).toBe(false)
      expect(result.fieldErrors).toBeDefined()
      expect(result.fieldErrors?.title).toBeDefined()
      expect(result.fieldErrors?.description).toBeDefined()
      expect(result.fieldErrors?.target_amount).toBeDefined()
      expect(result.fieldErrors?.currency).toBeDefined()
    })

    it('should successfully create campaign and revalidate paths for admin', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'admin-1' } as any,
        profile: { id: 'admin-1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const createdRecord = {
        id: 'camp-123',
        title: 'Winter Blanket Drive',
        description: 'Distributing warm blankets to the needy',
        target_amount: 5000,
        current_amount: 0,
        status: 'draft' as const,
        currency: 'USD',
        verification_text: 'Verified by Mosque Admin',
        verification_link: 'https://example.com/proof',
        deadline_at: null,
        created_by: 'admin-1',
        created_at: new Date().toISOString(),
      }

      vi.mocked(campaignService.createCampaign).mockResolvedValue({
        data: createdRecord,
        error: null,
      })

      const result = await createCampaignAction({
        title: 'Winter Blanket Drive',
        description: 'Distributing warm blankets to the needy',
        target_amount: 5000,
        currency: 'USD',
        verification_text: 'Verified by Mosque Admin',
        verification_link: 'https://example.com/proof',
        status: 'draft',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdRecord)
      expect(campaignService.createCampaign).toHaveBeenCalledWith({
        title: 'Winter Blanket Drive',
        description: 'Distributing warm blankets to the needy',
        target_amount: 5000,
        currency: 'USD',
        verification_text: 'Verified by Mosque Admin',
        verification_link: 'https://example.com/proof',
        status: 'draft',
        created_by: 'admin-1',
      })
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/campaigns')
      expect(revalidatePath).toHaveBeenCalledWith('/campaigns')
    })
  })

  describe('updateCampaignAction', () => {
    it('should reject unauthenticated updates', async () => {
      vi.mocked(getUserProfile).mockResolvedValue(null)

      const result = await updateCampaignAction('camp-123', {
        title: 'Updated Campaign Title',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })

    it('should reject update if campaign ID is empty', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'admin-1' } as any,
        profile: { id: 'admin-1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const result = await updateCampaignAction('', {
        title: 'Updated Campaign Title',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Campaign ID is required')
    })

    it('should successfully update campaign for admin', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'admin-1' } as any,
        profile: { id: 'admin-1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const updatedRecord = {
        id: 'camp-123',
        title: 'Updated Title',
        description: 'Updated long description here',
        target_amount: 8000,
        current_amount: 2000,
        status: 'active' as const,
        currency: 'BDT',
        verification_text: 'Updated verification note',
        verification_link: null,
        deadline_at: null,
        created_by: 'admin-1',
        created_at: new Date().toISOString(),
      }

      vi.mocked(campaignService.updateCampaign).mockResolvedValue({
        data: updatedRecord,
        error: null,
      })

      const result = await updateCampaignAction('camp-123', {
        title: 'Updated Title',
        target_amount: 8000,
        status: 'active',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedRecord)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/campaigns')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/campaigns/camp-123')
    })
  })

  describe('deleteCampaignAction', () => {
    it('should reject deletion for non-admins', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'user-2' } as any,
        profile: { id: 'user-2', role: 'public', full_name: 'Public User' } as any,
      })

      const result = await deleteCampaignAction('camp-123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Forbidden')
    })

    it('should successfully delete campaign for admin', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'admin-1' } as any,
        profile: { id: 'admin-1', role: 'admin', full_name: 'Admin User' } as any,
      })

      vi.mocked(campaignService.deleteCampaign).mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await deleteCampaignAction('camp-123')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/campaigns')
    })
  })
})
