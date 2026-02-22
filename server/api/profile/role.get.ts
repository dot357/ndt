import { defineEventHandler } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { enforceRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const claims = await serverSupabaseUser(event)
  const userId = (claims as any)?.id || (claims as any)?.sub

  if (!userId) {
    return {
      role: 'user',
      banned_at: null,
      authenticated: false
    }
  }

  await enforceRateLimit(event, {
    name: 'profile-role',
    max: 120,
    windowMs: 60_000,
    key: userId
  })

  const client = await serverSupabaseClient<any>(event)
  const { data } = await client
    .from('profiles')
    .select('role, banned_at')
    .eq('id', userId)
    .maybeSingle()

  return {
    role: data?.role || 'user',
    banned_at: data?.banned_at || null,
    authenticated: true
  }
})
