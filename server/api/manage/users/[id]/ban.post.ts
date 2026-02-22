import { createError, defineEventHandler, getRouterParam } from 'h3'
import { logModAction, requireAdmin } from '../../../../utils/auth'
import { enforceRateLimit } from '../../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const targetUserId = getRouterParam(event, 'id')
  if (!targetUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing user id.' })
  }

  const { user, client } = await requireAdmin(event)
  await enforceRateLimit(event, { name: 'manage-user-ban', max: 40, windowMs: 60_000, key: user.id })

  const { error } = await client
    .from('profiles')
    .update({ banned_at: new Date().toISOString() })
    .eq('id', targetUserId)

  if (error) throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })

  await logModAction(client, user.id, 'ban', 'user', targetUserId)
  return { ok: true }
})
