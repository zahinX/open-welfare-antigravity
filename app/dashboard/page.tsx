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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Welcome back, {profile.full_name.split(' ')[0]}
        </h1>
        <p className="mt-2 text-zinc-400">
          Here is what's happening with your account today.
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 mb-4">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Core Shell Complete</h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          You are signed in as a <strong className="text-emerald-400 capitalize">{profile.role}</strong>. 
          Your navigation menu has been customized based on your role permissions.
        </p>
      </div>
    </div>
  )
}
