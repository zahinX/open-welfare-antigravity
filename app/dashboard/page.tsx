import { getDashboardSummaryAction, getBeneficiaryDistributionAction, getVolunteerParticipationAction } from '@/lib/actions/analytics.actions'
import { DashboardSummaryCards } from '@/components/dashboard/DashboardSummaryCards'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { getUserProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard — Open Welfare',
}

export default async function DashboardPage() {
  const data = await getUserProfile()
  
  if (!data) {
    redirect('/login')
  }

  const { profile } = data

  const [summaryRes, beneficiaryRes, volunteerRes] = await Promise.all([
    getDashboardSummaryAction(),
    getBeneficiaryDistributionAction(),
    getVolunteerParticipationAction(),
  ])

  const summary = summaryRes.success ? summaryRes.data : null
  const beneficiaryData = beneficiaryRes.success ? beneficiaryRes.data : null
  const volunteerData = volunteerRes.success ? volunteerRes.data : null

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-zinc-400">
            Welcome back, {profile.full_name.split(' ')[0]}. Here's what's happening today.
          </p>
        </div>
      </div>

      {summary ? (
        <DashboardSummaryCards summary={summary} />
      ) : (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          Failed to load dashboard summary metrics.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {beneficiaryData ? (
          <DashboardCharts 
            type="beneficiary" 
            data={beneficiaryData.byStatus} 
            title="Beneficiaries by Status" 
          />
        ) : (
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 min-h-[300px]">
            No beneficiary data available
          </div>
        )}

        {volunteerData ? (
          <DashboardCharts 
            type="volunteer" 
            data={volunteerData.shiftsWithAttendance.slice(0, 5)} 
            title="Recent Volunteer Shifts Attendance" 
            subtitle={`Overall Attendance Rate: ${volunteerData.attendanceRate}%`}
          />
        ) : (
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 min-h-[300px]">
            No volunteer data available
          </div>
        )}
      </div>
    </div>
  )
}
