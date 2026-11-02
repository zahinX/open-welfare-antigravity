import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createDonationAction } from '@/lib/actions/donation.actions'
import * as campaignService from '@/lib/services/campaign'
import * as donationService from '@/lib/services/donation'
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
  getPublicCampaignById: vi.fn(),
}))

// Mock donation service
vi.mock('@/lib/services/donation', () => ({
  createDonation: vi.fn(),
}))

describe('Donation Server Actions (lib/actions/donation.actions.ts)', () => {
  const activeCampaign: import('@/lib/supabase/database.types').Campaign = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Winter Warmth 2026',
    description: 'Providing warm clothing to families in need.',
    status: 'active',
    currency: 'BDT',
    target_amount: 100000,
    current_amount: 25000,
    verification_text: 'Admin Verified',
    verification_link: null,
    deadline_at: null,
    created_by: 'user-admin',
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return field validation errors for invalid inputs', async () => {
    const result = await createDonationAction({
      campaign_id: 'invalid-not-uuid',
      amount: -10,
      currency: 'TOOLONG',
    } as any)

    expect(result.success).toBe(false)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.campaign_id).toBeDefined()
    expect(result.fieldErrors?.amount).toBeDefined()
    expect(result.fieldErrors?.currency).toBeDefined()
  })

  it('should reject donation if campaign is not found', async () => {
    vi.mocked(campaignService.getPublicCampaignById).mockResolvedValue({
      data: null,
      error: 'Not found',
    })

    const result = await createDonationAction({
      campaign_id: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1000,
      currency: 'BDT',
      payment_method: 'bkash',
      is_anonymous: false,
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('not found or is no longer accessible')
  })

  it('should reject donation if campaign is completed/not active', async () => {
    vi.mocked(campaignService.getPublicCampaignById).mockResolvedValue({
      data: { ...activeCampaign, status: 'completed' as any },
      error: null,
    })

    const result = await createDonationAction({
      campaign_id: activeCampaign.id,
      amount: 1000,
      currency: 'BDT',
      payment_method: 'bkash',
      is_anonymous: false,
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('only accepted for active campaigns')
  })

  it('should process guest donation and calculate currency conversion correctly', async () => {
    vi.mocked(campaignService.getPublicCampaignById).mockResolvedValue({
      data: activeCampaign as any,
      error: null,
    })

    vi.mocked(getUserProfile).mockResolvedValue(null)

    const expectedCreatedDonation = {
      id: 'don-guest-1',
      campaign_id: activeCampaign.id,
      donor_id: null,
      donor_name: 'Guest Supporter',
      donor_email: 'guest@example.com',
      donor_name_override: null,
      amount: 50,
      currency: 'USD',
      converted_amount: 6000, // 50 * 120
      exchange_rate: 120,
      payment_method: 'card',
      payment_status: 'completed',
      is_anonymous: false,
      is_public: true,
      created_at: new Date().toISOString(),
    }

    vi.mocked(donationService.createDonation).mockResolvedValue({
      data: expectedCreatedDonation,
      error: null,
    })

    const result = await createDonationAction({
      campaign_id: activeCampaign.id,
      amount: 50,
      currency: 'USD',
      donor_name: 'Guest Supporter',
      donor_email: 'guest@example.com',
      payment_method: 'card',
      is_anonymous: false,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(expectedCreatedDonation)
    expect(donationService.createDonation).toHaveBeenCalledWith(
      expect.objectContaining({
        campaign_id: activeCampaign.id,
        amount: 50,
        currency: 'USD',
        converted_amount: 6000,
        exchange_rate: 120,
        donor_id: null,
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/campaigns')
    expect(revalidatePath).toHaveBeenCalledWith(`/campaigns/${activeCampaign.id}`)
  })

  it('should attach authenticated user details automatically when donor is logged in', async () => {
    vi.mocked(campaignService.getPublicCampaignById).mockResolvedValue({
      data: activeCampaign as any,
      error: null,
    })

    vi.mocked(getUserProfile).mockResolvedValue({
      user: { id: 'auth-user-99', email: 'user@example.com' } as any,
      profile: { id: 'auth-user-99', full_name: 'Authenticated Donor', role: 'public' } as any,
    })

    const expectedCreatedDonation = {
      id: 'don-auth-1',
      campaign_id: activeCampaign.id,
      donor_id: 'auth-user-99',
      donor_name: 'Authenticated Donor',
      donor_email: 'user@example.com',
      donor_name_override: null,
      amount: 500,
      currency: 'BDT',
      converted_amount: 500,
      exchange_rate: 1,
      payment_method: 'bkash',
      payment_status: 'completed',
      is_anonymous: true,
      is_public: false,
      created_at: new Date().toISOString(),
    }

    vi.mocked(donationService.createDonation).mockResolvedValue({
      data: expectedCreatedDonation,
      error: null,
    })

    const result = await createDonationAction({
      campaign_id: activeCampaign.id,
      amount: 500,
      currency: 'BDT',
      payment_method: 'bkash',
      is_anonymous: true,
    })

    expect(result.success).toBe(true)
    expect(donationService.createDonation).toHaveBeenCalledWith(
      expect.objectContaining({
        campaign_id: activeCampaign.id,
        donor_id: 'auth-user-99',
        donor_name: 'Authenticated Donor',
        donor_email: 'user@example.com',
        is_anonymous: true,
        is_public: false,
      })
    )
  })
})
