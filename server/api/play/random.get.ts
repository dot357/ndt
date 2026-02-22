import { createError, defineEventHandler } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { enforceRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const claims = await serverSupabaseUser(event)
  const userId = (claims as any)?.id || (claims as any)?.sub || null

  await enforceRateLimit(event, {
    name: 'play-random',
    max: 60,
    windowMs: 60_000,
    key: userId || undefined
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

    const guessedIds = (guessedRows || []).map((row: any) => row.id)
    if (guessedIds.length > 0) {
      query = query.not('id', 'in', `(${guessedIds.join(',')})`)
    }
  }

  const { data: candidates, error } = await query

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  let ids = (candidates || []).map((row: { id: string }) => row.id)

  // If user has already answered everything, fall back to any published proverb.
  if (!ids.length) {
    const { data: fallbackData, error: fallbackError } = await client
      .from('proverbs')
      .select('id')
      .eq('status', 'published')
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
