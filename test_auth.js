import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@openwelfare.org',
    password: 'SecureAdminPass2026!'
  })

  if (authError) {
    console.error('Auth Error:', authError)
    return
  }

  console.log('Logged in successfully. Session:', session?.user?.id)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.error('Profile Error:', profileError)
  } else {
    console.log('Profile:', profile)
  }
}

test()
