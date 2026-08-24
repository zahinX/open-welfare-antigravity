import Link from 'next/link'
import { ReactNode } from 'react'

export default function PublicLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-zinc-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
        <nav
          className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto"
          aria-label="Public Navigation"
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl"
            aria-label="Open Welfare Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg
                className="w-5 h-5 text-zinc-950"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Open Welfare
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/campaigns"
              className="px-3.5 py-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Campaigns
            </Link>
            <Link
              href="/volunteer"
              className="px-3.5 py-2 text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Volunteer
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl hover:from-emerald-300 hover:to-teal-300 transition-all duration-200 shadow-md shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-zinc-950"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            Open Welfare — Open Source Community Welfare
          </div>
          <p className="text-sm text-zinc-400">
            Built with Next.js, Supabase & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}
