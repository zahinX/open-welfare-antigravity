import { Metadata } from 'next'
import { getPublicCampaigns } from '@/lib/services/campaign'
import { CampaignCard } from '@/components/campaigns/CampaignCard'

export const metadata: Metadata = {
  title: 'Explore Campaigns — Open Welfare',
  description: 'Browse active and completed community welfare campaigns. Contribute and make a difference.',
}

export default async function PublicCampaignsPage() {
  const { data: campaigns, error } = await getPublicCampaigns()

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
          Community Initiatives
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Active Welfare Campaigns
        </h1>
        <p className="text-base text-zinc-200 max-w-2xl leading-relaxed">
          Support verified emergency relief, food distribution, and community projects.
          Every donation is tracked transparently.
        </p>
      </section>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
        >
          Failed to load campaigns: {error}
        </div>
      )}

      {/* Campaigns Grid or Empty State */}
      {campaigns && campaigns.length > 0 ? (
        <section
          aria-label="Campaigns list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </section>
      ) : !error ? (
        <div className="text-center py-16 px-6 rounded-2xl border border-zinc-700 bg-zinc-800/40">
          <div className="w-12 h-12 rounded-full bg-zinc-700/80 mx-auto flex items-center justify-center text-zinc-200 mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">
            No Active Campaigns Found
          </h2>
          <p className="text-sm text-zinc-300 max-w-sm mx-auto">
            There are currently no active public campaigns. Check back soon for new community initiatives.
          </p>
        </div>
      ) : null}
    </div>
  )
}
