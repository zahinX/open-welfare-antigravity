'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)

  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: { full_name: formData.get('full_name') as string },
    },
  })

  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`)

  redirect('/login?message=Check+your+email+to+confirm+your+account')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard` }
  )

  if (error) redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)

  redirect('/forgot-password?message=Check+your+email+for+a+reset+link')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
