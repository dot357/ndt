import { getRequestIP, getRequestHeader, type H3Event } from 'h3'

interface VerifyCaptchaInput {
  event: H3Event
  token?: string | null
  action: string
}

interface VerifyCaptchaResult {
  ok: boolean
  skipped: boolean
  reason: string
}

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  action?: string
}

export async function verifyCaptcha(input: VerifyCaptchaInput): Promise<VerifyCaptchaResult> {
  const config = useRuntimeConfig(input.event)
  const provider = (config.captchaProvider as string | undefined) || 'turnstile'
  const secret = config.captchaSecretKey as string | undefined

  if (provider !== 'turnstile') {
    return { ok: true, skipped: true, reason: 'unsupported_provider' }
  }

  if (!secret) {
    return { ok: true, skipped: true, reason: 'missing_secret' }
  }

  if (!input.token) {
    return { ok: false, skipped: false, reason: 'missing_token' }
  }

  try {
    const remoteIp = getRequestIP(input.event, { xForwardedFor: true }) || undefined
    const userAgent = getRequestHeader(input.event, 'user-agent') || undefined

    const payload = new URLSearchParams()
    payload.set('secret', secret)
    payload.set('response', input.token)
    if (remoteIp) payload.set('remoteip', remoteIp)

    const data = await $fetch<TurnstileVerifyResponse>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(userAgent ? { 'User-Agent': userAgent } : {})
      },
      timeout: 7000
    })

    if (!data.success) {
      return {
        ok: false,
        skipped: false,
        reason: `verify_failed:${(data['error-codes'] || []).join(',') || 'unknown'}`
      }
    }

    if (data.action && data.action !== input.action) {
      return { ok: false, skipped: false, reason: `action_mismatch:${data.action}` }
    }

    return { ok: true, skipped: false, reason: 'ok' }
  } catch (error: any) {
    return { ok: false, skipped: false, reason: `verify_error:${error?.message || 'unknown'}` }
  }
}

export async function requireCaptcha(input: VerifyCaptchaInput) {
  const config = useRuntimeConfig(input.event)
  const mode = (config.captchaMode as string | undefined) || 'monitor'

  const result = await verifyCaptcha(input)

  if (result.ok) return

  if (result.skipped) {
    if (mode === 'enforce') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'CAPTCHA is misconfigured on the server.'
      })
    }

    console.warn('[captcha-monitor]', {
      action: input.action,
      reason: result.reason,
      ip: getRequestIP(input.event, { xForwardedFor: true }) || 'unknown-ip'
    })
    return
  }

  if (mode === 'enforce') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'CAPTCHA verification failed.'
    })
  }

  console.warn('[captcha-monitor]', {
    action: input.action,
    reason: result.reason,
    ip: getRequestIP(input.event, { xForwardedFor: true }) || 'unknown-ip'
  })
}
