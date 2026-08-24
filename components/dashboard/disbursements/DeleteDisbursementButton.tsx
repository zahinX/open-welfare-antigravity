'use client' // Required for client-side interactions and transitions

import { useTransition } from 'react'
import { deleteDisbursementAction } from '@/lib/actions/disbursement.actions'

interface DeleteDisbursementButtonProps {
  id: string
  beneficiaryId?: string
}

export function DeleteDisbursementButton({ id, beneficiaryId }: DeleteDisbursementButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this disbursement? This action cannot be undone.')) {
      startTransition(async () => {
        const result = await deleteDisbursementAction(id, beneficiaryId)
        if (!result.success) {
          alert(result.error || 'Failed to delete disbursement.')
        }
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete disbursement"
      className="text-xs font-medium text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors focus:outline-none"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
