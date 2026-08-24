import Link from 'next/link'
import { BeneficiaryForm } from '@/components/dashboard/beneficiaries/BeneficiaryForm'

export const metadata = {
  title: 'New Beneficiary — Open Welfare Admin',
  description: 'Add a new beneficiary profile.',
}

export default function NewBeneficiaryPage() {
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/beneficiaries"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Beneficiaries
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">New Beneficiary</h1>
        <p className="mt-1 text-sm text-zinc-400">Enter the details to register a new beneficiary or family.</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8">
        <BeneficiaryForm />
      </div>
    </div>
  )
}
