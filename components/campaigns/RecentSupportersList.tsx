import { Donation } from '@/lib/supabase/database.types'
import { formatCurrency } from '@/lib/utils/format'

interface RecentSupportersListProps {
  donations: Donation[]
  campaignCurrency: string
}

export function RecentSupportersList({
  donations,
  campaignCurrency,
}: RecentSupportersListProps) {
  if (!donations || donations.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-700/60 bg-zinc-800/40 p-6 text-center text-sm text-zinc-400">
        <span className="block text-2xl mb-2">🌱</span>
        Be the first supporter to contribute towards this campaign!
      </div>
    )
  }

  const formatRelativeTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
  }

  return (
    <div className="rounded-2xl border border-zinc-700/80 bg-zinc-800/50 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span>Recent Supporters</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {donations.length}
          </span>
        </h3>
        <span className="text-xs text-zinc-400">Latest contributions</span>
      </div>

      <div className="divide-y divide-zinc-750 divide-zinc-700/50">
        {donations.map((donation) => {
          const isAnon = donation.is_anonymous
          const displayName = isAnon
            ? 'Anonymous Supporter'
            : donation.donor_name || 'Generous Supporter'
          const isCrossCurrency =
            donation.currency.toUpperCase() !== campaignCurrency.toUpperCase()

          return (
            <div
              key={donation.id}
              className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-zinc-700/70 border border-zinc-600/60 flex items-center justify-center text-sm font-bold text-zinc-200 shrink-0">
                  {isAnon ? '🤍' : displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatRelativeTime(donation.created_at)}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-emerald-400">
                  {formatCurrency(donation.amount, donation.currency)}
                </div>
                {isCrossCurrency && (
                  <div className="text-[11px] text-zinc-400">
                    ≈ {formatCurrency(donation.converted_amount, campaignCurrency)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
