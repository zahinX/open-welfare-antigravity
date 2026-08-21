import { getUserProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  const { profile } = data

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row">
      <Sidebar role={profile.role} fullName={profile.full_name} />
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
