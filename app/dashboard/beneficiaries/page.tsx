import Link from 'next/link'
import { getBeneficiaries } from '@/lib/services/beneficiary'
import { DeleteBeneficiaryButton } from '@/components/dashboard/beneficiaries/DeleteBeneficiaryButton'
import { Beneficiary } from '@/lib/supabase/database.types'

export const metadata = {
  title: 'Beneficiaries — Open Welfare Admin',
  description: 'Manage beneficiaries for Open Welfare.',
}

const STATUS_STYLES: Record<Beneficiary['status'], string> = {
  pending: 'bg-zinc-800 text-zinc-400',
  approved: 'bg-emerald-500/10 text-emerald-400',
  rejected: 'bg-red-500/10 text-red-400',
  inactive: 'bg-zinc-800/50 text-zinc-500',
}

export default async function BeneficiariesPage() {
  const { data: beneficiaries, error } = await getBeneficiaries()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Beneficiaries</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage individuals and families receiving aid.</p>
        </div>
        <Link
          href="/dashboard/beneficiaries/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Beneficiary
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-6">
          Failed to load beneficiaries: {error}
        </div>
      )}

      {/* Empty state */}
      {!error && (!beneficiaries || beneficiaries.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-zinc-800 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 mb-4">
            <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <p className="text-base font-medium text-zinc-300">No beneficiaries yet</p>
          <p className="mt-1 text-sm text-zinc-500">Add individuals or families to start tracking aid distribution.</p>
          <Link
            href="/dashboard/beneficiaries/new"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black bg-emerald-400 hover:bg-emerald-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Beneficiary
          </Link>
        </div>
      )}

      {/* Beneficiaries table */}
      {beneficiaries && beneficiaries.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Family Size</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {beneficiaries.map((beneficiary) => (
                  <tr key={beneficiary.id} className="bg-zinc-950 hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white truncate max-w-[200px]">{beneficiary.full_name}</p>
                      {beneficiary.address && (
                        <p className="text-xs text-zinc-500 truncate max-w-[200px] mt-0.5">{beneficiary.address}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[beneficiary.status]}`}>
                        {beneficiary.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {beneficiary.contact_phone || '—'}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-zinc-300 tabular-nums">
                      {beneficiary.family_size}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/dashboard/beneficiaries/${beneficiary.id}/edit`}
                          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteBeneficiaryButton id={beneficiary.id} fullName={beneficiary.full_name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
