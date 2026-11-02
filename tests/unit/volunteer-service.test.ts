import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  signUpForShift,
  cancelSignUp,
  markAttendance,
  getUserSignups,
} from '@/lib/services/volunteer'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Volunteer Service Layer (lib/services/volunteer.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getShifts', () => {
    it('should return a list of shifts with computed signup stats', async () => {
      const mockShiftsFromDb = [
        {
          id: 'shift-1',
          title: 'Food Distribution',
          location: 'Dhaka',
          start_time: '2026-09-01T10:00:00Z',
          end_time: '2026-09-01T14:00:00Z',
          max_volunteers: 10,
          created_by: 'admin-1',
          created_at: '2026-08-18T00:00:00Z',
          updated_at: '2026-08-18T00:00:00Z',
          volunteer_signups: [{ id: 's1' }, { id: 's2' }],
        },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockShiftsFromDb, error: null }),
        gte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getShifts()

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.length).toBe(1)
      expect(result.data?.[0].signup_count).toBe(2)
      expect(result.data?.[0].spots_remaining).toBe(8)
      expect(mockQuery.order).toHaveBeenCalledWith('start_time', { ascending: true })
    })

    it('should apply upcoming and search filters', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getShifts({
        upcoming: true,
        search: 'Food',
        offset: 5,
        limit: 10,
      })

      expect(result.error).toBeNull()
      expect(mockQuery.gte).toHaveBeenCalledWith('start_time', expect.any(String))
      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%Food%,location.ilike.%Food%,description.ilike.%Food%')
      expect(mockQuery.range).toHaveBeenCalledWith(5, 14)
    })

    it('should return error when Supabase fails', async () => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getShifts()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database error')
    })
  })

  describe('getShiftById', () => {
    it('should return shift detail with roster and stats', async () => {
      const mockShift = {
        id: 'shift-1',
        title: 'Food Drive',
        max_volunteers: 5,
        volunteer_signups: [
          {
            id: 'signup-1',
            shift_id: 'shift-1',
            user_id: 'user-1',
            attended: true,
            created_at: '2026-08-18',
            profiles: { full_name: 'Volunteer A', phone: '01700000000', role: 'volunteer' },
          },
        ],
      }

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockShift, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getShiftById('shift-1')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('shift-1')
      expect(result.data?.signup_count).toBe(1)
      expect(result.data?.spots_remaining).toBe(4)
      expect(result.data?.signups[0].profile?.full_name).toBe('Volunteer A')
    })
  })

  describe('createShift', () => {
    it('should insert and return new shift', async () => {
      const newShift = {
        title: 'New Shift',
        description: 'Shift description',
        location: 'Sylhet',
        start_time: '2026-09-01T10:00:00Z',
        end_time: '2026-09-01T14:00:00Z',
        max_volunteers: 5,
        created_by: 'admin-1',
      }

      const mockCreated = { id: 'shift-123', ...newShift, created_at: '2026-08-18', updated_at: '2026-08-18' }

      const mockQuery: any = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCreated, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await createShift(newShift)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCreated)
      expect(mockQuery.insert).toHaveBeenCalledWith(newShift)
    })
  })

  describe('updateShift', () => {
    it('should update and return updated shift', async () => {
      const updateData = { title: 'Updated Title' }
      const mockUpdated = { id: 'shift-123', title: 'Updated Title' }

      const mockQuery: any = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await updateShift('shift-123', updateData)

      expect(result.error).toBeNull()
      expect(result.data?.title).toBe('Updated Title')
      expect(mockQuery.update).toHaveBeenCalledWith(updateData)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'shift-123')
    })
  })

  describe('deleteShift', () => {
    it('should delete shift successfully', async () => {
      const mockQuery: any = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await deleteShift('shift-123')

      expect(result.error).toBeNull()
      expect(result.data).toBe(true)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'shift-123')
    })
  })

  describe('signUpForShift', () => {
    it('should prevent signup when shift is at max capacity', async () => {
      const mockShiftQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'shift-1', max_volunteers: 2 }, error: null }),
      }

      const mockSignupsQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ id: 's1', user_id: 'u1' }, { id: 's2', user_id: 'u2' }],
          error: null,
        }),
      }

      const supabaseMock = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'volunteer_shifts') return mockShiftQuery
          if (table === 'volunteer_signups') return mockSignupsQuery
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await signUpForShift('shift-1', 'user-new')

      expect(result.data).toBeNull()
      expect(result.error).toContain('reached maximum capacity')
    })

    it('should prevent duplicate signup by same user', async () => {
      const mockShiftQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'shift-1', max_volunteers: 5 }, error: null }),
      }

      const mockSignupsQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ id: 's1', user_id: 'u1' }],
          error: null,
        }),
      }

      const supabaseMock = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'volunteer_shifts') return mockShiftQuery
          if (table === 'volunteer_signups') return mockSignupsQuery
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await signUpForShift('shift-1', 'u1')

      expect(result.data).toBeNull()
      expect(result.error).toContain('already signed up')
    })

    it('should sign up successfully when under capacity', async () => {
      const mockShiftQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'shift-1', max_volunteers: 5 }, error: null }),
      }

      const mockCreatedSignup = { id: 'signup-123', shift_id: 'shift-1', user_id: 'u2', attended: false }

      const mockSignupsQuery: any = {
        select: vi.fn().mockImplementation((sel?: string) => {
          if (sel === 'id, user_id') {
            return {
              eq: vi.fn().mockResolvedValue({
                data: [{ id: 's1', user_id: 'u1' }],
                error: null,
              }),
            }
          }
          return {
            single: vi.fn().mockResolvedValue({ data: mockCreatedSignup, error: null }),
          }
        }),
        insert: vi.fn().mockReturnThis(),
      }

      const supabaseMock = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'volunteer_shifts') return mockShiftQuery
          if (table === 'volunteer_signups') return mockSignupsQuery
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValue(supabaseMock as any)

      const result = await signUpForShift('shift-1', 'u2')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCreatedSignup)
    })
  })

  describe('cancelSignUp', () => {
    it('should delete user signup record', async () => {
      const mockQuery: any = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      mockQuery.eq.mockImplementation((field: string) => {
        if (field === 'user_id') {
          return Promise.resolve({ error: null })
        }
        return mockQuery
      })

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await cancelSignUp('shift-1', 'user-1')

      expect(result.error).toBeNull()
      expect(result.data).toBe(true)
    })
  })

  describe('markAttendance', () => {
    it('should update attendance status on signup', async () => {
      const mockUpdated = { id: 's1', attended: true }
      const mockQuery: any = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await markAttendance('s1', true)

      expect(result.error).toBeNull()
      expect(result.data?.attended).toBe(true)
      expect(mockQuery.update).toHaveBeenCalledWith({ attended: true })
    })
  })

  describe('getUserSignups', () => {
    it('should retrieve signups for a user', async () => {
      const mockData = [
        {
          id: 's1',
          shift_id: 'shift-1',
          user_id: 'u1',
          attended: false,
          created_at: '2026-08-18',
          volunteer_shifts: { id: 'shift-1', title: 'Food Drive' },
        },
      ]

      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue(mockQuery),
      } as any)

      const result = await getUserSignups('u1')

      expect(result.error).toBeNull()
      expect(result.data?.length).toBe(1)
      expect(result.data?.[0].shift?.title).toBe('Food Drive')
    })
  })
})
