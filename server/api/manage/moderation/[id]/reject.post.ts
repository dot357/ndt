import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { logModAction, requireAdminOrMod } from '../../../../utils/auth'
import { enforceRateLimit } from '../../../../utils/rate-limit'

interface Body {
  note?: string
}

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })

  const { user, client } = await requireAdminOrMod(event)
  await enforceRateLimit(event, { name: 'manage-reject', max: 40, windowMs: 60_000, key: user.id })

  const body = await readBody<Body>(event)

  const { error } = await client.from('proverbs').update({ status: 'rejected' }).eq('id', proverbId)
  if (error) throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })

  await logModAction(client, user.id, 'reject', 'proverb', proverbId, body?.note || null)
  return { ok: true }
})
