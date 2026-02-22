import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../../utils/auth'
import { requireCaptcha } from '../../../utils/captcha'
import { enforceRateLimit } from '../../../utils/rate-limit'

interface ReportBody {
  captchaToken?: string
  reason?: string
}

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  const user = await requireUser(event)

  await enforceRateLimit(event, {
    name: 'report-submit',
    max: 8,
    windowMs: 60_000,
    key: user.id
  })

  const body = await readBody<ReportBody>(event)
  await requireCaptcha({
    event,
    token: body?.captchaToken,
    action: 'report_proverb'
  })

  if (!body?.reason?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Reason is required.' })
  }

  const client = await serverSupabaseClient<any>(event)

  const { error } = await client
    .from('reports')
    .insert({
      reporter_id: user.id,
      proverb_id: proverbId,
      reason: body.reason.trim()
    })

  if (error) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: error.message })
  }

  return { ok: true }
})
