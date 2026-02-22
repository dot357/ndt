import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { enforceRateLimit } from '../../../utils/rate-limit'

interface GuessBody {
  optionId?: string
}

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
    name: 'proverb-guess-post',
    max: 30,
    windowMs: 60_000,
    key: userId
  })

  const body = await readBody<GuessBody>(event)
  if (!body?.optionId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing option id.' })
  }

  const client = await serverSupabaseClient<any>(event)

  const { data: option, error: optionError } = await client
    .from('guess_options')
    .select('id, is_correct, proverb_id')
    .eq('id', body.optionId)
    .eq('proverb_id', proverbId)
    .single()

  if (optionError || !option) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid answer option.' })
  }

  const isCorrect = !!option.is_correct
  const { error: insertError } = await client.from('guesses').insert({
    proverb_id: proverbId,
    selected_option: body.optionId,
    is_correct: isCorrect
  })

  if (!insertError) {
    return {
      selected_option: body.optionId,
      is_correct: isCorrect,
      already_existed: false
    }
  }

  const { data: existing, error: existingError } = await client
    .from('guesses')
    .select('selected_option, is_correct')
    .eq('proverb_id', proverbId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError || !existing) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: insertError.message })
  }

  return {
    selected_option: existing.selected_option,
    is_correct: existing.is_correct,
    already_existed: true
  }
})
