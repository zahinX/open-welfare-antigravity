import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicCampaignById } from '@/lib/services/campaign'
import { getRecentPublicDonations } from '@/lib/services/donation'
import { ProgressBar } from '@/components/campaigns/ProgressBar'
import { DonationModal } from '@/components/campaigns/DonationModal'
import { RecentSupportersList } from '@/components/campaigns/RecentSupportersList'
import { formatCurrency } from '@/lib/utils/format'

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
  const [campaignResult, donationsResult] = await Promise.all([
    getPublicCampaignById(id),
    getRecentPublicDonations(id, 10),
  ])

  const campaign = campaignResult.data
  const donations = donationsResult.data ?? []

  if (campaignResult.error || !campaign) {
    notFound()
  }

  const remainingAmount = Math.max(0, campaign.target_amount - campaign.current_amount)

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back to Campaigns */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md py-1 pr-2"
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
            <span className="text-xs font-medium text-zinc-300">
              Deadline: {formatDateTime(campaign.deadline_at)}
            </span>
          )}
          <span className="text-xs text-zinc-400">
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
        className="rounded-2xl border border-zinc-700/80 bg-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Raised So Far
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
              {formatCurrency(campaign.current_amount, campaign.currency)}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Target Goal
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {formatCurrency(campaign.target_amount, campaign.currency)}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Remaining
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-200 mt-1">
              {formatCurrency(remainingAmount, campaign.currency)}
            </div>
          </div>
        </div>

        <ProgressBar
          current={campaign.current_amount}
          target={campaign.target_amount}
          showLabel
        />

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-700/80">
          <div className="text-sm text-zinc-200 text-center sm:text-left flex flex-wrap items-center gap-2">
            {campaign.status === 'active' ? (
              <>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  {campaign.verification_text || 'Campaign is active and verified by administration.'}
                </span>
                {campaign.verification_link && (
                  <a
                    href={campaign.verification_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200 underline underline-offset-2 ml-1"
                    aria-label="View verification documentation"
                  >
                    View Verification Proof
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </>
            ) : (
              <span className="text-zinc-400 font-medium">
                ● This campaign has concluded.
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto">
            {campaign.status === 'active' ? (
              <DonationModal campaign={campaign} />
            ) : (
              <button
                type="button"
                disabled
                className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 text-zinc-400 font-semibold rounded-xl cursor-not-allowed"
              >
                Campaign Closed
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Grid: Story & Supporters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Campaign Description / Story (Left 2 cols) */}
        <section aria-label="Campaign details" className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            About this Campaign
          </h2>
          <div className="rounded-2xl border border-zinc-700/80 bg-zinc-800/50 p-6 sm:p-8">
            <p className="text-base text-zinc-200 leading-relaxed whitespace-pre-line">
              {campaign.description}
            </p>
          </div>
        </section>

        {/* Recent Supporters (Right 1 col) */}
        <section aria-label="Recent supporters" className="lg:col-span-1 space-y-4">
          <RecentSupportersList
            donations={donations}
            campaignCurrency={campaign.currency || 'BDT'}
          />
        </section>
      </div>
    </div>
  )
}
