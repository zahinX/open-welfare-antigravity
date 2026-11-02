import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShiftById } from '@/lib/services/volunteer'
import { AttendanceToggle } from '@/components/dashboard/volunteers/AttendanceToggle'
import { DeleteShiftButton } from '@/components/dashboard/volunteers/DeleteShiftButton'

interface ShiftDetailPageProps {
  params: { id: string }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export async function generateMetadata({ params }: ShiftDetailPageProps) {
  const { data } = await getShiftById(params.id)
  return {
    title: data ? `${data.title} — Volunteer Shift` : 'Shift Details — Open Welfare',
    description: data?.description ?? 'Volunteer shift detail and attendance roster.',
  }
}

export default async function ShiftDetailPage({ params }: ShiftDetailPageProps) {
  const { data: shift, error } = await getShiftById(params.id)

  if (error || !shift) {
    notFound()
  }

  const isFull = shift.spots_remaining === 0
  const capacityPct = shift.max_volunteers > 0
    ? Math.min(Math.round((shift.signup_count / shift.max_volunteers) * 100), 100)
    : 0

  const attendedCount = shift.signups.filter((s) => s.attended).length

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/volunteers/shifts"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        All Shifts
      </Link>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight leading-snug">{shift.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isFull ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {isFull ? 'Full' : `${shift.spots_remaining} spots left`}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
              {attendedCount}/{shift.signup_count} attended
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <DeleteShiftButton id={shift.id} title={shift.title} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shift details card */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-5">
          <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Description</h2>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{shift.description}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Location</h2>
            <p className="text-sm text-zinc-300">{shift.location}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Start Time</h2>
              <p className="text-sm text-zinc-300">{formatDateTime(shift.start_time)}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">End Time</h2>
              <p className="text-sm text-zinc-300">{formatTime(shift.end_time)}</p>
            </div>
          </div>
        </div>

        {/* Capacity card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Capacity</h2>
          <p className="text-4xl font-bold text-white tabular-nums">{shift.signup_count}</p>
          <p className="text-sm text-zinc-400 mt-0.5">of {shift.max_volunteers} signed up</p>
          <div className="mt-4 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${capacityPct}%` }}
              role="progressbar"
              aria-valuenow={shift.signup_count}
              aria-valuemin={0}
              aria-valuemax={shift.max_volunteers}
              aria-label="Signup capacity"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">{capacityPct}% filled</p>
        </div>
      </div>

      {/* Signup Roster */}
      <section className="mt-6" aria-label="Volunteer roster">
        <h2 className="text-lg font-semibold text-white mb-3">Volunteer Roster</h2>
        {shift.signups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-zinc-800 text-center">
            <p className="text-sm text-zinc-500">No volunteers have signed up yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm" aria-label="Signed up volunteers">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Volunteer</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Signed Up</th>
                  <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {shift.signups.map((signup) => {
                  const name = signup.profile?.full_name ?? 'Unknown Volunteer'
                  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <tr key={signup.id} className="bg-zinc-950 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-white">{name}</p>
                            <p className="text-xs text-zinc-500 capitalize">{signup.profile?.role ?? 'volunteer'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-400 hidden sm:table-cell">
                        {signup.profile?.phone ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-zinc-400 text-xs hidden sm:table-cell tabular-nums">
                        {new Date(signup.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <AttendanceToggle
                          signupId={signup.id}
                          shiftId={shift.id}
                          attended={signup.attended}
                          volunteerName={name}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
