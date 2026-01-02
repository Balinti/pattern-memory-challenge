import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function requireAdmin(request: NextRequest) {
  // Check for admin API key first
  const apiKey = request.headers.get('x-admin-api-key')
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    return { isAdmin: true, method: 'api_key' as const }
  }

  // Check for authenticated admin user
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { isAdmin: false, method: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin) {
    return { isAdmin: true, method: 'user' as const }
  }

  return { isAdmin: false, method: null }
}
