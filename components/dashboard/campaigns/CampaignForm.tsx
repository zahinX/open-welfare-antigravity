'use client' // Required for form action state and client-side validation feedback

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import {
  createCampaignAction,
  updateCampaignAction,
} from '@/lib/actions/campaign.actions'
import { Campaign } from '@/lib/supabase/database.types'
import { SUPPORTED_CURRENCIES } from '@/lib/utils/format'

interface CampaignFormProps {
  initialData?: Campaign
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
          {isEdit ? 'Saving…' : 'Creating…'}
        </>
      ) : (
        isEdit ? 'Save Changes' : 'Create Campaign'
      )}
    </button>
  )
}

interface CampaignFormState {
  success?: boolean
  error?: string | null
  fieldErrors?: Record<string, string[]>
  data?: Campaign | null
  submittedData?: {
    title?: string
    description?: string
    target_amount?: number
    currency?: string
    verification_text?: string | null
    verification_link?: string | null
    status?: Campaign['status']
    deadline_at?: string | null
  } | null
}

export function CampaignForm({ initialData }: CampaignFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const action = isEdit
    ? async (_prevState: CampaignFormState | null, formData: FormData): Promise<CampaignFormState> => {
        const payload = {
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          target_amount: Number(formData.get('target_amount')),
          verification_text: (formData.get('verification_text') as string) || null,
          verification_link: (formData.get('verification_link') as string) || null,
          status: formData.get('status') as Campaign['status'],
          deadline_at: (formData.get('deadline_at') as string) || null,
        }
        const res = await updateCampaignAction(initialData.id, payload)
        if (!res.success) return { ...res, submittedData: payload }
        return res
      }
    : async (_prevState: CampaignFormState | null, formData: FormData): Promise<CampaignFormState> => {
        const payload = {
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          target_amount: Number(formData.get('target_amount')),
          currency: (formData.get('currency') as string) || 'BDT',
          verification_text: (formData.get('verification_text') as string) || null,
          verification_link: (formData.get('verification_link') as string) || null,
          status: formData.get('status') as Campaign['status'],
          deadline_at: (formData.get('deadline_at') as string) || null,
        }
        const res = await createCampaignAction(payload)
        if (!res.success) return { ...res, submittedData: payload }
        return res
      }

  const [state, formAction] = useActionState<CampaignFormState | null, FormData>(action, null)

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard/campaigns')
    }
  }, [state, router])

  const formatDateForInput = (iso: string | null | undefined) => {
    if (!iso) return ''
    return iso.slice(0, 16) // "YYYY-MM-DDTHH:MM"
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

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium text-zinc-200">
          Campaign Title <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={state?.submittedData?.title ?? initialData?.title ?? ''}
          placeholder="e.g. Winter Blanket Drive"
          className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
            state?.fieldErrors?.title ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
          }`}
        />
        {state?.fieldErrors?.title && (
          <p className="text-xs text-red-400">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-200">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={state?.submittedData?.description ?? initialData?.description ?? ''}
          placeholder="Describe the campaign, its purpose, and how funds will be used…"
          className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y transition-colors ${
            state?.fieldErrors?.description ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
          }`}
        />
        {state?.fieldErrors?.description && (
          <p className="text-xs text-red-400">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      {/* Target Amount & Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label htmlFor="target_amount" className="block text-sm font-medium text-zinc-200">
            Target Goal Amount <span className="text-red-400">*</span>
          </label>
          <input
            id="target_amount"
            name="target_amount"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={state?.submittedData?.target_amount ?? initialData?.target_amount ?? 0}
            className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
              state?.fieldErrors?.target_amount ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
            }`}
          />
          {state?.fieldErrors?.target_amount && (
            <p className="text-xs text-red-400">{state.fieldErrors.target_amount[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="currency" className="block text-sm font-medium text-zinc-200">
            Campaign Base Currency {isEdit && <span className="text-xs text-zinc-400 font-normal">(Immutable)</span>}
          </label>
          {isEdit ? (
            <div className="px-4 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-sm">
              {initialData?.currency || 'BDT'} — Locked to protect donation accounting
            </div>
          ) : (
            <select
              id="currency"
              name="currency"
              defaultValue={state?.submittedData?.currency ?? 'BDT'}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
            >
              {SUPPORTED_CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.label}
                </option>
              ))}
            </select>
          )}
          {state?.fieldErrors?.currency && (
            <p className="text-xs text-red-400">{state.fieldErrors.currency[0]}</p>
          )}
        </div>
      </div>

      {/* Verification Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/60">
        <div className="space-y-1.5">
          <label htmlFor="verification_text" className="block text-sm font-medium text-zinc-200">
            Verification Text <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <input
            id="verification_text"
            name="verification_text"
            type="text"
            maxLength={255}
            defaultValue={state?.submittedData?.verification_text ?? initialData?.verification_text ?? ''}
            placeholder="e.g. Verified by Mosque Admin Committee"
            className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
          />
          <p className="text-xs text-zinc-400">Custom note shown to donors indicating verification authority.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="verification_link" className="block text-sm font-medium text-zinc-200">
            Verification Proof URL <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <input
            id="verification_link"
            name="verification_link"
            type="url"
            defaultValue={state?.submittedData?.verification_link ?? initialData?.verification_link ?? ''}
            placeholder="https://example.com/proof-document.pdf"
            className={`w-full px-4 py-2 rounded-lg bg-zinc-900 border text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
              state?.fieldErrors?.verification_link ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
            }`}
          />
          {state?.fieldErrors?.verification_link ? (
            <p className="text-xs text-red-400">{state.fieldErrors.verification_link[0]}</p>
          ) : (
            <p className="text-xs text-zinc-400">External URL linking to verifiable documents or authority.</p>
          )}
        </div>
      </div>

      {/* Status & Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-zinc-200">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={state?.submittedData?.status ?? initialData?.status ?? 'draft'}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="deadline_at" className="block text-sm font-medium text-zinc-200">
            Deadline <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <input
            id="deadline_at"
            name="deadline_at"
            type="datetime-local"
            defaultValue={state?.submittedData?.deadline_at ?? formatDateForInput(initialData?.deadline_at)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors [color-scheme:dark]"
          />
          {state?.fieldErrors?.deadline_at && (
            <p className="text-xs text-red-400">{state.fieldErrors.deadline_at[0]}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <SubmitButton isEdit={isEdit} />
        <a
          href="/dashboard/campaigns"
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
