import { createError, defineEventHandler, getRouterParam } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { enforceRateLimit } from '../../utils/rate-limit'

interface ProverbDetail {
  id: string
  user_id: string
  country_code: string
  region: string | null
  language_name: string
  original_text: string
  literal_text: string
  meaning_text: string
  vote_count: number
  created_at: string
  profiles: { display_name: string | null } | null
  guess_options: { id: string; option_text: string; is_correct: boolean; sort_order: number }[]
}

function normalizeGuessOptions(
  options: ProverbDetail['guess_options'] | undefined
): ProverbDetail['guess_options'] {
  if (!options?.length) return []

  const bySort = new Map<number, ProverbDetail['guess_options'][number]>()
  for (const option of [...options].sort((a, b) => a.sort_order - b.sort_order)) {
    if (!bySort.has(option.sort_order)) {
      bySort.set(option.sort_order, option)
    }
  }

  return Array.from(bySort.values()).sort((a, b) => a.sort_order - b.sort_order)
}

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  await enforceRateLimit(event, {
    name: 'proverb-detail',
    max: 120,
    windowMs: 60_000
  })

  const client = await serverSupabaseClient<any>(event)
  const { data, error } = await client
    .from('proverbs')
    .select('*, profiles(display_name), guess_options(*)')
    .eq('id', proverbId)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Proverb not found.' })
  }

  const normalized = data as ProverbDetail
  normalized.guess_options = normalizeGuessOptions(normalized.guess_options)

  return { proverb: normalized }
})
