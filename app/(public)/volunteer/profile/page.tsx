import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/server'
import { getUserSignups } from '@/lib/services/volunteer'
import { SignUpButton } from '@/components/volunteer/SignUpButton'

export const metadata = {
  title: 'My Volunteer History — Open Welfare',
  description: 'View your volunteer shift history and upcoming sign-ups.',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default async function VolunteerProfilePage() {
  const authData = await getUserProfile().catch(() => null)
  if (!authData?.user) {
    redirect('/login')
  }

  const { data: signups, error } = await getUserSignups(authData.user.id)

  const now = new Date()
  const upcoming = signups?.filter((s) => s.shift && new Date(s.shift.start_time) > now) ?? []
  const past = signups?.filter((s) => !s.shift || new Date(s.shift.start_time) <= now) ?? []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/volunteer"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          >
            ← All Shifts
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Volunteer History</h1>
        <p className="mt-1.5 text-zinc-400">Your upcoming and past volunteer shift sign-ups.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-8" role="alert">
          Failed to load your sign-ups: {error}
        </div>
      )}

      {/* Stats strip */}
      {signups && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Sign-ups', value: signups.length },
            { label: 'Upcoming', value: upcoming.length },
            { label: 'Attended', value: signups.filter((s) => s.attended).length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 text-center">
              <p className="text-3xl font-bold text-white tabular-nums">{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming shifts */}
      <section aria-label="Upcoming shifts" className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-zinc-800 text-center">
            <p className="text-sm text-zinc-500">No upcoming shifts.</p>
            <Link
              href="/volunteer"
              className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            >
              Browse available shifts →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((signup) => {
              const shift = signup.shift!
              return (
                <div
                  key={signup.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors p-5"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{shift.title}</p>
                    <p className="text-sm text-zinc-400">
                      {formatDateTime(shift.start_time)} – {formatTime(shift.end_time)}
                    </p>
                    <p className="text-sm text-zinc-500">{shift.location}</p>
                  </div>
                  <div className="shrink-0 w-full sm:w-36">
                    <SignUpButton
                      shiftId={shift.id}
                      isSignedUp={true}
                      isFull={false}
                      isLoggedIn={true}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Past shifts */}
      <section aria-label="Past shifts">
        <h2 className="text-lg font-semibold text-white mb-4">Past</h2>
        {past.length === 0 ? (
          <p className="text-sm text-zinc-500 py-6 text-center rounded-2xl border border-dashed border-zinc-800">
            No past shifts on record.
          </p>
        ) : (
          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm" aria-label="Past volunteer shifts">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Shift</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {past.map((signup) => {
                  const shift = signup.shift
                  return (
                    <tr key={signup.id} className="bg-zinc-950 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{shift?.title ?? 'Unknown Shift'}</p>
                        {shift && (
                          <p className="text-xs text-zinc-500 sm:hidden mt-0.5">
                            {formatDateTime(shift.start_time)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-zinc-400 hidden sm:table-cell tabular-nums">
                        {shift ? formatDateTime(shift.start_time) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          signup.attended
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {signup.attended ? '✓ Attended' : 'No record'}
                        </span>
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
