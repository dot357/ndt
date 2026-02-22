import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAdminOrMod } from '../../utils/auth'
import { enforceRateLimit } from '../../utils/rate-limit'

const allowedStatuses = new Set(['open', 'resolved', 'dismissed'])

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAdminOrMod(event)

  await enforceRateLimit(event, {
    name: 'manage-reports',
    max: 60,
    windowMs: 60_000,
    key: user.id
  })

  const query = getQuery(event)
  const status = String(query.status || 'open')
  if (!allowedStatuses.has(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid status filter.' })
  }

  const { data, error } = await client
    .from('reports')
    .select('id, reason, status, created_at, reporter:reporter_id(display_name), proverb:proverb_id(id, original_text, literal_text, country_code, language_name)')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  return { reports: data || [] }
})
