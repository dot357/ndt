import { createError, defineEventHandler, getRequestURL, readBody } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireCaptcha } from '../../utils/captcha'
import { enforceRateLimit } from '../../utils/rate-limit'

interface MagicLinkBody {
  captchaToken?: string
  email?: string
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export default defineEventHandler(async (event) => {
  const body = await readBody<MagicLinkBody>(event)
  const email = body?.email ? normalizeEmail(body.email) : ''

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'A valid email is required.' })
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
  const redirectTo = `${getRequestURL(event).origin}/auth/confirm`

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
