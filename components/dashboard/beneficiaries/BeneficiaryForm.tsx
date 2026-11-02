'use client' // Required for useFormStatus pending state

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import {
  createBeneficiaryAction,
  updateBeneficiaryAction,
} from '@/lib/actions/beneficiary.actions'
import { Beneficiary } from '@/lib/supabase/database.types'

interface BeneficiaryFormProps {
  initialData?: Beneficiary
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
        isEdit ? 'Save Changes' : 'Create Beneficiary'
      )}
    </button>
  )
}

export function BeneficiaryForm({ initialData }: BeneficiaryFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const action = isEdit
    ? async (_prevState: unknown, formData: FormData) => {
        const payload = {
          full_name: formData.get('full_name') as string,
          contact_phone: (formData.get('contact_phone') as string) || null,
          address: (formData.get('address') as string) || null,
          family_size: Number(formData.get('family_size')),
          assessment_notes: (formData.get('assessment_notes') as string) || null,
          status: formData.get('status') as Beneficiary['status'],
        }
        const res = await updateBeneficiaryAction(initialData.id, payload)
        if (!res.success) return { ...res, submittedData: payload }
        return res
      }
    : async (_prevState: unknown, formData: FormData) => {
        const payload = {
          full_name: formData.get('full_name') as string,
          contact_phone: (formData.get('contact_phone') as string) || null,
          address: (formData.get('address') as string) || null,
          family_size: Number(formData.get('family_size')),
          assessment_notes: (formData.get('assessment_notes') as string) || null,
          status: formData.get('status') as Beneficiary['status'],
        }
        const res = await createBeneficiaryAction(payload)
        if (!res.success) return { ...res, submittedData: payload }
        return res
      }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction] = useActionState<any, FormData>(action, null)

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard/beneficiaries')
    }
  }, [state, router])

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

      {/* Full Name */}
      <div className="space-y-1.5">
        <label htmlFor="full_name" className="block text-sm font-medium text-zinc-200">
          Full Name <span className="text-red-400">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={state?.submittedData?.full_name ?? initialData?.full_name ?? ''}
          placeholder="e.g. John Doe"
          className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
            state?.fieldErrors?.full_name ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
          }`}
        />
        {state?.fieldErrors?.full_name && (
          <p className="text-xs text-red-400">{state.fieldErrors.full_name[0]}</p>
        )}
      </div>

      {/* Contact & Family Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label htmlFor="contact_phone" className="block text-sm font-medium text-zinc-200">
            Contact Phone <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            type="text"
            defaultValue={state?.submittedData?.contact_phone ?? initialData?.contact_phone ?? ''}
            placeholder="e.g. +8801700000000"
            className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
              state?.fieldErrors?.contact_phone ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
            }`}
          />
          {state?.fieldErrors?.contact_phone && (
            <p className="text-xs text-red-400">{state.fieldErrors.contact_phone[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="family_size" className="block text-sm font-medium text-zinc-200">
            Family Size <span className="text-red-400">*</span>
          </label>
          <input
            id="family_size"
            name="family_size"
            type="number"
            min="1"
            required
            defaultValue={state?.submittedData?.family_size ?? initialData?.family_size ?? 1}
            className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
              state?.fieldErrors?.family_size ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
            }`}
          />
          {state?.fieldErrors?.family_size && (
            <p className="text-xs text-red-400">{state.fieldErrors.family_size[0]}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label htmlFor="address" className="block text-sm font-medium text-zinc-200">
          Address <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={state?.submittedData?.address ?? initialData?.address ?? ''}
          placeholder="e.g. 123 Main St, Dhaka"
          className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y transition-colors ${
            state?.fieldErrors?.address ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
          }`}
        />
        {state?.fieldErrors?.address && (
          <p className="text-xs text-red-400">{state.fieldErrors.address[0]}</p>
        )}
      </div>

      {/* Assessment Notes */}
      <div className="space-y-1.5">
        <label htmlFor="assessment_notes" className="block text-sm font-medium text-zinc-200">
          Assessment Notes <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="assessment_notes"
          name="assessment_notes"
          rows={5}
          defaultValue={state?.submittedData?.assessment_notes ?? initialData?.assessment_notes ?? ''}
          placeholder="Enter detailed notes about the beneficiary's situation..."
          className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900 border text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y transition-colors ${
            state?.fieldErrors?.assessment_notes ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'
          }`}
        />
        {state?.fieldErrors?.assessment_notes && (
          <p className="text-xs text-red-400">{state.fieldErrors.assessment_notes[0]}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label htmlFor="status" className="block text-sm font-medium text-zinc-200">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={state?.submittedData?.status ?? initialData?.status ?? 'pending'}
          className="w-full sm:w-1/2 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <SubmitButton isEdit={isEdit} />
        <a
          href="/dashboard/beneficiaries"
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
