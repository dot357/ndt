import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { enforceRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAdmin(event)

  await enforceRateLimit(event, {
    name: 'manage-users',
    max: 60,
    windowMs: 60_000,
    key: user.id
  })

  const query = getQuery(event)
  const search = String(query.search || '').trim()
  const statusParam = String(query.status || 'active')
  const emailParam = String(query.email || 'opted_in,opted_out')
  const statuses = new Set(statusParam.split(',').map(s => s.trim()).filter(Boolean))
  const emailPreferences = new Set(emailParam.split(',').map(s => s.trim()).filter(Boolean))

  let builder = client
    .from('profiles')
    .select('id, display_name, role, banned_at, created_at, marketing_updates_opt_in')
    .order('created_at', { ascending: false })

  if (search) {
    builder = builder.ilike('display_name', `%${search}%`)
  }

  const includesActive = statuses.has('active')
  const includesBanned = statuses.has('banned')

  if (!includesActive && !includesBanned) {
    return { users: [] }
  }

  if (includesActive && !includesBanned) {
    builder = builder.is('banned_at', null)
  } else if (!includesActive && includesBanned) {
    builder = builder.not('banned_at', 'is', null)
  }

  const includesOptedIn = emailPreferences.has('opted_in')
  const includesOptedOut = emailPreferences.has('opted_out')

  if (!includesOptedIn && !includesOptedOut) {
    return { users: [] }
  }

  if (includesOptedIn && !includesOptedOut) {
    builder = builder.eq('marketing_updates_opt_in', true)
  } else if (!includesOptedIn && includesOptedOut) {
    builder = builder.eq('marketing_updates_opt_in', false)
  }

  const { data, error } = await builder
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  return { users: data || [] }
})
