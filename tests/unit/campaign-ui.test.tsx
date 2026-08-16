import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CampaignForm } from '@/components/dashboard/campaigns/CampaignForm'
import { DeleteCampaignButton } from '@/components/dashboard/campaigns/DeleteCampaignButton'
import { Campaign } from '@/lib/supabase/database.types'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock server actions
vi.mock('@/lib/actions/campaign.actions', () => ({
  createCampaignAction: vi.fn(),
  updateCampaignAction: vi.fn(),
  deleteCampaignAction: vi.fn().mockResolvedValue({ success: true }),
}))

describe('Admin Campaign UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('<CampaignForm />', () => {
    it('renders in create mode with empty default fields and "Create Campaign" button', () => {
      render(<CampaignForm />)

      expect(screen.getByLabelText(/Campaign Title/i)).toHaveValue('')
      expect(screen.getByLabelText(/Description/i)).toHaveValue('')
      expect(screen.getByLabelText(/Target Amount/i)).toHaveValue(0)
      expect(screen.getByLabelText(/Status/i)).toHaveValue('draft')
      expect(screen.getByRole('button', { name: /Create Campaign/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Cancel/i })).toHaveAttribute(
        'href',
        '/dashboard/campaigns'
      )
    })

    it('renders in edit mode pre-populated with initialData and "Save Changes" button', () => {
      const mockCampaign: Campaign = {
        id: 'camp-99',
        title: 'Ramadan Food Drive',
        description: 'Providing food packages for families in need.',
        target_amount: 15000,
        current_amount: 3200,
        status: 'active',
        deadline_at: '2026-09-01T12:00:00.000Z',
        created_by: 'admin-1',
        created_at: '2026-08-01T10:00:00.000Z',
      }

      render(<CampaignForm initialData={mockCampaign} />)

      expect(screen.getByLabelText(/Campaign Title/i)).toHaveValue('Ramadan Food Drive')
      expect(screen.getByLabelText(/Description/i)).toHaveValue(
        'Providing food packages for families in need.'
      )
      expect(screen.getByLabelText(/Target Amount/i)).toHaveValue(15000)
      expect(screen.getByLabelText(/Status/i)).toHaveValue('active')
      expect(screen.getByLabelText(/Deadline/i)).toHaveValue('2026-09-01T12:00')
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
    })

    it('allows typing into form fields', () => {
      render(<CampaignForm />)

      const titleInput = screen.getByLabelText(/Campaign Title/i)
      fireEvent.change(titleInput, { target: { value: 'Winter Relief 2026' } })
      expect(titleInput).toHaveValue('Winter Relief 2026')

      const descInput = screen.getByLabelText(/Description/i)
      fireEvent.change(descInput, { target: { value: 'Emergency warm clothing distribution' } })
      expect(descInput).toHaveValue('Emergency warm clothing distribution')

      const targetInput = screen.getByLabelText(/Target Amount/i)
      fireEvent.change(targetInput, { target: { value: '25000' } })
      expect(targetInput).toHaveValue(25000)

      const statusSelect = screen.getByLabelText(/Status/i)
      fireEvent.change(statusSelect, { target: { value: 'completed' } })
      expect(statusSelect).toHaveValue('completed')
    })
  })

  describe('<DeleteCampaignButton />', () => {
    it('renders delete button initially without the confirmation modal', () => {
      render(<DeleteCampaignButton id="camp-1" title="Test Campaign" />)

      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
      expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument()
    })

    it('opens confirmation modal when delete button is clicked', () => {
      render(<DeleteCampaignButton id="camp-1" title="Test Campaign" />)

      const deleteBtn = screen.getByRole('button', { name: /Delete/i })
      fireEvent.click(deleteBtn)

      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()
      expect(screen.getByText(/“Test Campaign”/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    it('closes modal when Cancel button is clicked', () => {
      render(<DeleteCampaignButton id="camp-1" title="Test Campaign" />)

      fireEvent.click(screen.getByRole('button', { name: /Delete/i }))
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
      fireEvent.click(cancelBtn)

      expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument()
    })
  })
})
