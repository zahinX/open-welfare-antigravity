'use client'
// Required for useTransition (pending state), useState (feedback message), and router.refresh

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { signUpAction, cancelSignUpAction } from '@/lib/actions/volunteer.actions'

interface SignUpButtonProps {
  shiftId: string
  isSignedUp: boolean
  isFull: boolean
  isLoggedIn: boolean
}

export function SignUpButton({ shiftId, isSignedUp, isFull, isLoggedIn }: SignUpButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handleAction() {
    setMessage(null)
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    startTransition(async () => {
      const result = isSignedUp
        ? await cancelSignUpAction(shiftId)
        : await signUpAction({ shift_id: shiftId })

      if (result.success) {
        setMessage({
          type: 'success',
          text: isSignedUp ? 'Your sign-up has been cancelled.' : 'You\'re signed up! See you there.',
        })
        router.refresh()
      } else {
        setMessage({
          type: 'error',
          text: result.error ?? 'An unexpected error occurred.',
        })
      }
    })
  }

  const isDisabled = isPending || (isFull && !isSignedUp)

  return (
    <div className="space-y-2">
      {message && (
        <p
          role="alert"
          aria-live="polite"
          className={`text-xs px-3 py-2 rounded-lg ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {message.text}
        </p>
      )}
      <button
        onClick={handleAction}
        disabled={isDisabled}
        aria-label={
          !isLoggedIn
            ? 'Log in to sign up for this shift'
            : isSignedUp
              ? 'Cancel your sign-up for this shift'
              : isFull
                ? 'This shift is full'
                : 'Sign up for this volunteer shift'
        }
        className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed
          ${isSignedUp
            ? 'bg-zinc-800 text-zinc-300 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 border border-zinc-700 focus:ring-red-500'
            : isFull
              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 focus:ring-zinc-500'
              : 'bg-emerald-500 text-white hover:bg-emerald-400 focus:ring-emerald-500'
          }`}
      >
        {isPending
          ? isSignedUp ? 'Cancelling…' : 'Signing up…'
          : !isLoggedIn
            ? 'Log in to Sign Up'
            : isSignedUp
              ? 'Cancel Sign-up'
              : isFull
                ? 'Shift Full'
                : 'Sign Up'}
      </button>
    </div>
  )
}
