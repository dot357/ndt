interface DashboardStats {
  totalUsers: number
  totalProverbs: number
  publishedProverbs: number
  pendingProverbs: number
  rejectedProverbs: number
  totalReactions: number
  openReports: number
}

interface ModAction {
  id: string
  action: string
  target_type: string
  target_id: string
  note: string | null
  created_at: string
  profiles: { display_name: string | null } | null
}

export function useManageStats() {
  const client = useSupabaseClient<any>()

  const stats = ref<DashboardStats>({
    totalUsers: 0,
    totalProverbs: 0,
    publishedProverbs: 0,
    pendingProverbs: 0,
    rejectedProverbs: 0,
    totalReactions: 0,
    openReports: 0
  })
  const recentActions = ref<ModAction[]>([])
  const loading = ref(false)

  async function fetchStats() {
    loading.value = true

    try {
      const [users, proverbs, reactions, reports, actions] = await Promise.all([
        client.from('profiles').select('id', { count: 'exact', head: true }),
        client.from('proverbs').select('status'),
        client.from('reactions').select('id', { count: 'exact', head: true }),
        client.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        client.from('mod_actions').select('id, action, target_type, target_id, note, created_at, profiles:mod_id(display_name)').order('created_at', { ascending: false }).limit(10)
      ])

      stats.value.totalUsers = users.count || 0
      stats.value.totalReactions = reactions.count || 0
      stats.value.openReports = reports.count || 0

      const proverbData = proverbs.data || []
      stats.value.totalProverbs = proverbData.length
      stats.value.publishedProverbs = proverbData.filter((p: any) => p.status === 'published').length
      stats.value.pendingProverbs = proverbData.filter((p: any) => p.status === 'pending').length
      stats.value.rejectedProverbs = proverbData.filter((p: any) => p.status === 'rejected').length

      recentActions.value = (actions.data || []) as unknown as ModAction[]
    } catch {
      // Non-critical
    } finally {
      loading.value = false
    }
  }

  fetchStats()

  return {
    stats,
    recentActions,
    loading,
    refresh: fetchStats
  }
}
