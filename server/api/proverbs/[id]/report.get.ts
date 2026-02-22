import { createError, defineEventHandler, getRouterParam } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  const user = await requireUser(event)

  await enforceRateLimit(event, {
    name: 'report-status',
    max: 60,
    windowMs: 60_000,
    key: user.id
  })

  const client = await serverSupabaseClient<any>(event)
  const { data, error } = await client
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('proverb_id', proverbId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  return { hasReported: !!data }
})
