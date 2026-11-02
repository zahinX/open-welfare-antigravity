'use client'

import Link from 'next/link'

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 mb-4">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-white mb-1">Failed to load reports</p>
        <p className="text-sm text-zinc-400 max-w-sm mb-6">
          {error.message || 'An unexpected error occurred while loading the reporting page.'}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-medium text-black bg-emerald-400 hover:bg-emerald-300 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
