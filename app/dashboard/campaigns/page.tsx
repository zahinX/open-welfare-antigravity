import Link from 'next/link'
import { getCampaigns } from '@/lib/services/campaign'
import { DeleteCampaignButton } from '@/components/dashboard/campaigns/DeleteCampaignButton'
import { Campaign } from '@/lib/supabase/database.types'

export const metadata = {
  title: 'Campaigns — Open Welfare Admin',
  description: 'Manage fundraising campaigns for Open Welfare.',
}

const STATUS_STYLES: Record<Campaign['status'], string> = {
  draft: 'bg-zinc-800 text-zinc-400',
  active: 'bg-emerald-500/10 text-emerald-400',
  completed: 'bg-blue-500/10 text-blue-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 })
    .format(amount)
    .replace('BDT', '৳')
}

function formatDeadline(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}

export default async function CampaignsPage() {
  const { data: campaigns, error } = await getCampaigns()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campaigns</h1>
          <p className="mt-1 text-sm text-zinc-400">Create and manage fundraising campaigns.</p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Campaign
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-6">
          Failed to load campaigns: {error}
        </div>
      )}

      {/* Empty state */}
      {!error && (!campaigns || campaigns.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-zinc-800 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 mb-4">
            <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p className="text-base font-medium text-zinc-300">No campaigns yet</p>
          <p className="mt-1 text-sm text-zinc-500">Create your first fundraising campaign to get started.</p>
          <Link
            href="/dashboard/campaigns/new"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black bg-emerald-400 hover:bg-emerald-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Campaign
          </Link>
        </div>
      )}

      {/* Campaign table */}
      {campaigns && campaigns.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Target</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Raised</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Deadline</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {campaigns.map((campaign) => {
                  const progress = campaign.target_amount > 0
                    ? Math.min(100, Math.round((campaign.current_amount / campaign.target_amount) * 100))
                    : 0
                  return (
                    <tr key={campaign.id} className="bg-zinc-950 hover:bg-zinc-900/50 transition-colors group">
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-medium text-white truncate">{campaign.title}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-zinc-800 rounded-full max-w-[120px]">
                            <div
                              className="h-1 bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[campaign.status]}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-zinc-300 tabular-nums">
                        {formatCurrency(campaign.target_amount)}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-emerald-400 tabular-nums">
                        {formatCurrency(campaign.current_amount)}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {formatDeadline(campaign.deadline_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/dashboard/campaigns/${campaign.id}/edit`}
                            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                          >
                            Edit
                          </Link>
                          <DeleteCampaignButton id={campaign.id} title={campaign.title} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
