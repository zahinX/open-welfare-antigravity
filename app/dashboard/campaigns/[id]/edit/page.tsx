import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCampaignById } from '@/lib/services/campaign'
import { CampaignForm } from '@/components/dashboard/campaigns/CampaignForm'

interface EditCampaignPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditCampaignPageProps) {
  const { id } = await params
  const { data: campaign } = await getCampaignById(id)
  return {
    title: campaign ? `Edit "${campaign.title}" — Open Welfare Admin` : 'Edit Campaign — Open Welfare Admin',
  }
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params
  const { data: campaign, error } = await getCampaignById(id)

  if (error || !campaign) {
    notFound()
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Edit Campaign</h1>
        <p className="mt-1 text-sm text-zinc-400 truncate max-w-md">
          Editing: <span className="text-zinc-200">{campaign.title}</span>
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8">
        <CampaignForm initialData={campaign} />
      </div>
    </div>
  )
}
