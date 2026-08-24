'use client' // Required for client-side interactions and transitions

import { useTransition } from 'react'
import { deleteBeneficiaryAction } from '@/lib/actions/beneficiary.actions'

interface DeleteBeneficiaryButtonProps {
  id: string
  fullName: string
}

export function DeleteBeneficiaryButton({ id, fullName }: DeleteBeneficiaryButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete beneficiary "${fullName}"? This action cannot be undone.`)) {
      startTransition(async () => {
        const result = await deleteBeneficiaryAction(id)
        if (!result.success) {
          alert(result.error || 'Failed to delete beneficiary.')
        }
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete beneficiary ${fullName}`}
      className="text-xs font-medium text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors focus:outline-none"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
