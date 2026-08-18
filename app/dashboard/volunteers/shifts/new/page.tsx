import Link from 'next/link'
import { ShiftForm } from '@/components/dashboard/volunteers/ShiftForm'

export const metadata = {
  title: 'New Volunteer Shift — Open Welfare Admin',
  description: 'Schedule a new volunteer shift for an Open Welfare programme.',
}

export default function NewShiftPage() {
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/volunteers/shifts"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Shifts
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">New Volunteer Shift</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Schedule a volunteer opportunity for the community to sign up for.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8">
        <ShiftForm />
      </div>
    </div>
  )
}
