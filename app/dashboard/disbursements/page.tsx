import Link from 'next/link'
import { getDisbursements } from '@/lib/services/disbursement'
import { DeleteDisbursementButton } from '@/components/dashboard/disbursements/DeleteDisbursementButton'

export const metadata = {
  title: 'Disbursements — Open Welfare Admin',
  description: 'Track and manage fund disbursements.',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 })
    .format(amount)
    .replace('BDT', '৳')
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}

export default async function DisbursementsPage() {
  const { data: disbursements, error } = await getDisbursements()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Disbursements</h1>
          <p className="mt-1 text-sm text-zinc-400">Log and monitor funds distributed to beneficiaries.</p>
        </div>
        <Link
          href="/dashboard/disbursements/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Record Disbursement
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-6">
          Failed to load disbursements: {error}
        </div>
      )}

      {/* Empty state */}
      {!error && (!disbursements || disbursements.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-zinc-800 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 mb-4">
            <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <p className="text-base font-medium text-zinc-300">No disbursements logged</p>
          <p className="mt-1 text-sm text-zinc-500">Record funds given to beneficiaries to start tracking.</p>
          <Link
            href="/dashboard/disbursements/new"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black bg-emerald-400 hover:bg-emerald-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Record Disbursement
          </Link>
        </div>
      )}

      {/* Disbursements table */}
      {disbursements && disbursements.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Beneficiary</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Logged By</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {disbursements.map((item) => (
                  <tr key={item.id} className="bg-zinc-950 hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-5 py-4 text-zinc-400 whitespace-nowrap">
                      {formatDate(item.disbursed_at)}
                    </td>
                    <td className="px-5 py-4">
                      <Link 
                        href={`/dashboard/beneficiaries/${item.beneficiary_id}`}
                        className="font-medium text-white hover:text-emerald-400 transition-colors truncate block max-w-[150px]"
                      >
                        {item.beneficiaries?.full_name || 'Unknown'}
                      </Link>
                      <p className="text-xs text-zinc-500 truncate max-w-[200px] mt-0.5" title={item.description}>
                        {item.description}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {item.campaigns ? (
                        <span className="truncate block max-w-[150px]">{item.campaigns.title}</span>
                      ) : (
                        <span className="text-zinc-600">General Fund</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-emerald-400 tabular-nums whitespace-nowrap">
                      {formatCurrency(Number(item.amount_value))}
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-xs truncate max-w-[120px]">
                      {item.profiles?.full_name || 'System'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/dashboard/disbursements/${item.id}/edit`}
                          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteDisbursementButton id={item.id} beneficiaryId={item.beneficiary_id} />
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
