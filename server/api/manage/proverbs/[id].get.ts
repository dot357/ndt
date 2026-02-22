import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAdminOrMod } from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  const { user, client } = await requireAdminOrMod(event)

  await enforceRateLimit(event, {
    name: 'manage-proverb-detail',
    max: 60,
    windowMs: 60_000,
    key: user.id
  })

  const { data, error } = await client
    .from('proverbs')
    .select('id, country_code, language_name, original_text, literal_text, meaning_text, status, guess_options(option_text, is_correct, sort_order)')
    .eq('id', proverbId)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Proverb not found.' })
  }

  return { proverb: data }
})
