import { getUserProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsView } from '@/components/dashboard/ReportsView'

export const metadata = {
  title: 'Reports & Analytics — Open Welfare',
}

export default async function ReportsPage() {
  const data = await getUserProfile()
  
  if (!data || data.profile.role !== 'admin') {
    redirect('/dashboard') // Only admins can access reports
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Reports & Analytics
        </h1>
        <p className="mt-2 text-zinc-400">
          Generate, view, and export detailed reports across all platform activities.
        </p>
      </div>

      <ReportsView />
    </div>
  )
}
