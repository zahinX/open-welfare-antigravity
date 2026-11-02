import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createShiftAction,
  updateShiftAction,
  deleteShiftAction,
  signUpAction,
  cancelSignUpAction,
  markAttendanceAction,
} from '@/lib/actions/volunteer.actions'
import { getUserProfile } from '@/lib/supabase/server'
import {
  createShift,
  updateShift,
  deleteShift,
  signUpForShift,
  cancelSignUp,
  markAttendance,
} from '@/lib/services/volunteer'
import { revalidatePath } from 'next/cache'

// Mock dependencies
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  getUserProfile: vi.fn(),
}))

vi.mock('@/lib/services/volunteer', () => ({
  createShift: vi.fn(),
  updateShift: vi.fn(),
  deleteShift: vi.fn(),
  signUpForShift: vi.fn(),
  cancelSignUp: vi.fn(),
  markAttendance: vi.fn(),
}))

describe('Volunteer Server Actions (lib/actions/volunteer.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createShiftAction', () => {
    it('should reject unauthenticated calls', async () => {
      vi.mocked(getUserProfile).mockResolvedValue(null)

      const result = await createShiftAction({
        title: 'Emergency Medical Logistics',
        description: 'Volunteer shift for medical kit packing',
        location: 'Dhaka',
        start_time: '2026-09-01T10:00:00Z',
        end_time: '2026-09-01T14:00:00Z',
        max_volunteers: 10,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })

    it('should reject non-admin users', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'u1' } as any,
        profile: { id: 'u1', role: 'volunteer', full_name: 'Volunteer User' } as any,
      })

      const result = await createShiftAction({
        title: 'Emergency Medical Logistics',
        description: 'Volunteer shift for medical kit packing',
        location: 'Dhaka',
        start_time: '2026-09-01T10:00:00Z',
        end_time: '2026-09-01T14:00:00Z',
        max_volunteers: 10,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Forbidden')
    })

    it('should reject invalid input data with field errors (e.g. end time before start time)', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const result = await createShiftAction({
        title: 'Sh', // too short
        description: 'Desc', // too short
        location: 'D', // too short
        start_time: '2026-09-01T14:00:00Z',
        end_time: '2026-09-01T10:00:00Z', // before start time
        max_volunteers: 0, // must be >= 1
      })

      expect(result.success).toBe(false)
      expect(result.fieldErrors).toBeDefined()
      expect(result.fieldErrors?.['title']).toBeDefined()
      expect(result.fieldErrors?.['description']).toBeDefined()
      expect(result.fieldErrors?.['location']).toBeDefined()
      expect(result.fieldErrors?.['end_time']).toBeDefined()
      expect(result.fieldErrors?.['max_volunteers']).toBeDefined()
    })

    it('should create shift and revalidate cache on valid admin call', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const mockShift = {
        id: 'shift-1',
        title: 'Winter Blanket Packing',
        description: 'Packing blankets for cold wave victims',
        location: 'Uttara Warehouse',
        start_time: '2026-09-01T10:00:00Z',
        end_time: '2026-09-01T14:00:00Z',
        max_volunteers: 10,
        created_by: 'a1',
        created_at: '2026-08-18',
        updated_at: '2026-08-18',
      }

      vi.mocked(createShift).mockResolvedValue({
        data: mockShift,
        error: null,
      })

      const result = await createShiftAction({
        title: 'Winter Blanket Packing',
        description: 'Packing blankets for cold wave victims',
        location: 'Uttara Warehouse',
        start_time: '2026-09-01T10:00:00Z',
        end_time: '2026-09-01T14:00:00Z',
        max_volunteers: 10,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockShift)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/volunteers/shifts')
      expect(revalidatePath).toHaveBeenCalledWith('/volunteer')
    })
  })

  describe('updateShiftAction', () => {
    it('should update shift on valid admin request', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const mockUpdated = {
        id: 'shift-1',
        title: 'Updated Shift Title',
        description: 'Updated description',
        location: 'Updated location',
        start_time: '2026-09-01T10:00:00Z',
        end_time: '2026-09-01T14:00:00Z',
        max_volunteers: 15,
        created_by: 'a1',
        created_at: '2026-08-18',
        updated_at: '2026-08-18',
      }

      vi.mocked(updateShift).mockResolvedValue({
        data: mockUpdated,
        error: null,
      })

      const result = await updateShiftAction('shift-1', {
        title: 'Updated Shift Title',
      })

      expect(result.success).toBe(true)
      expect(result.data?.title).toBe('Updated Shift Title')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/volunteers/shifts')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/volunteers/shifts/shift-1')
      expect(revalidatePath).toHaveBeenCalledWith('/volunteer')
    })
  })

  describe('deleteShiftAction', () => {
    it('should delete shift on admin request', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      vi.mocked(deleteShift).mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await deleteShiftAction('shift-1')

      expect(result.success).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/volunteers/shifts')
      expect(revalidatePath).toHaveBeenCalledWith('/volunteer')
    })
  })

  describe('signUpAction', () => {
    it('should allow authenticated users to sign up', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'user-1' } as any,
        profile: { id: 'user-1', role: 'public', full_name: 'Regular User' } as any,
      })

      const mockSignup = {
        id: 'signup-1',
        shift_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        user_id: 'user-1',
        attended: false,
        created_at: '2026-08-18',
      }

      vi.mocked(signUpForShift).mockResolvedValue({
        data: mockSignup,
        error: null,
      })

      const result = await signUpAction({
        shift_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSignup)
      expect(revalidatePath).toHaveBeenCalledWith('/volunteer')
      expect(revalidatePath).toHaveBeenCalledWith('/volunteer/profile')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/volunteers/shifts/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
    })

    it('should reject unauthenticated signup requests', async () => {
      vi.mocked(getUserProfile).mockResolvedValue(null)

      const result = await signUpAction({
        shift_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })
  })

  describe('cancelSignUpAction', () => {
    it('should cancel signup for authenticated user', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'user-1' } as any,
        profile: { id: 'user-1', role: 'public', full_name: 'Regular User' } as any,
      })

      vi.mocked(cancelSignUp).mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await cancelSignUpAction('shift-1')

      expect(result.success).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith('/volunteer')
      expect(revalidatePath).toHaveBeenCalledWith('/volunteer/profile')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/volunteers/shifts/shift-1')
    })
  })

  describe('markAttendanceAction', () => {
    it('should allow admin to mark attendance', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'a1' } as any,
        profile: { id: 'a1', role: 'admin', full_name: 'Admin User' } as any,
      })

      const mockSignup = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        shift_id: 'shift-1',
        user_id: 'u1',
        attended: true,
        created_at: '2026-08-18',
      }

      vi.mocked(markAttendance).mockResolvedValue({
        data: mockSignup,
        error: null,
      })

      const result = await markAttendanceAction(
        {
          signup_id: '123e4567-e89b-12d3-a456-426614174000',
          attended: true,
        },
        'shift-1'
      )

      expect(result.success).toBe(true)
      expect(result.data?.attended).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/volunteers/shifts')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/volunteers/shifts/shift-1')
    })

    it('should reject non-admin attendance updates', async () => {
      vi.mocked(getUserProfile).mockResolvedValue({
        user: { id: 'u1' } as any,
        profile: { id: 'u1', role: 'volunteer', full_name: 'Volunteer User' } as any,
      })

      const result = await markAttendanceAction({
        signup_id: '123e4567-e89b-12d3-a456-426614174000',
        attended: true,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Forbidden')
    })
  })
})
