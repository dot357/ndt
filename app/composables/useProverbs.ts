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
      const regionVal = options.region?.value
      const sortVal = options.sort?.value ?? 'trending'
      const response = await $fetch<{ proverbs: ProverbRow[] }>('/api/proverbs/feed', {
        query: {
          region: regionVal || 'All',
          sort: sortVal,
          page: page.value,
          limit
        }
      })

      const data = response.proverbs || []
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
      error.value = e?.data?.message || e.message || 'Failed to fetch proverbs'
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
