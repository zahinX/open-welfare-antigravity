'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCampaignAction } from '@/lib/actions/campaign.actions'

interface DeleteCampaignButtonProps {
  id: string
  title: string
}

export function DeleteCampaignButton({ id, title }: DeleteCampaignButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCampaignAction(id)
      if (!result.success) {
        setError(result.error ?? 'Failed to delete campaign.')
        setShowConfirm(false)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Deleting…' : 'Delete'}
      </button>

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Campaign?</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">&ldquo;{title}&rdquo;</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
