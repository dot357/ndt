import { createError, defineEventHandler, getRouterParam } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { enforceRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const currentProverbId = getRouterParam(event, 'id')
  if (!currentProverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  const user = await serverSupabaseUser(event)
  const userId = (user as any)?.id || (user as any)?.sub
  const rateKey = userId || undefined

  await enforceRateLimit(event, {
    name: 'proverb-random-next',
    max: 45,
    windowMs: 60_000,
    key: rateKey
  })

  const client = await serverSupabaseClient<any>(event)

  let query = client
    .from('proverbs')
    .select('id')
    .eq('status', 'published')
    .limit(200)

  if (userId) {
    const { data: guessedRows, error: guessedError } = await client
      .from('proverbs')
      .select('id, guesses!inner(user_id)')
      .eq('status', 'published')
      .eq('guesses.user_id', userId)

    if (guessedError) {
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: guessedError.message })
    }

    const guessedIds = new Set((guessedRows || []).map((row: any) => row.id))
    guessedIds.add(currentProverbId)

    if (guessedIds.size > 0) {
      query = query.not('id', 'in', `(${Array.from(guessedIds).join(',')})`)
    }
  } else {
    query = query.neq('id', currentProverbId)
  }

  const { data, error } = await query

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  let ids = (data || []).map((row: { id: string }) => row.id)

  // If user has answered everything, fall back to any other published proverb.
  if (!ids.length) {
    const { data: fallbackData, error: fallbackError } = await client
      .from('proverbs')
      .select('id')
      .eq('status', 'published')
      .neq('id', currentProverbId)
      .limit(200)

    if (fallbackError) {
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: fallbackError.message })
    }

    ids = (fallbackData || []).map((row: { id: string }) => row.id)
    if (!ids.length) {
      return { id: null }
    }
  }

  const randomId = ids[Math.floor(Math.random() * ids.length)]
  return { id: randomId }
})
