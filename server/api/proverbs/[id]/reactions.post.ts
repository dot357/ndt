import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireUser } from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rate-limit'

interface ReactionBody {
  emoji?: string
}

export default defineEventHandler(async (event) => {
  const proverbId = getRouterParam(event, 'id')
  if (!proverbId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing proverb id.' })
  }

  const user = await requireUser(event)
  await enforceRateLimit(event, {
    name: 'reactions-toggle',
    max: 60,
    windowMs: 60_000,
    key: user.id
  })

  const body = await readBody<ReactionBody>(event)

  if (!body?.emoji) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Emoji is required.' })
  }

  const client = await serverSupabaseClient<any>(event)
  const { data: existing, error: existingError } = await client
    .from('reactions')
    .select('emoji')
    .eq('proverb_id', proverbId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingError) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: existingError.message })
  }

  if (existing?.emoji === body.emoji) {
    const { error: deleteError } = await client
      .from('reactions')
      .delete()
      .eq('proverb_id', proverbId)
      .eq('user_id', user.id)

    if (deleteError) {
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: deleteError.message })
    }

    return { emoji: null }
  }

  const { error: upsertError } = await client
    .from('reactions')
    .upsert(
      { proverb_id: proverbId, user_id: user.id, emoji: body.emoji },
      { onConflict: 'user_id,proverb_id' }
    )

  if (upsertError) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: upsertError.message })
  }

  return { emoji: body.emoji }
})
