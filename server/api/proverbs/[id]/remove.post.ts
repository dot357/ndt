import { createError, defineEventHandler, getRouterParam } from 'h3'
import { logModAction, requireAdmin } from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  const { user, client } = await requireAdmin(event)

  await enforceRateLimit(event, {
    name: 'proverb-remove',
    max: 20,
    windowMs: 60_000,
    key: user.id
  })

  const { error: updateError } = await client
    .from('proverbs')
    .update({ status: 'flagged' })
    .eq('id', proverbId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: updateError.message })
  }

  await logModAction(client, user.id, 'remove_proverb', 'proverb', proverbId)

  return { ok: true }
})
