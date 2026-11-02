'use server'

import { revalidatePath } from 'next/cache'
import { getUserProfile } from '@/lib/supabase/server'
import { getPublicCampaignById } from '@/lib/services/campaign'
import { convertCurrency } from '@/lib/services/currency'
import { createDonation } from '@/lib/services/donation'
import {
  createDonationSchema,
  CreateDonationRawInput,
} from '@/lib/validations/donation'
import { Donation } from '@/lib/supabase/database.types'
import { ActionResult } from '@/lib/actions/campaign.actions'

/**
 * Server Action: Process and record a campaign donation.
 * Open to both authenticated users and anonymous/guest supporters.
 */
export async function createDonationAction(
  rawInput: CreateDonationRawInput
): Promise<ActionResult<Donation>> {
  try {
    // 1. Schema Validation
    const validation = createDonationSchema.safeParse(rawInput)
    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of validation.error.issues) {
        const fieldName = issue.path.join('.')
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = []
        }
        fieldErrors[fieldName].push(issue.message)
      }
      return {
        success: false,
        error: 'Invalid donation information.',
        fieldErrors,
      }
    }

    const donationData = validation.data

    // 2. Fetch Target Campaign to determine base currency & active status
    const { data: campaign, error: campaignError } = await getPublicCampaignById(
      donationData.campaign_id
    )

    if (campaignError || !campaign) {
      return {
        success: false,
        error: 'The requested campaign was not found or is no longer accessible.',
      }
    }

    if (campaign.status !== 'active') {
      return {
        success: false,
        error: 'Donations are only accepted for active campaigns.',
      }
    }

    // 3. Optional Authentication Check (to link donor profile if logged in)
    let donorId: string | null = null
    let fallbackDonorName: string | null = null
    let fallbackDonorEmail: string | null = null

    try {
      const authData = await getUserProfile()
      if (authData?.user) {
        donorId = authData.user.id
        fallbackDonorName = authData.profile?.full_name ?? null
        fallbackDonorEmail = authData.user.email ?? null
      }
    } catch {
      // Allow guest donation if unauthenticated or session parsing fails
      donorId = null
    }

    // 4. Currency Conversion & Exchange Rate Calculation
    const targetCurrency = campaign.currency || 'BDT'
    const conversion = convertCurrency(
      donationData.amount,
      donationData.currency,
      targetCurrency
    )

    // 5. Build Payload & Delegate to Service Layer
    const donorName = donationData.donor_name || fallbackDonorName
    const donorEmail = donationData.donor_email || fallbackDonorEmail

    const { data: donation, error: donationError } = await createDonation({
      campaign_id: campaign.id,
      donor_id: donorId,
      donor_name: donorName,
      donor_email: donorEmail,
      amount: donationData.amount,
      currency: donationData.currency,
      converted_amount: conversion.convertedAmount,
      exchange_rate: conversion.exchangeRate,
      payment_method: donationData.payment_method,
      payment_status: 'completed',
      is_anonymous: donationData.is_anonymous,
      is_public: !donationData.is_anonymous,
    })

    if (donationError || !donation) {
      return {
        success: false,
        error: donationError || 'Failed to process donation transaction.',
      }
    }

    // 6. Cache Invalidation
    revalidatePath('/campaigns')
    revalidatePath(`/campaigns/${campaign.id}`)
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/campaigns')

    return {
      success: true,
      data: donation,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}
