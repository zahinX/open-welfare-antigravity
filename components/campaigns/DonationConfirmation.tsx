'use client' // Required for user interaction and receipt dismiss

import { Donation } from '@/lib/supabase/database.types'
import { formatCurrency } from '@/lib/utils/format'

interface DonationConfirmationProps {
  donation: Donation
  campaignTitle: string
  onClose: () => void
}

export function DonationConfirmation({
  donation,
  campaignTitle,
  onClose,
}: DonationConfirmationProps) {
  const isConverted =
    donation.currency.toUpperCase() !== 'BDT' &&
    donation.converted_amount !== donation.amount

  return (
    <div className="space-y-6 text-center" role="region" aria-label="Donation receipt">
      {/* Success Badge Animation */}
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
        <svg
          className="w-9 h-9"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          Thank You for Your Support!
        </h3>
        <p className="text-sm text-zinc-300 max-w-sm mx-auto">
          Your contribution has been successfully processed and directly added to the campaign goal.
        </p>
      </div>

      {/* Receipt Details Card */}
      <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-5 text-left space-y-3.5 text-sm">
        <div className="flex justify-between items-center text-zinc-400 pb-2.5 border-b border-zinc-800">
          <span>Campaign</span>
          <span className="font-medium text-white max-w-[200px] truncate text-right">
            {campaignTitle}
          </span>
        </div>

        <div className="flex justify-between items-center text-zinc-400">
          <span>Amount Contributed</span>
          <span className="text-base font-bold text-emerald-400">
            {formatCurrency(donation.amount, donation.currency)}
          </span>
        </div>

        {isConverted && (
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Credited to Campaign</span>
            <span className="font-semibold text-zinc-200">
              {formatCurrency(donation.converted_amount, 'BDT')} (Rate: {donation.exchange_rate})
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-zinc-400">
          <span>Donor</span>
          <span className="font-medium text-zinc-200">
            {donation.is_anonymous ? 'Anonymous' : donation.donor_name || 'Generous Supporter'}
          </span>
        </div>

        <div className="flex justify-between items-center text-zinc-400">
          <span>Payment Method</span>
          <span className="font-medium text-zinc-200 capitalize">
            {donation.payment_method.replace('_', ' ')}
          </span>
        </div>

        <div className="flex justify-between items-center text-zinc-400 pt-2.5 border-t border-zinc-800 text-xs">
          <span>Transaction ID</span>
          <span className="font-mono text-zinc-400 truncate max-w-[180px]">
            {donation.id}
          </span>
        </div>
      </div>

      {/* Done Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 font-bold rounded-xl hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        Done
      </button>
    </div>
  )
}
