'use client' // Required for usePathname active state and mobile menu toggle

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'
import { useState } from 'react'

interface SidebarProps {
  role: 'admin' | 'volunteer' | 'public'
  fullName: string
}

export function Sidebar({ role, fullName }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const adminLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Campaigns', href: '/dashboard/campaigns' },
    { name: 'Beneficiaries', href: '/dashboard/beneficiaries' },
    { name: 'Disbursements', href: '/dashboard/disbursements' },
    { name: 'Volunteer Shifts', href: '/dashboard/volunteers/shifts' },
    { name: 'Reports & Analytics', href: '/dashboard/reports' },
  ]

  const publicLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Donations', href: '/dashboard/donations' },
    { name: 'My Signups', href: '/dashboard/signups' },
  ]

  const links = role === 'admin' ? adminLinks : publicLinks

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-50">
        <Link href="/dashboard" className="text-white font-semibold">Open Welfare</Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-400 hover:text-white"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800 
        transform transition-transform duration-200 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Link href="/dashboard" className="text-emerald-400 font-bold text-lg tracking-tight flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            Open Welfare
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }
                `}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-white uppercase">
              {fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{fullName}</p>
              <p className="text-xs text-zinc-500 capitalize">{role}</p>
            </div>
          </div>
          <div className="space-y-1 mb-2">
            <Link
              href="/campaigns"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Public Site
            </Link>
          </div>
          <form action={logout}>
            <button 
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
