import { createError, defineEventHandler, getRouterParam } from 'h3'
import { logModAction, requireAdminOrMod } from '../../../../utils/auth'
import { enforceRateLimit } from '../../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const reportId = getRouterParam(event, 'id')
  if (!reportId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing report id.' })
  }

  const { user, client } = await requireAdminOrMod(event)
  await enforceRateLimit(event, { name: 'manage-report-dismiss', max: 40, windowMs: 60_000, key: user.id })

  const { error } = await client
    .from('reports')
    .update({ status: 'dismissed', resolved_by: user.id })
    .eq('id', reportId)

  if (error) throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })

  await logModAction(client, user.id, 'dismiss_report', 'report', reportId)
  return { ok: true }
})
