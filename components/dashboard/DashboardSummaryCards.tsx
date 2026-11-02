import { DashboardSummary } from '@/lib/services/analytics'

export function DashboardSummaryCards({ summary }: { summary: DashboardSummary }) {
  const cards = [
    {
      title: 'Total Donations',
      value: `${summary.totalDonationsAmount.toLocaleString()} BDT`,
      subtitle: `${summary.totalDonationsCount} donations`,
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Active Campaigns',
      value: summary.activeCampaignsCount.toString(),
      subtitle: `Out of ${summary.totalCampaignsCount} total`,
      icon: (
        <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
    },
    {
      title: 'Total Beneficiaries',
      value: summary.totalBeneficiariesCount.toLocaleString(),
      subtitle: `${(summary.totalDisbursedAmount || 0).toLocaleString()} BDT disbursed`,
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Volunteer Shifts',
      value: summary.upcomingShiftsCount.toString(),
      subtitle: `${summary.attendanceRate}% attendance rate`,
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm flex flex-col transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.title}</h3>
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50">
              {card.icon}
            </div>
          </div>
          <div className="mt-auto">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{card.value}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">{card.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
