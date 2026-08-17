'use client' // Required for modal open/close dialog state management

import { useState, useEffect } from 'react'
import { Campaign, Donation } from '@/lib/supabase/database.types'
import { DonationForm } from './DonationForm'
import { DonationConfirmation } from './DonationConfirmation'

interface DonationModalProps {
  campaign: Campaign
  triggerLabel?: string
  className?: string
}

export function DonationModal({
  campaign,
  triggerLabel = 'Donate Now',
  className,
}: DonationModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    setCompletedDonation(null)
  }

  const handleSuccess = (donation: Donation) => {
    setCompletedDonation(donation)
  }

  if (campaign.status !== 'active') {
    return null
  }

  return (
    <>
      {/* Action Button that triggers modal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          'w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 font-bold rounded-xl hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer'
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {triggerLabel}
      </button>

      {/* Accessible Backdrop & Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="donation-modal-title"
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h2
                  id="donation-modal-title"
                  className="text-lg font-bold text-white tracking-tight"
                >
                  {completedDonation ? 'Donation Confirmation' : 'Support this Campaign'}
                </h2>
                {!completedDonation && (
                  <p className="text-xs text-zinc-400 truncate max-w-[340px]">
                    {campaign.title}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Close donation modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            {completedDonation ? (
              <DonationConfirmation
                donation={completedDonation}
                campaignTitle={campaign.title}
                onClose={handleClose}
              />
            ) : (
              <DonationForm
                campaign={campaign}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
