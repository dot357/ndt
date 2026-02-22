import { createError, defineEventHandler, readBody } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface ConsumeBody {
  consentToken?: string
}

interface ConsumedConsent {
  marketing_updates_opt_in: boolean
  terms_accepted_at: string
  privacy_accepted_at: string
}

export default defineEventHandler(async (event) => {
  const claims = await serverSupabaseUser(event)
  const userId = (claims as any)?.id || (claims as any)?.sub
  const userEmail = (claims as any)?.email as string | undefined

  if (!userId || !userEmail) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Authentication required.' })
  }

  const body = await readBody<ConsumeBody>(event)
  const consentToken = body?.consentToken?.trim()
  if (!consentToken) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing consent token.' })
  }

  const client = await serverSupabaseClient<any>(event)
  const { data, error: consumeError } = await client.rpc('consume_pending_auth_consent', {
    p_token: consentToken,
    p_email: userEmail
  })

  if (consumeError) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: consumeError.message })
  }

  const consent = (data?.[0] || null) as ConsumedConsent | null
  if (!consent) {
    return { ok: true, consumed: false }
  }

  const updates: Record<string, any> = {
    terms_accepted_at: consent.terms_accepted_at,
    privacy_accepted_at: consent.privacy_accepted_at
  }
  // Never downgrade opt-in during sign-in flows; only set it when explicitly true.
  if (consent.marketing_updates_opt_in) {
    updates.marketing_updates_opt_in = true
  }

  const { error: updateError } = await client
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: updateError.message })
  }

  return { ok: true, consumed: true }
})
