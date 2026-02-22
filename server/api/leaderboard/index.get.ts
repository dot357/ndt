import { createError, defineEventHandler, getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { enforceRateLimit } from '../../utils/rate-limit'

type Period = 'daily' | 'weekly' | 'alltime'

const allowedPeriods = new Set<Period>(['daily', 'weekly', 'alltime'])

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, {
    name: 'leaderboard-read',
    max: 120,
    windowMs: 60_000
  })

  const query = getQuery(event)
  const period = String(query.period || 'weekly') as Period

  if (!allowedPeriods.has(period)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid leaderboard period.' })
  }

  const viewName = `leaderboard_${period}`
  const client = await serverSupabaseClient<any>(event)

  const { data, error } = await client.from(viewName).select('*')
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  return {
    entries: data || []
  }
})
