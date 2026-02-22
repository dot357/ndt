import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAdminOrMod } from '../../utils/auth'
import { enforceRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAdminOrMod(event)

  await enforceRateLimit(event, {
    name: 'manage-proverbs',
    max: 60,
    windowMs: 60_000,
    key: user.id
  })

  const query = getQuery(event)
  const userId = typeof query.userId === 'string' ? query.userId : undefined
  const language = typeof query.language === 'string' ? query.language : undefined
  const limit = Math.min(Number(query.limit || 10), 50)
  const page = Math.max(Number(query.page || 0), 0)

  const from = page * limit
  const to = from + limit - 1

  let builder = client
    .from('proverbs')
    .select('id, original_text, country_code, language_name, status, vote_count, created_at, profiles:user_id(display_name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (userId) {
    builder = builder.eq('user_id', userId)
  }

  if (language && language !== 'all') {
    builder = builder.eq('language_name', language)
  }

  const { data, count, error } = await builder.range(from, to)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  return {
    proverbs: data || [],
    total: count ?? 0
  }
})
