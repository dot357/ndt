import { createError, defineEventHandler } from 'h3'
import { requireAdminOrMod } from '../../utils/auth'
import { enforceRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAdminOrMod(event)

  await enforceRateLimit(event, {
    name: 'manage-stats',
    max: 60,
    windowMs: 60_000,
    key: user.id
  })

  const [users, proverbs, reactions, reports, emailOptIns, actions] = await Promise.all([
    client.from('profiles').select('id', { count: 'exact', head: true }),
    client.from('proverbs').select('status'),
    client.from('reactions').select('id', { count: 'exact', head: true }),
    client.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    client.from('profiles').select('id', { count: 'exact', head: true }).eq('marketing_updates_opt_in', true),
    client
      .from('mod_actions')
      .select('id, action, target_type, target_id, note, created_at, profiles:mod_id(display_name)')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  if (users.error || proverbs.error || reactions.error || reports.error || actions.error || emailOptIns.error) {
    const message = users.error?.message || proverbs.error?.message || reactions.error?.message || reports.error?.message || actions.error?.message || emailOptIns.error?.message || 'Failed to fetch stats.'
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message })
  }

  const proverbData = proverbs.data || []

  return {
    stats: {
      totalUsers: users.count || 0,
      totalProverbs: proverbData.length,
      publishedProverbs: proverbData.filter((p: any) => p.status === 'published').length,
      pendingProverbs: proverbData.filter((p: any) => p.status === 'pending').length,
      rejectedProverbs: proverbData.filter((p: any) => p.status === 'rejected').length,
      totalReactions: reactions.count || 0,
      openReports: reports.count || 0,
      emailOptInUsers: emailOptIns.count || 0
    },
    recentActions: actions.data || []
  }
})
