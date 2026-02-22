import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { logModAction, requireAdminOrMod } from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rate-limit'

interface Body {
  country_code?: string
  region?: string | null
  language_name?: string
  original_text?: string
  literal_text?: string
  meaning_text?: string
  status?: string
  wrong_options?: string[]
}

const allowedStatuses = new Set(['pending', 'published', 'rejected', 'flagged', 'draft'])

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  const { user, client } = await requireAdminOrMod(event)

  await enforceRateLimit(event, {
    name: 'manage-proverb-update',
    max: 30,
    windowMs: 60_000,
    key: user.id
  })

  const body = await readBody<Body>(event)
  if (!body || !body.country_code || !body.language_name || !body.original_text || !body.literal_text || !body.meaning_text || !body.status || !body.wrong_options || body.wrong_options.length !== 3) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing required fields.' })
  }

  if (!allowedStatuses.has(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid status.' })
  }

  const { error: updateError } = await client
    .from('proverbs')
    .update({
      country_code: body.country_code,
      region: body.region ?? null,
      language_name: body.language_name,
      original_text: body.original_text,
      literal_text: body.literal_text,
      meaning_text: body.meaning_text,
      status: body.status
    })
    .eq('id', proverbId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: updateError.message })
  }

  const { error: deleteOptionsError } = await client
    .from('guess_options')
    .delete()
    .eq('proverb_id', proverbId)

  if (deleteOptionsError) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: deleteOptionsError.message })
  }

  const options = [
    { proverb_id: proverbId, option_text: body.meaning_text, is_correct: true, sort_order: 0 },
    { proverb_id: proverbId, option_text: body.wrong_options[0], is_correct: false, sort_order: 1 },
    { proverb_id: proverbId, option_text: body.wrong_options[1], is_correct: false, sort_order: 2 },
    { proverb_id: proverbId, option_text: body.wrong_options[2], is_correct: false, sort_order: 3 }
  ]

  const { error: insertOptionsError } = await client
    .from('guess_options')
    .insert(options)

  if (insertOptionsError) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: insertOptionsError.message })
  }

  await logModAction(client, user.id, 'edit_proverb', 'proverb', proverbId)

  return { ok: true }
})
