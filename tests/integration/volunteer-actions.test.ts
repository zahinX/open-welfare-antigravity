import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createShiftAction,
  updateShiftAction,
  deleteShiftAction,
  signUpAction,
  cancelSignUpAction,
} from '@/lib/actions/volunteer.actions'
import * as volunteerService from '@/lib/services/volunteer'
import { getUserProfile } from '@/lib/supabase/server'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase server helper
vi.mock('@/lib/supabase/server', () => ({
  getUserProfile: vi.fn(),
}))

// Mock volunteer service
vi.mock('@/lib/services/volunteer', () => ({
  createShift: vi.fn(),
  updateShift: vi.fn(),
  deleteShift: vi.fn(),
  signUpForShift: vi.fn(),
  cancelSignUp: vi.fn(),
  markAttendance: vi.fn(),
}))

describe('Volunteer Server Actions Integration & Permission Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Shift Management Lifecycle (Admin Only)', () => {
    it('blocks non-admin users from creating, updating, or deleting shifts', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'public-user' } as any,
        profile: { id: 'public-user', role: 'public', full_name: 'Regular Public' } as any,
      })

      const createRes = await createShiftAction({
        title: 'Unauthorized Shift',
        description: 'Unauthorized description',
        location: 'Dhaka',
        start_time: '2026-09-01T10:00:00Z',
        end_time: '2026-09-01T14:00:00Z',
        max_volunteers: 5,
      })
      expect(createRes.success).toBe(false)
      expect(createRes.error).toContain('Forbidden')

      const updateRes = await updateShiftAction('shift-1', { title: 'New' })
      expect(updateRes.success).toBe(false)
      expect(updateRes.error).toContain('Forbidden')

      const deleteRes = await deleteShiftAction('shift-1')
      expect(deleteRes.success).toBe(false)
      expect(deleteRes.error).toContain('Forbidden')
    })

    it('allows admin users full lifecycle control over shifts', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'admin-user' } as any,
        profile: { id: 'admin-user', role: 'admin', full_name: 'Admin Boss' } as any,
      })

      const mockShift = {
        id: 'shift-99',
        title: 'Emergency Medical Kit Packing',
        description: 'Packing medical aid for flood survivors',
        location: 'Central Depot',
        start_time: '2026-09-10T09:00:00Z',
        end_time: '2026-09-10T17:00:00Z',
        max_volunteers: 20,
        created_by: 'admin-user',
        created_at: '2026-08-18',
        updated_at: '2026-08-18',
      }

      vi.mocked(volunteerService.createShift).mockResolvedValue({
        data: mockShift,
        error: null,
      })
      vi.mocked(volunteerService.updateShift).mockResolvedValue({
        data: { ...mockShift, title: 'Updated Title' },
        error: null,
      })
      vi.mocked(volunteerService.deleteShift).mockResolvedValue({
        data: true,
        error: null,
      })

      // 1. Create
      const createRes = await createShiftAction({
        title: 'Emergency Medical Kit Packing',
        description: 'Packing medical aid for flood survivors',
        location: 'Central Depot',
        start_time: '2026-09-10T09:00:00Z',
        end_time: '2026-09-10T17:00:00Z',
        max_volunteers: 20,
      })
      expect(createRes.success).toBe(true)
      expect(createRes.data?.id).toBe('shift-99')

      // 2. Update
      const updateRes = await updateShiftAction('shift-99', { title: 'Updated Title' })
      expect(updateRes.success).toBe(true)
      expect(updateRes.data?.title).toBe('Updated Title')

      // 3. Delete
      const deleteRes = await deleteShiftAction('shift-99')
      expect(deleteRes.success).toBe(true)
    })
  })

  describe('Volunteer Signup & Cancel Lifecycle', () => {
    it('allows authenticated public or volunteer users to sign up and cancel', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'volunteer-user-1' } as any,
        profile: { id: 'volunteer-user-1', role: 'volunteer', full_name: 'Volunteer Sarah' } as any,
      })

      const shiftId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
      const mockSignup = {
        id: 'signup-100',
        shift_id: shiftId,
        user_id: 'volunteer-user-1',
        attended: false,
        created_at: '2026-08-18',
      }

      vi.mocked(volunteerService.signUpForShift).mockResolvedValue({
        data: mockSignup,
        error: null,
      })
      vi.mocked(volunteerService.cancelSignUp).mockResolvedValue({
        data: true,
        error: null,
      })

      // Sign up
      const signupRes = await signUpAction({ shift_id: shiftId })
      expect(signupRes.success).toBe(true)
      expect(signupRes.data?.id).toBe('signup-100')
      expect(volunteerService.signUpForShift).toHaveBeenCalledWith(shiftId, 'volunteer-user-1')

      // Cancel
      const cancelRes = await cancelSignUpAction(shiftId)
      expect(cancelRes.success).toBe(true)
      expect(volunteerService.cancelSignUp).toHaveBeenCalledWith(shiftId, 'volunteer-user-1')
    })

    it('bubbles capacity limit errors gracefully to caller', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'volunteer-user-2' } as any,
        profile: { id: 'volunteer-user-2', role: 'public', full_name: 'Volunteer Bob' } as any,
      })

      const shiftId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
      vi.mocked(volunteerService.signUpForShift).mockResolvedValue({
        data: null,
        error: 'This volunteer shift has reached maximum capacity.',
      })

      const signupRes = await signUpAction({ shift_id: shiftId })
      expect(signupRes.success).toBe(false)
      expect(signupRes.error).toBe('This volunteer shift has reached maximum capacity.')
    })
  })
})
