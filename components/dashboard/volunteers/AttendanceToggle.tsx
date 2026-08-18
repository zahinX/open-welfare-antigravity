'use client'
// Required for useTransition (pending state) and router.refresh after attendance mark

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markAttendanceAction } from '@/lib/actions/volunteer.actions'

interface AttendanceToggleProps {
  signupId: string
  shiftId: string
  attended: boolean
  volunteerName: string
}

export function AttendanceToggle({ signupId, shiftId, attended, volunteerName }: AttendanceToggleProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await markAttendanceAction(
        { signup_id: signupId, attended: !attended },
        shiftId
      )
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={`Mark ${volunteerName} as ${attended ? 'absent' : 'attended'}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed
        ${attended
          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 focus:ring-emerald-500'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 focus:ring-zinc-500'
        }`}
    >
      {isPending ? (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : attended ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {attended ? 'Attended' : 'Absent'}
    </button>
  )
}
