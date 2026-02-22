interface ProverbDetail {
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
  guess_options: { id: string; option_text: string; is_correct: boolean; sort_order: number }[]
}

function normalizeGuessOptions(
  options: ProverbDetail['guess_options'] | undefined
): ProverbDetail['guess_options'] {
  if (!options?.length) return []

  const bySort = new Map<number, ProverbDetail['guess_options'][number]>()
  for (const option of [...options].sort((a, b) => a.sort_order - b.sort_order)) {
    if (!bySort.has(option.sort_order)) {
      bySort.set(option.sort_order, option)
    }
  }

  return Array.from(bySort.values()).sort((a, b) => a.sort_order - b.sort_order)
}

export function useProverb(id: string | Ref<string>) {
  const proverb = ref<ProverbDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch() {
    const proverbId = unref(id)
    if (!proverbId) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ proverb: ProverbDetail }>(`/api/proverbs/${proverbId}`)
      const normalized = response.proverb as ProverbDetail
      normalized.guess_options = normalizeGuessOptions(normalized.guess_options)
      proverb.value = normalized
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Failed to fetch proverb'
    } finally {
      loading.value = false
    }
  }

  fetch()

  return { proverb, loading, error, refresh: fetch }
}
