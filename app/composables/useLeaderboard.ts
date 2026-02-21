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
  const client = useSupabaseClient<any>()
  const entries = ref<LeaderboardEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch() {
    loading.value = true
    error.value = null

    try {
      const viewName = `leaderboard_${period.value}`
      const { data, error: fetchError } = await client
        .from(viewName)
        .select('*')

      if (fetchError) throw fetchError
      entries.value = (data || []) as LeaderboardEntry[]
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch leaderboard'
    } finally {
      loading.value = false
    }
  }

  watch(period, () => fetch(), { immediate: true })

  return { entries, loading, error, refresh: fetch }
}
