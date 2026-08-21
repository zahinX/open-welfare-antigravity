'use client' // Required for useFormStatus pending state

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import {
  createDisbursementAction,
  updateDisbursementAction,
} from '@/lib/actions/disbursement.actions'
import { Disbursement } from '@/lib/supabase/database.types'

interface DisbursementFormProps {
  initialData?: Disbursement
  beneficiaries: { id: string; full_name: string }[]
  campaigns: { id: string; title: string; currency: string }[]
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      {pending ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {isEdit ? 'Saving…' : 'Recording…'}
        </>
      ) : (
        isEdit ? 'Save Changes' : 'Record Disbursement'
      )}
    </button>
  )
}

export function DisbursementForm({ initialData, beneficiaries, campaigns }: DisbursementFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const action = isEdit
    ? async (_prevState: unknown, formData: FormData) => {
        const payload = {
          beneficiary_id: formData.get('beneficiary_id') as string,
          campaign_id: (formData.get('campaign_id') as string) || null,
          amount_value: Number(formData.get('amount_value')),
          description: formData.get('description') as string,
          disbursed_at: (formData.get('disbursed_at') as string) || null,
        }
        const res = await updateDisbursementAction(initialData.id, payload)
        if (!res.success) return { ...res, submittedData: payload }
        return res
      }
    : async (_prevState: unknown, formData: FormData) => {
        const payload = {
          beneficiary_id: formData.get('beneficiary_id') as string,
          campaign_id: (formData.get('campaign_id') as string) || null,
          amount_value: Number(formData.get('amount_value')),
          description: formData.get('description') as string,
          disbursed_at: (formData.get('disbursed_at') as string) || null,
        }
        const res = await createDisbursementAction(payload)
        if (!res.success) return { ...res, submittedData: payload }
        return res
      }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction] = useActionState<any, FormData>(action, null)

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard/disbursements')
    }
  }, [state, router])

  const formatDateForInput = (iso: string | null | undefined) => {
    if (!iso) return ''
    return iso.slice(0, 16)
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Top-level error banner */}
      {state && !state.success && state.error && !state.fieldErrors && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      {/* Beneficiary */}
      <div className="space-y-1.5">
        <label htmlFor="beneficiary_id" className="block text-sm font-medium text-zinc-200">
          Beneficiary <span className="text-red-400">*</span>
        </label>
        <select
          id="beneficiary_id"
          name="beneficiary_id"
          required
          defaultValue={state?.submittedData?.beneficiary_id ?? initialData?.beneficiary_id ?? ''}
          className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
            state?.fieldErrors?.beneficiary_id ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
          }`}
        >
          <option value="" disabled>Select a beneficiary...</option>
          {beneficiaries.map((b) => (
            <option key={b.id} value={b.id}>{b.full_name}</option>
          ))}
        </select>
        {state?.fieldErrors?.beneficiary_id && (
          <p className="text-xs text-red-400">{state.fieldErrors.beneficiary_id[0]}</p>
        )}
      </div>

      {/* Campaign (Funding Source) */}
      <div className="space-y-1.5">
        <label htmlFor="campaign_id" className="block text-sm font-medium text-zinc-200">
          Funding Source (Campaign) <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <select
          id="campaign_id"
          name="campaign_id"
          defaultValue={state?.submittedData?.campaign_id ?? initialData?.campaign_id ?? ''}
          className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
        >
          <option value="">General Fund (Unallocated)</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.title} ({c.currency})</option>
          ))}
        </select>
      </div>

      {/* Amount & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label htmlFor="amount_value" className="block text-sm font-medium text-zinc-200">
            Amount <span className="text-red-400">*</span>
          </label>
          <input
            id="amount_value"
            name="amount_value"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={state?.submittedData?.amount_value ?? initialData?.amount_value ?? ''}
            className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
              state?.fieldErrors?.amount_value ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
            }`}
          />
          {state?.fieldErrors?.amount_value && (
            <p className="text-xs text-red-400">{state.fieldErrors.amount_value[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="disbursed_at" className="block text-sm font-medium text-zinc-200">
            Date Disbursed
          </label>
          <input
            id="disbursed_at"
            name="disbursed_at"
            type="datetime-local"
            defaultValue={state?.submittedData?.disbursed_at ?? formatDateForInput(initialData?.disbursed_at)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors [color-scheme:dark]"
          />
          {state?.fieldErrors?.disbursed_at && (
            <p className="text-xs text-red-400">{state.fieldErrors.disbursed_at[0]}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-200">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={state?.submittedData?.description ?? initialData?.description ?? ''}
          placeholder="e.g. Paid for medical bills and transport..."
          className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y transition-colors ${
            state?.fieldErrors?.description ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
          }`}
        />
        {state?.fieldErrors?.description && (
          <p className="text-xs text-red-400">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <SubmitButton isEdit={isEdit} />
        <a
          href="/dashboard/disbursements"
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
