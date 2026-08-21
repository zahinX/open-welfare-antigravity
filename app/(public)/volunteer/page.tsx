import { getShifts } from '@/lib/services/volunteer'
import { getUserProfile } from '@/lib/supabase/server'
import { getUserSignups } from '@/lib/services/volunteer'
import { SignUpButton } from '@/components/volunteer/SignUpButton'

export const metadata = {
  title: 'Volunteer — Open Welfare',
  description: 'Join our community volunteer programme. Browse upcoming shifts and sign up to make a difference.',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getDuration(start: string, end: string) {
  const diffMs = new Date(end).getTime() - new Date(start).getTime()
  const hours = Math.floor(diffMs / 3600000)
  const mins = Math.floor((diffMs % 3600000) / 60000)
  if (hours === 0) return `${mins}m`
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
}

export default async function VolunteerPage() {
  const [{ data: shifts, error }, authData] = await Promise.all([
    getShifts({ upcoming: true }),
    getUserProfile().catch(() => null),
  ])

  const isLoggedIn = Boolean(authData?.user)

  // Fetch user's existing signups if logged in
  let userSignupShiftIds = new Set<string>()
  if (authData?.user) {
    const { data: userSignups } = await getUserSignups(authData.user.id)
    if (userSignups) {
      userSignupShiftIds = new Set(userSignups.map((s) => s.shift_id))
    }
  }

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Volunteer with Us
        </h1>
        <p className="mt-3 text-lg text-zinc-400 leading-relaxed max-w-2xl">
          Make a real difference in your community. Browse our upcoming volunteer shifts and sign up
          to join our relief operations on the ground.
        </p>
        {isLoggedIn && (
          <a
            href="/volunteer/profile"
            className="inline-flex items-center gap-2 mt-4 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          >
            View your sign-up history →
          </a>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-8" role="alert">
          Failed to load shifts: {error}
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
          <p className="text-base font-medium text-zinc-300">No upcoming shifts</p>
          <p className="mt-1 text-sm text-zinc-500">Check back soon — new volunteer opportunities are posted regularly.</p>
        </div>
      )}

      {/* Shift cards grid */}
      {shifts && shifts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {shifts.map((shift) => {
            const isFull = shift.spots_remaining === 0
            const isSignedUp = userSignupShiftIds.has(shift.id)
            const capacityPct = shift.max_volunteers > 0
              ? Math.min(Math.round((shift.signup_count / shift.max_volunteers) * 100), 100)
              : 0

            return (
              <article
                key={shift.id}
                role="listitem"
                className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors overflow-hidden group"
              >
                <div className="p-6 flex-1 space-y-3">
                  {/* Status badge */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isSignedUp
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : isFull
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isSignedUp ? '✓ Signed up' : isFull ? 'Full' : `${shift.spots_remaining} spots left`}
                    </span>
                    <span className="text-xs text-zinc-500 tabular-nums">
                      {getDuration(shift.start_time, shift.end_time)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {shift.title}
                  </h2>

                  {/* Date & location */}
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2 text-sm text-zinc-400">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                      </svg>
                      <span>{formatDate(shift.start_time)}, {formatTime(shift.start_time)} – {formatTime(shift.end_time)}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-zinc-400">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="line-clamp-2">{shift.location}</span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                      <span>{shift.signup_count} signed up</span>
                      <span>of {shift.max_volunteers}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="px-6 pb-6">
                  <SignUpButton
                    shiftId={shift.id}
                    isSignedUp={isSignedUp}
                    isFull={isFull}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
