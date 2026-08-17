import Link from 'next/link'
import { Campaign } from '@/lib/supabase/database.types'
import { ProgressBar } from './ProgressBar'

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = campaign.target_amount > 0
    ? Math.min(Math.round((campaign.current_amount / campaign.target_amount) * 100), 100)
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', '৳')
  }

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
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    },
    draft: {
      label: 'Draft',
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  }[campaign.status] || {
    label: campaign.status,
    classes: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  }

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all duration-300 shadow-sm">
      <div className="space-y-4">
        {/* Header: Status & Deadline */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.classes}`}
          >
            {statusBadge.label}
          </span>
          <span className="text-xs font-medium text-zinc-400">
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
        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>
      </div>

      {/* Progress & Stats */}
      <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-3">
        <ProgressBar
          current={campaign.current_amount}
          target={campaign.target_amount}
        />

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-white">
              {formatCurrency(campaign.current_amount)}
            </span>
            <span className="text-zinc-500 ml-1">raised</span>
          </div>
          <div>
            <span className="font-medium text-emerald-400">{percentage}%</span>
            <span className="text-zinc-500 ml-1">
              of {formatCurrency(campaign.target_amount)}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
