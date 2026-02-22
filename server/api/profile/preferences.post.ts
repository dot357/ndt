import { createError, defineEventHandler, readBody } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface ProfilePreferencesBody {
  marketing_updates_opt_in?: boolean
  terms_accepted_at?: string | null
  privacy_accepted_at?: string | null
}

export default defineEventHandler(async (event) => {
  const claims = await serverSupabaseUser(event)
  const userId = (claims as any)?.id || (claims as any)?.sub

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Authentication required.' })
  }

  const body = await readBody<ProfilePreferencesBody>(event)

  const updates: Record<string, any> = {}
  if (typeof body?.marketing_updates_opt_in === 'boolean') {
    updates.marketing_updates_opt_in = body.marketing_updates_opt_in
  }
  if (typeof body?.terms_accepted_at === 'string' || body?.terms_accepted_at === null) {
    updates.terms_accepted_at = body.terms_accepted_at
  }
  if (typeof body?.privacy_accepted_at === 'string' || body?.privacy_accepted_at === null) {
    updates.privacy_accepted_at = body.privacy_accepted_at
  }

  if (Object.keys(updates).length === 0) {
    return { ok: true }
  }

  const client = await serverSupabaseClient<any>(event)
  const { error } = await client
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  return { ok: true }
})
