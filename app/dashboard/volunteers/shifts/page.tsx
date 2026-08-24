import Link from 'next/link'
import { getShifts } from '@/lib/services/volunteer'
import { DeleteShiftButton } from '@/components/dashboard/volunteers/DeleteShiftButton'
import { VolunteerShiftWithSignups } from '@/lib/services/volunteer'

export const metadata = {
  title: 'Volunteer Shifts — Open Welfare Admin',
  description: 'Manage volunteer shifts and sign-ups for Open Welfare programmes.',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CapacityBadge({ shift }: { shift: VolunteerShiftWithSignups }) {
  const pct = shift.max_volunteers > 0
    ? Math.round((shift.signup_count / shift.max_volunteers) * 100)
    : 0
  const isFull = shift.spots_remaining === 0
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <div className="flex items-center justify-between text-xs">
        <span className={isFull ? 'text-red-400 font-medium' : 'text-zinc-400'}>
          {isFull ? 'Full' : `${shift.spots_remaining} left`}
        </span>
        <span className="text-zinc-500 tabular-nums">{shift.signup_count}/{shift.max_volunteers}</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default async function VolunteerShiftsPage() {
  const { data: shifts, error } = await getShifts()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Volunteer Shifts</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Schedule and manage volunteer opportunities for community programmes.
          </p>
        </div>
        <Link
          href="/dashboard/volunteers/shifts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Shift
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-6" role="alert">
          Failed to load volunteer shifts: {error}
        </div>
      )}

      {/* Empty state */}
      {!error && (!shifts || shifts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-zinc-800 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 mb-4">
            <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
          </div>
          <p className="text-base font-medium text-zinc-300">No volunteer shifts yet</p>
          <p className="mt-1 text-sm text-zinc-500">Create your first shift to start recruiting volunteers.</p>
          <Link
            href="/dashboard/volunteers/shifts/new"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black bg-emerald-400 hover:bg-emerald-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Schedule a Shift
          </Link>
        </div>
      )}

      {/* Shifts table */}
      {shifts && shifts.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Volunteer shifts">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Shift</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider min-w-[130px]">Capacity</th>
                  <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="bg-zinc-950 hover:bg-zinc-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/volunteers/shifts/${shift.id}`}
                        className="font-medium text-white hover:text-emerald-400 transition-colors truncate max-w-[220px] block"
                      >
                        {shift.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-zinc-200 tabular-nums">{formatDate(shift.start_time)}</p>
                      <p className="text-xs text-zinc-500 tabular-nums mt-0.5">
                        {formatTime(shift.start_time)} – {formatTime(shift.end_time)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 truncate max-w-[180px]">{shift.location}</td>
                    <td className="px-5 py-4">
                      <CapacityBadge shift={shift} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/dashboard/volunteers/shifts/${shift.id}`}
                          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                          View
                        </Link>
                        <DeleteShiftButton id={shift.id} title={shift.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
