import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicCampaignById } from '@/lib/services/campaign'
import { ProgressBar } from '@/components/campaigns/ProgressBar'

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: CampaignDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const { data: campaign } = await getPublicCampaignById(id)

  if (!campaign) {
    return {
      title: 'Campaign Not Found — Open Welfare',
    }
  }

  return {
    title: `${campaign.title} — Open Welfare`,
    description: campaign.description.slice(0, 160),
  }
}

export default async function PublicCampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { id } = await params
  const { data: campaign, error } = await getPublicCampaignById(id)

  if (error || !campaign) {
    notFound()
  }

  const percentage = campaign.target_amount > 0
    ? Math.min(Math.round((campaign.current_amount / campaign.target_amount) * 100), 100)
    : 0

  const remainingAmount = Math.max(0, campaign.target_amount - campaign.current_amount)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', '৳')
  }

  const formatDateTime = (iso: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso))
  }

  const statusBadge = {
    active: {
      label: 'Active Campaign',
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back to Campaigns */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md py-1 pr-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to all campaigns
        </Link>
      </div>

      {/* Main Campaign Header & Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.classes}`}
          >
            {statusBadge.label}
          </span>
          {campaign.deadline_at && (
            <span className="text-xs text-zinc-400">
              Deadline: {formatDateTime(campaign.deadline_at)}
            </span>
          )}
          <span className="text-xs text-zinc-500">
            Created on {formatDateTime(campaign.created_at)}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          {campaign.title}
        </h1>
      </div>

      {/* Fundraising Progress Card */}
      <section
        aria-label="Campaign fundraising progress"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 shadow-lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Raised So Far
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
              {formatCurrency(campaign.current_amount)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Target Goal
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {formatCurrency(campaign.target_amount)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Remaining
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-300 mt-1">
              {formatCurrency(remainingAmount)}
            </div>
          </div>
        </div>

        <ProgressBar
          current={campaign.current_amount}
          target={campaign.target_amount}
          showLabel
        />

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80">
          <div className="text-sm text-zinc-400 text-center sm:text-left">
            {campaign.status === 'active' ? (
              <span className="text-emerald-400 font-medium">
                ● Campaign is active and verified by Mosque administration.
              </span>
            ) : (
              <span className="text-zinc-400 font-medium">
                ● This campaign has concluded.
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto">
            {campaign.status === 'active' ? (
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-400 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Donate to this campaign (Donations enabled in Phase 3.4)"
              >
                Donate Now
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 text-zinc-500 font-semibold rounded-xl cursor-not-allowed"
              >
                Campaign Closed
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Campaign Description / Story */}
      <section aria-label="Campaign details" className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          About this Campaign
        </h2>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
          <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-line">
            {campaign.description}
          </p>
        </div>
      </section>
    </div>
  )
}
