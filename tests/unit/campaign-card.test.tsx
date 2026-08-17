import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from '@/components/campaigns/ProgressBar'
import { CampaignCard } from '@/components/campaigns/CampaignCard'
import { Campaign } from '@/lib/supabase/database.types'

describe('Public Campaign UI Components', () => {
  describe('<ProgressBar />', () => {
    it('renders with correct progress percentage and ARIA attributes', () => {
      render(<ProgressBar current={2500} target={5000} showLabel />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '2500')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '5000')
      expect(progressBar).toHaveAttribute(
        'aria-label',
        'Fundraising progress: 50% of goal reached'
      )
      expect(screen.getByText('50.0% funded')).toBeInTheDocument()
      expect(screen.getByText('50% of goal')).toBeInTheDocument()
    })

    it('caps percentage at 100% when current exceeds target', () => {
      render(<ProgressBar current={6000} target={5000} showLabel />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute(
        'aria-label',
        'Fundraising progress: 100% of goal reached'
      )
      expect(screen.getByText('120.0% funded')).toBeInTheDocument()
    })

    it('handles 0 target amount gracefully without dividing by zero', () => {
      render(<ProgressBar current={0} target={0} showLabel />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute(
        'aria-label',
        'Fundraising progress: 0% of goal reached'
      )
      expect(screen.getByText('0.0% funded')).toBeInTheDocument()
    })
  })

  describe('<CampaignCard />', () => {
    const mockActiveCampaign: Campaign = {
      id: 'c-101',
      title: 'Winter Warmth 2026',
      description: 'Distributing blankets and winter clothes to poor families in rural areas.',
      target_amount: 100000,
      current_amount: 45000,
      status: 'active',
      deadline_at: '2026-12-31T23:59:59.000Z',
      created_by: 'admin-1',
      created_at: '2026-08-01T10:00:00.000Z',
    }

    it('renders campaign details with formatted amounts, progress, and link', () => {
      render(<CampaignCard campaign={mockActiveCampaign} />)

      expect(screen.getByText('Winter Warmth 2026')).toBeInTheDocument()
      expect(
        screen.getByText(/Distributing blankets and winter clothes/i)
      ).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('45%')).toBeInTheDocument()

      const link = screen.getByRole('link', { name: /View campaign: Winter Warmth 2026/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/campaigns/c-101')
    })

    it('renders "Completed" badge and status correctly for completed campaigns', () => {
      const mockCompletedCampaign: Campaign = {
        ...mockActiveCampaign,
        id: 'c-102',
        status: 'completed',
        current_amount: 100000,
      }

      render(<CampaignCard campaign={mockCompletedCampaign} />)

      expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('renders "Ongoing" when deadline_at is null', () => {
      const mockOngoingCampaign: Campaign = {
        ...mockActiveCampaign,
        deadline_at: null,
      }

      render(<CampaignCard campaign={mockOngoingCampaign} />)

      expect(screen.getByText('Ongoing')).toBeInTheDocument()
    })
  })
})
