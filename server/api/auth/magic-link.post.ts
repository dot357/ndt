import { createError, defineEventHandler, getRequestURL, readBody } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireCaptcha } from '../../utils/captcha'
import { enforceRateLimit } from '../../utils/rate-limit'

interface MagicLinkBody {
  captchaToken?: string
  email?: string
  marketing_updates_opt_in?: boolean
  terms_accepted_at?: string
  privacy_accepted_at?: string
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody<MagicLinkBody>(event)
  const email = body?.email ? normalizeEmail(body.email) : ''

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'A valid email is required.' })
  }

  if (!body?.terms_accepted_at || !body?.privacy_accepted_at) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Terms and Privacy consent is required.'
    })
  }

  await enforceRateLimit(event, {
    name: 'auth-magic-link-ip',
    max: 8,
    windowMs: 60_000
  })

  await enforceRateLimit(event, {
    name: 'auth-magic-link-email',
    max: 3,
    windowMs: 60_000,
    key: email
  })

  await requireCaptcha({
    event,
    token: body?.captchaToken,
    action: 'request_magic_link'
  })

  const client = await serverSupabaseClient<any>(event)
  const consentToken = crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

  const { error: consentError } = await client.rpc('store_pending_auth_consent', {
    p_token: consentToken,
    p_email: email,
    p_marketing_updates_opt_in: !!body?.marketing_updates_opt_in,
    p_terms_accepted_at: body.terms_accepted_at,
    p_privacy_accepted_at: body.privacy_accepted_at,
    p_expires_at: expiresAt
  })

  if (consentError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: consentError.message
    })
  }

  const configuredBaseUrl = (config.authRedirectBaseUrl as string | undefined)?.trim()
  const baseUrl = configuredBaseUrl || getRequestURL(event).origin
  const redirectTo = `${baseUrl.replace(/\/$/, '')}/auth/confirm?consent_token=${encodeURIComponent(consentToken)}`

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error.message
    })
  }

  return { ok: true }
})
