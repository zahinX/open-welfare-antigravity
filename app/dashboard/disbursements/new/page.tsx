import Link from 'next/link'
import { DisbursementForm } from '@/components/dashboard/disbursements/DisbursementForm'
import { getBeneficiaries } from '@/lib/services/beneficiary'
import { getCampaigns } from '@/lib/services/campaign'

export const metadata = {
  title: 'Record Disbursement — Open Welfare Admin',
  description: 'Log a new disbursement of funds to a beneficiary.',
}

export default async function NewDisbursementPage() {
  const [beneficiariesRes, campaignsRes] = await Promise.all([
    getBeneficiaries(),
    getCampaigns(),
  ])

  const beneficiaries = beneficiariesRes.data || []
  const campaigns = campaignsRes.data || []

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/disbursements"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Disbursements
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Record Disbursement</h1>
        <p className="mt-1 text-sm text-zinc-400">Log funds distributed to a beneficiary.</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8">
        <DisbursementForm 
          beneficiaries={beneficiaries.map((b) => ({ id: b.id, full_name: b.full_name }))}
          campaigns={campaigns.map((c) => ({ id: c.id, title: c.title, currency: c.currency || 'BDT' }))}
        />
      </div>
    </div>
  )
}
