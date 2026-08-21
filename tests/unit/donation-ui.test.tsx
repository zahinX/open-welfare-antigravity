import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DonationConfirmation } from '@/components/campaigns/DonationConfirmation'
import { RecentSupportersList } from '@/components/campaigns/RecentSupportersList'
import { DonationModal } from '@/components/campaigns/DonationModal'
import { Campaign, Donation } from '@/lib/supabase/database.types'

describe('Donation UI Components', () => {
  const mockCampaign: Campaign = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Winter Warmth Drive 2026',
    description: 'Providing winter clothes to vulnerable families.',
    target_amount: 50000,
    current_amount: 12000,
    status: 'active',
    currency: 'BDT',
    verification_text: 'Admin verified',
    verification_link: 'https://proof.example.com',
    deadline_at: null,
    created_by: 'user-admin',
    created_at: '2026-08-01T00:00:00Z',
  }

  const mockDonation: Donation = {
    id: 'don-12345-uuid',
    campaign_id: mockCampaign.id,
    donor_id: 'user-donor',
    donor_name: 'Jane Doe',
    donor_email: 'jane@example.com',
    donor_name_override: null,
    amount: 100,
    currency: 'USD',
    converted_amount: 12000,
    exchange_rate: 120,
    payment_method: 'card',
    payment_status: 'completed',
    is_anonymous: false,
    is_public: true,
    created_at: new Date().toISOString(),
  }

  describe('DonationConfirmation', () => {
    it('renders donation details and converted amount', () => {
      const onClose = vi.fn()
      render(
        <DonationConfirmation
          donation={mockDonation}
          campaignTitle={mockCampaign.title}
          onClose={onClose}
        />
      )

      expect(screen.getByText('Thank You for Your Support!')).toBeInTheDocument()
      expect(screen.getByText('Winter Warmth Drive 2026')).toBeInTheDocument()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText(/don-12345-uuid/)).toBeInTheDocument()

      const doneBtn = screen.getByRole('button', { name: /done/i })
      fireEvent.click(doneBtn)
      expect(onClose).toHaveBeenCalled()
    })

    it('displays anonymous correctly for anonymous donations', () => {
      const anonDonation: Donation = { ...mockDonation, is_anonymous: true }
      render(
        <DonationConfirmation
          donation={anonDonation}
          campaignTitle={mockCampaign.title}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('Anonymous')).toBeInTheDocument()
    })
  })

  describe('RecentSupportersList', () => {
    it('renders empty state message when there are no supporters', () => {
      render(<RecentSupportersList donations={[]} campaignCurrency="BDT" />)
      expect(
        screen.getByText(/Be the first supporter to contribute/i)
      ).toBeInTheDocument()
    })

    it('renders list of supporters with amounts', () => {
      const donations: Donation[] = [
        mockDonation,
        {
          ...mockDonation,
          id: 'don-2',
          donor_name: null,
          is_anonymous: true,
          amount: 500,
          currency: 'BDT',
          converted_amount: 500,
        },
      ]

      render(<RecentSupportersList donations={donations} campaignCurrency="BDT" />)

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('Anonymous Supporter')).toBeInTheDocument()
      expect(screen.getByText('Recent Supporters')).toBeInTheDocument()
    })
  })

  describe('DonationModal', () => {
    it('renders trigger button for active campaigns', () => {
      render(<DonationModal campaign={mockCampaign} />)
      expect(screen.getByRole('button', { name: /donate now/i })).toBeInTheDocument()
    })

    it('does not render trigger button for inactive campaigns', () => {
      const closedCampaign: Campaign = { ...mockCampaign, status: 'completed' }
      const { container } = render(<DonationModal campaign={closedCampaign} />)
      expect(container.firstChild).toBeNull()
    })

    it('opens modal on trigger button click', () => {
      render(<DonationModal campaign={mockCampaign} />)
      const triggerBtn = screen.getByRole('button', { name: /donate now/i })
      fireEvent.click(triggerBtn)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Support this Campaign')).toBeInTheDocument()
      expect(screen.getByLabelText(/select currency/i)).toBeInTheDocument()
    })
  })
})
