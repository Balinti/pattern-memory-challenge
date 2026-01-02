import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserWithProfile() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: ratings } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', user.id)

  return {
    user,
    profile,
    entitlement,
    ratings: ratings || [],
  }
}
