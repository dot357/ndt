import { createError, defineEventHandler, getRouterParam } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { enforceRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  const user = await serverSupabaseUser(event)
  const userId = (user as any)?.id || (user as any)?.sub
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Authentication required.' })
  }

  await enforceRateLimit(event, {
    name: 'proverb-guess-get',
    max: 120,
    windowMs: 60_000,
    key: userId
  })

  const client = await serverSupabaseClient<any>(event)
  const { data, error } = await client
    .from('guesses')
    .select('selected_option, is_correct')
    .eq('proverb_id', proverbId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  return {
    guess: data || null
  }
})
