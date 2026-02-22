import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAdminOrMod } from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAdminOrMod(event)

  await enforceRateLimit(event, {
    name: 'manage-proverb-languages',
    max: 60,
    windowMs: 60_000,
    key: user.id
  })

  const query = getQuery(event)
  const userId = typeof query.userId === 'string' ? query.userId : undefined

  let builder = client.from('proverbs').select('language_name')
  if (userId) {
    builder = builder.eq('user_id', userId)
  }

  const { data, error } = await builder
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  const counts = new Map<string, number>()
  for (const row of data || []) {
    const lang = row.language_name
    counts.set(lang, (counts.get(lang) || 0) + 1)
  }

  const languages = Array.from(counts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)

  return { languages }
})
