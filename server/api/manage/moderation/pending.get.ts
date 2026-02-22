import { defineEventHandler } from 'h3'
import { requireAdminOrMod } from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAdminOrMod(event)

  await enforceRateLimit(event, {
    name: 'manage-moderation-pending',
    max: 60,
    windowMs: 60_000,
    key: user.id
  })

  const { data, error } = await client
    .from('proverbs')
    .select('id, original_text, literal_text, meaning_text, country_code, language_name, status, created_at, profiles:user_id(display_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })

  return { proverbs: data || [] }
})
