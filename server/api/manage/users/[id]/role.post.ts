import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { logModAction, requireAdmin } from '../../../../utils/auth'
import { enforceRateLimit } from '../../../../utils/rate-limit'

interface Body {
  role?: string
}

const allowedRoles = new Set(['user', 'moderator', 'admin'])

export default defineEventHandler(async (event) => {
  const targetUserId = getRouterParam(event, 'id')
  if (!targetUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing user id.' })
  }

  const { user, client } = await requireAdmin(event)
  await enforceRateLimit(event, { name: 'manage-user-role', max: 40, windowMs: 60_000, key: user.id })

  const body = await readBody<Body>(event)
  if (!body?.role || !allowedRoles.has(body.role)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid role.' })
  }

  const { error } = await client
    .from('profiles')
    .update({ role: body.role })
    .eq('id', targetUserId)

  if (error) throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })

  await logModAction(client, user.id, 'role_change', 'user', targetUserId, `Changed to ${body.role}`)
  return { ok: true }
})
