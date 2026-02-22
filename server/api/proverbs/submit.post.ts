import { createError, defineEventHandler, readBody } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../utils/auth'
import { enforceRateLimit } from '../../utils/rate-limit'

interface SubmitBody {
  country_code?: string
  region?: string
  language_name?: string
  original_text?: string
  literal_text?: string
  meaning_text?: string
  wrong_options?: string[]
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  await enforceRateLimit(event, {
    name: 'submit-proverb',
    max: 10,
    windowMs: 60_000,
    key: user.id
  })

  const body = await readBody<SubmitBody>(event)
  const wrongOptions = body.wrong_options || []

  if (!body.country_code || !body.language_name || !body.original_text || !body.literal_text || !body.meaning_text || wrongOptions.length !== 3) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing required fields.' })
  }

  const client = await serverSupabaseClient<any>(event)
  const { data: proverb, error: insertError } = await client
    .from('proverbs')
    .insert({
      user_id: user.id,
      country_code: body.country_code,
      region: body.region || null,
      language_name: body.language_name,
      original_text: body.original_text,
      literal_text: body.literal_text,
      meaning_text: body.meaning_text,
      status: 'pending'
    })
    .select('id')
    .single()

  if (insertError || !proverb?.id) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: insertError?.message || 'Failed to submit proverb.' })
  }

  const options = [
    { proverb_id: proverb.id, option_text: body.meaning_text, is_correct: true, sort_order: 0 },
    ...wrongOptions.map((text, i) => ({
      proverb_id: proverb.id,
      option_text: text,
      is_correct: false,
      sort_order: i + 1
    }))
  ]

  const { error: optionsError } = await client.from('guess_options').insert(options)
  if (optionsError) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: optionsError.message })
  }

  return { id: proverb.id as string }
})
