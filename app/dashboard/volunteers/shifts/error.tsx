'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ShiftsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col items-center justify-center py-24">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 mb-4">
        <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-white mb-1">Failed to load volunteer shifts</p>
      <p className="text-sm text-zinc-400 mb-6 text-center max-w-sm">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white border border-zinc-800 rounded-lg transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
