import { createError, defineEventHandler, getRouterParam } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { enforceRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  await enforceRateLimit(event, {
    name: 'reactions-get',
    max: 120,
    windowMs: 60_000
  })

  const client = await serverSupabaseClient<any>(event)
  const { data, error } = await client
    .from('reactions')
    .select('emoji, user_id')
    .eq('proverb_id', proverbId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  return { reactions: data || [] }
})
