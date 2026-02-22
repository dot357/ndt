import { createError, defineEventHandler, getRouterParam } from 'h3'
import { logModAction, requireAdminOrMod } from '../../../../utils/auth'
import { enforceRateLimit } from '../../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const reportId = getRouterParam(event, 'id')
  if (!reportId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing report id.' })
  }

  const { user, client } = await requireAdminOrMod(event)
  await enforceRateLimit(event, { name: 'manage-report-resolve', max: 40, windowMs: 60_000, key: user.id })

  const { data: report, error: reportError } = await client
    .from('reports')
    .select('id, proverb_id')
    .eq('id', reportId)
    .maybeSingle()

  if (reportError) throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: reportError.message })

  if (report?.proverb_id) {
    const { error: proverbError } = await client
      .from('proverbs')
      .update({ status: 'flagged' })
      .eq('id', report.proverb_id)

    if (proverbError) throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: proverbError.message })
  }

  const { error } = await client
    .from('reports')
    .update({ status: 'resolved', resolved_by: user.id })
    .eq('id', reportId)

  if (error) throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })

  await logModAction(client, user.id, 'resolve_report', 'report', reportId)
  return { ok: true }
})
