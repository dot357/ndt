interface LeaderboardEntry {
  id: string
  original_text: string
  literal_text: string
  country_code: string
  language_name: string
  vote_count: number
  created_at: string
  author_name: string | null
}

export function useLeaderboard(period: Ref<'daily' | 'weekly' | 'alltime'>) {
  const entries = ref<LeaderboardEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ entries: LeaderboardEntry[] }>('/api/leaderboard', {
        query: { period: period.value }
      })
      entries.value = response.entries || []
    } catch (e: any) {
      error.value = e?.data?.message || e.message || 'Failed to fetch leaderboard'
    } finally {
      loading.value = false
    }
  }

  watch(period, () => fetch(), { immediate: true })

  return { entries, loading, error, refresh: fetch }
}
