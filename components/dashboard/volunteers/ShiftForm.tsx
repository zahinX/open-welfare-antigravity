'use client'
// Required for useState (form error state), useTransition (pending state), and useRouter (redirect after submit)

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createShiftAction, updateShiftAction } from '@/lib/actions/volunteer.actions'
import type { VolunteerShift } from '@/lib/supabase/database.types'

interface ShiftFormProps {
  shift?: VolunteerShift
}

function toLocalDatetimeValue(iso?: string): string {
  if (!iso) return ''
  // Convert ISO UTC string → local YYYY-MM-DDTHH:mm for datetime-local input
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ShiftForm({ shift }: ShiftFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const isEditing = Boolean(shift)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    startTransition(async () => {
      const payload = {
        title: data.title as string,
        description: data.description as string,
        location: data.location as string,
        start_time: data.start_time as string,
        end_time: data.end_time as string,
        max_volunteers: Number(data.max_volunteers),
      }

      const result = isEditing
        ? await updateShiftAction(shift!.id, payload)
        : await createShiftAction(payload)

      if (!result.success) {
        setError(result.error ?? 'An unexpected error occurred.')
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        return
      }

      router.push('/dashboard/volunteers/shifts')
      router.refresh()
    })
  }

  const inputCls = (field: string) =>
    `w-full px-4 py-2.5 rounded-lg bg-zinc-950 border text-sm text-white placeholder-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
      fieldErrors[field]
        ? 'border-red-500'
        : 'border-zinc-700 hover:border-zinc-600'
    }`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Global error */}
      {error && !Object.keys(fieldErrors).length && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="shift-title" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Shift Title <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <input
          id="shift-title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={200}
          defaultValue={shift?.title}
          placeholder="e.g. Winter Relief Package Assembly"
          className={inputCls('title')}
          aria-describedby={fieldErrors.title ? 'title-error' : undefined}
        />
        {fieldErrors.title && (
          <p id="title-error" role="alert" className="mt-1.5 text-xs text-red-400">
            {fieldErrors.title[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="shift-description" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Description <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <textarea
          id="shift-description"
          name="description"
          required
          minLength={5}
          maxLength={2000}
          rows={4}
          defaultValue={shift?.description}
          placeholder="Describe the volunteer tasks and what to bring..."
          className={`${inputCls('description')} resize-none`}
          aria-describedby={fieldErrors.description ? 'description-error' : undefined}
        />
        {fieldErrors.description && (
          <p id="description-error" role="alert" className="mt-1.5 text-xs text-red-400">
            {fieldErrors.description[0]}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="shift-location" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Location <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <input
          id="shift-location"
          name="location"
          type="text"
          required
          minLength={2}
          maxLength={300}
          defaultValue={shift?.location}
          placeholder="e.g. Central Welfare Warehouse, Sector 4, Uttara"
          className={inputCls('location')}
          aria-describedby={fieldErrors.location ? 'location-error' : undefined}
        />
        {fieldErrors.location && (
          <p id="location-error" role="alert" className="mt-1.5 text-xs text-red-400">
            {fieldErrors.location[0]}
          </p>
        )}
      </div>

      {/* Start / End times */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shift-start-time" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Start Time <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="shift-start-time"
            name="start_time"
            type="datetime-local"
            required
            defaultValue={toLocalDatetimeValue(shift?.start_time)}
            className={inputCls('start_time')}
            aria-describedby={fieldErrors.start_time ? 'start-time-error' : undefined}
          />
          {fieldErrors.start_time && (
            <p id="start-time-error" role="alert" className="mt-1.5 text-xs text-red-400">
              {fieldErrors.start_time[0]}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="shift-end-time" className="block text-sm font-medium text-zinc-300 mb-1.5">
            End Time <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="shift-end-time"
            name="end_time"
            type="datetime-local"
            required
            defaultValue={toLocalDatetimeValue(shift?.end_time)}
            className={inputCls('end_time')}
            aria-describedby={fieldErrors.end_time ? 'end-time-error' : undefined}
          />
          {fieldErrors.end_time && (
            <p id="end-time-error" role="alert" className="mt-1.5 text-xs text-red-400">
              {fieldErrors.end_time[0]}
            </p>
          )}
        </div>
      </div>

      {/* Max volunteers */}
      <div>
        <label htmlFor="shift-max-volunteers" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Max Volunteers <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <input
          id="shift-max-volunteers"
          name="max_volunteers"
          type="number"
          required
          min={1}
          defaultValue={shift?.max_volunteers ?? 10}
          className={`${inputCls('max_volunteers')} max-w-[160px]`}
          aria-describedby={fieldErrors.max_volunteers ? 'max-volunteers-error' : undefined}
        />
        {fieldErrors.max_volunteers && (
          <p id="max-volunteers-error" role="alert" className="mt-1.5 text-xs text-red-400">
            {fieldErrors.max_volunteers[0]}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          {isPending ? (isEditing ? 'Saving…' : 'Creating…') : (isEditing ? 'Save Changes' : 'Create Shift')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
