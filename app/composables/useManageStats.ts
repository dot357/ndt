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
      const response = await $fetch<{ stats: DashboardStats; recentActions: ModAction[] }>('/api/manage/stats')
      stats.value = response.stats
      recentActions.value = response.recentActions || []
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
