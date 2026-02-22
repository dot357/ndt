import { createError, defineEventHandler, getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { enforceRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, {
    name: 'proverbs-feed',
    max: 120,
    windowMs: 60_000
  })

  const query = getQuery(event)
  const region = typeof query.region === 'string' ? query.region : 'All'
  const sort = query.sort === 'newest' ? 'newest' : 'trending'
  const page = Math.max(Number(query.page || 0), 0)
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 50)

  const from = page * limit
  const to = from + limit - 1

  const client = await serverSupabaseClient<any>(event)

  let builder = client
    .from('proverbs')
    .select('*, profiles(display_name), reactions(emoji, user_id)')
    .eq('status', 'published')

  if (region && region !== 'All') {
    builder = builder.eq('region', region)
  }

  builder = sort === 'trending'
    ? builder.order('vote_count', { ascending: false })
    : builder.order('created_at', { ascending: false })

  const { data, error } = await builder.range(from, to)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  return {
    proverbs: data || []
  }
})
