'use client' // Required for interactive state (presets, live currency conversion, form submission)

import { useState, useTransition } from 'react'
import { Campaign, Donation } from '@/lib/supabase/database.types'
import { createDonationAction } from '@/lib/actions/donation.actions'
import { convertCurrency, USD_EXCHANGE_RATES } from '@/lib/services/currency'
import { formatCurrency } from '@/lib/utils/format'

interface DonationFormProps {
  campaign: Campaign
  onSuccess: (donation: Donation) => void
  onCancel: () => void
}

const SUPPORTED_CURRENCIES = Object.keys(USD_EXCHANGE_RATES)

const PRESET_AMOUNTS: Record<string, number[]> = {
  BDT: [500, 1000, 2500, 5000],
  USD: [10, 25, 50, 100],
  EUR: [10, 25, 50, 100],
  GBP: [10, 25, 50, 100],
  CAD: [15, 35, 75, 150],
  AUD: [15, 35, 75, 150],
  SAR: [50, 100, 250, 500],
  AED: [50, 100, 250, 500],
  INR: [500, 1000, 2000, 5000],
  MYR: [50, 100, 250, 500],
}

export function DonationForm({
  campaign,
  onSuccess,
  onCancel,
}: DonationFormProps) {
  const [currency, setCurrency] = useState<string>(campaign.currency || 'BDT')
  const defaultPresets = PRESET_AMOUNTS[currency] || [10, 25, 50, 100]
  const [amount, setAmount] = useState<number | ''>(defaultPresets[1] || 1000)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bkash' | 'manual' | 'nagad'>('bkash')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const currentPresets = PRESET_AMOUNTS[currency] || [10, 25, 50, 100]

  // Live conversion estimation
  const numAmount = typeof amount === 'number' ? amount : 0
  const campaignBaseCurrency = campaign.currency || 'BDT'
  const liveConversion = convertCurrency(numAmount, currency, campaignBaseCurrency)
  const showConversion = currency.toUpperCase() !== campaignBaseCurrency.toUpperCase() && numAmount > 0

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency)
    const newPresets = PRESET_AMOUNTS[newCurrency] || [10, 25, 50, 100]
    setAmount(newPresets[1] || 25)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!amount || amount <= 0) {
      setErrorMessage('Please enter a valid donation amount greater than 0.')
      return
    }

    startTransition(async () => {
      const result = await createDonationAction({
        campaign_id: campaign.id,
        amount: Number(amount),
        currency,
        donor_name: donorName.trim() || undefined,
        donor_email: donorEmail.trim() || undefined,
        payment_method: paymentMethod,
        is_anonymous: isAnonymous,
      })

      if (!result.success || !result.data) {
        setErrorMessage(result.error || 'Failed to complete donation. Please try again.')
      } else {
        onSuccess(result.data)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="Donation form">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-sm text-red-300"
        >
          {errorMessage}
        </div>
      )}

      {/* Currency & Amount Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label htmlFor="currency-select" className="text-sm font-semibold text-zinc-200">
            Select Currency
          </label>
          <select
            id="currency-select"
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            disabled={isPending}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {SUPPORTED_CURRENCIES.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>

        {/* Preset Amount Pills */}
        <div className="grid grid-cols-4 gap-2">
          {currentPresets.map((preset) => {
            const isSelected = amount === preset
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                disabled={isPending}
                className={`py-2 px-1 text-sm font-bold rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/10'
                    : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700/60 hover:text-white'
                }`}
              >
                {preset}
              </button>
            )
          })}
        </div>

        {/* Custom Amount Input */}
        <div>
          <label htmlFor="custom-amount" className="sr-only">
            Custom Donation Amount
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 font-semibold text-sm">
              {currency}
            </span>
            <input
              id="custom-amount"
              type="number"
              min="1"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={isPending}
              placeholder="Custom amount"
              className="w-full pl-14 pr-4 py-2.5 bg-zinc-900/90 border border-zinc-700 rounded-xl text-white font-semibold placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Live Conversion Banner */}
        {showConversion && (
          <div className="rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-3.5 py-2 text-xs flex items-center justify-between text-zinc-300">
            <span>Estimated Credit to Campaign:</span>
            <span className="font-bold text-emerald-400">
              ≈ {formatCurrency(liveConversion.convertedAmount, campaignBaseCurrency)}
            </span>
          </div>
        )}
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-200">Payment Channel</label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'bkash', label: 'bKash / Nagad' },
              { id: 'card', label: 'Debit / Card' },
              { id: 'manual', label: 'Bank / Cash' },
            ] as const
          ).map((method) => {
            const isSelected = paymentMethod === method.id
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                disabled={isPending}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                    : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700/60 hover:text-white'
                }`}
              >
                {method.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Donor Info (Optional) */}
      <div className="space-y-3 pt-1 border-t border-zinc-800">
        <div>
          <label htmlFor="donor-name" className="block text-xs font-semibold text-zinc-300 mb-1">
            Your Name (Optional)
          </label>
          <input
            id="donor-name"
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            disabled={isPending || isAnonymous}
            placeholder="John Doe"
            className="w-full px-3.5 py-2 bg-zinc-900/90 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="donor-email" className="block text-xs font-semibold text-zinc-300 mb-1">
            Email for Receipt (Optional)
          </label>
          <input
            id="donor-email"
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            disabled={isPending}
            placeholder="donor@example.com"
            className="w-full px-3.5 py-2 bg-zinc-900/90 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Anonymous Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            disabled={isPending}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-xs text-zinc-300 select-none">
            Make my donation anonymous on the public supporter list
          </span>
        </label>
      </div>

      {/* Modal Actions */}
      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="w-1/3 py-2.5 px-4 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="w-2/3 py-2.5 px-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 font-bold rounded-xl hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            `Donate ${formatCurrency(numAmount, currency)}`
          )}
        </button>
      </div>
    </form>
  )
}
