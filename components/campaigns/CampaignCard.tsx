import Link from 'next/link'
import { Campaign } from '@/lib/supabase/database.types'
import { ProgressBar } from './ProgressBar'
import { formatCurrency } from '@/lib/utils/format'

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = campaign.target_amount > 0
    ? Math.min(Math.round((campaign.current_amount / campaign.target_amount) * 100), 100)
    : 0

  const getDeadlineText = () => {
    if (campaign.status === 'completed') {
      return 'Completed'
    }
    if (!campaign.deadline_at) {
      return 'Ongoing'
    }
    const deadline = new Date(campaign.deadline_at)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return 'Ended'
    }
    if (diffDays === 0) {
      return 'Ends today'
    }
    if (diffDays === 1) {
      return '1 day left'
    }
    return `${diffDays} days left`
  }

  const statusBadge = {
    active: {
      label: 'Active',
      classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-zinc-800 text-zinc-200 border-zinc-700',
    },
    draft: {
      label: 'Draft',
      classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-red-500/20 text-red-300 border-red-500/40',
    },
  }[campaign.status] || {
    label: campaign.status,
    classes: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  }

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-zinc-700/80 bg-zinc-800/80 p-6 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all duration-300 shadow-md">
      <div className="space-y-4">
        {/* Header: Status & Deadline */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.classes}`}
          >
            {statusBadge.label}
          </span>
          <span className="text-xs font-medium text-zinc-300">
            {getDeadlineText()}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors line-clamp-1">
          <Link
            href={`/campaigns/${campaign.id}`}
            className="focus:outline-none focus:underline after:absolute after:inset-0"
            aria-label={`View campaign: ${campaign.title}`}
          >
            {campaign.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>
      </div>

      {/* Progress & Stats */}
      <div className="mt-6 pt-4 border-t border-zinc-700/80 space-y-3">
        <ProgressBar
          current={campaign.current_amount}
          target={campaign.target_amount}
        />

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-white text-sm">
              {formatCurrency(campaign.current_amount, campaign.currency)}
            </span>
            <span className="text-zinc-300 ml-1">raised</span>
          </div>
          <div>
            <span className="font-semibold text-emerald-400">{percentage}%</span>
            <span className="text-zinc-300 ml-1">
              of {formatCurrency(campaign.target_amount, campaign.currency)}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
