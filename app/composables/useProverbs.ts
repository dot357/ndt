interface ProverbRow {
  id: string
  user_id: string
  country_code: string
  region: string | null
  language_name: string
  original_text: string
  literal_text: string
  meaning_text: string
  vote_count: number
  created_at: string
  profiles: { display_name: string | null } | null
  reactions: { emoji: string; user_id: string }[]
}

interface UseProverbsOptions {
  region?: Ref<string>
  sort?: Ref<'trending' | 'newest'>
  limit?: number
}

export function useProverbs(options: UseProverbsOptions = {}) {
  const client = useSupabaseClient<any>()
  const proverbs = ref<ProverbRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const hasMore = ref(true)
  const limit = options.limit ?? 12

  async function fetch(reset = false) {
    if (reset) {
      page.value = 0
      hasMore.value = true
      proverbs.value = []
    }

    loading.value = true
    error.value = null

    try {
      let query = client
        .from('proverbs')
        .select('*, profiles(display_name), reactions(emoji, user_id)')
        .eq('status', 'published')

      const regionVal = options.region?.value
      if (regionVal && regionVal !== 'All') {
        query = query.eq('region', regionVal)
      }

      const sortVal = options.sort?.value ?? 'trending'
      if (sortVal === 'trending') {
        query = query.order('vote_count', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      query = query.range(page.value * limit, (page.value + 1) * limit - 1)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      if (data) {
        if (reset) {
          proverbs.value = data as ProverbRow[]
        } else {
          proverbs.value = [...proverbs.value, ...data as ProverbRow[]]
        }
        hasMore.value = data.length === limit
        page.value++
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch proverbs'
    } finally {
      loading.value = false
    }
  }

  function loadMore() {
    if (!loading.value && hasMore.value) {
      fetch()
    }
  }

  // Watch for filter changes
  if (options.region) {
    watch(options.region, () => fetch(true))
  }
  if (options.sort) {
    watch(options.sort, () => fetch(true))
  }

  // Initial fetch
  fetch(true)

  return { proverbs, loading, error, hasMore, loadMore, refresh: () => fetch(true) }
}
