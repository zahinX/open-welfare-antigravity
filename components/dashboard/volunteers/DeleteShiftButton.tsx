'use client'
// Required for useTransition (pending state) and router.refresh after deletion

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteShiftAction } from '@/lib/actions/volunteer.actions'

interface DeleteShiftButtonProps {
  id: string
  title: string
}

export function DeleteShiftButton({ id, title }: DeleteShiftButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteShiftAction(id)
      if (!result.success) {
        setError(result.error ?? 'Failed to delete shift.')
        setShowConfirm(false)
        return
      }
      router.refresh()
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400 hidden sm:inline">Delete &quot;{title}&quot;?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          aria-label={`Confirm deletion of shift: ${title}`}
        >
          {isPending ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-xs text-zinc-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 rounded"
          aria-label="Cancel deletion"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div>
      {error && <p className="text-xs text-red-400 mb-1">{error}</p>}
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        aria-label={`Delete shift: ${title}`}
      >
        Delete
      </button>
    </div>
  )
}
