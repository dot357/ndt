interface GuessOption {
  id: string
  option_text: string
  is_correct: boolean
  sort_order?: number
}

interface GuessProverb {
  id: string
  original_text: string
  literal_text: string
  country_code: string
  language_name: string
  guess_options: GuessOption[]
}

interface DistributionItem {
  option_id: string
  option_text: string
  is_correct: boolean
  pick_count: number
  pick_percentage: number
}

export function useGuess() {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()

  const proverb = ref<GuessProverb | null>(null)
  const options = ref<GuessOption[]>([])
  const selectedOption = ref<string | null>(null)
  const result = ref<'correct' | 'wrong' | null>(null)
  const loading = ref(false)
  const loadingNext = ref(false)
  const error = ref<string | null>(null)
  const sessionScore = ref({ correct: 0, total: 0 })
  const noMore = ref(false)
  const distribution = ref<DistributionItem[]>([])
  const totalProverbs = ref(0)
  const answeredCount = ref(0)
  const isAuthenticated = computed(() => !!user.value)

  function normalizeGuessOptions(options: GuessOption[]): GuessOption[] {
    if (!options.length) return []

    const withSort = options.filter(o => typeof o.sort_order === 'number')
    if (withSort.length === options.length) {
      const bySort = new Map<number, GuessOption>()
      for (const option of [...withSort].sort((a, b) => (a.sort_order as number) - (b.sort_order as number))) {
        if (!bySort.has(option.sort_order as number)) {
          bySort.set(option.sort_order as number, option)
        }
      }
      return Array.from(bySort.values())
    }

    const byId = new Map<string, GuessOption>()
    for (const option of options) {
      if (!byId.has(option.id)) byId.set(option.id, option)
    }
    return Array.from(byId.values())
  }

  async function fetchNext() {
    const userId = user.value?.id
    if (!userId) {
      proverb.value = null
      options.value = []
      distribution.value = []
      selectedOption.value = null
      result.value = null
      noMore.value = false
      loadingNext.value = false
      answeredCount.value = 0
      return
    }

    loadingNext.value = true
    error.value = null
    result.value = null
    selectedOption.value = null
    distribution.value = []

    try {
      // Join proverbs with guesses to get this user's already answered proverb IDs.
      const { data: guessedRows, error: guessedError } = await client
        .from('proverbs')
        .select('id, guesses!inner(user_id)')
        .eq('status', 'published')
        .eq('guesses.user_id', userId)

      if (guessedError) throw guessedError

      const guessedIds = (guessedRows || []).map((row: any) => row.id)
      answeredCount.value = guessedIds.length

      // Get total published proverbs count (with guess options)
      const { count } = await client
        .from('proverbs')
        .select('id, guess_options!inner(id)', { count: 'exact', head: true })
        .eq('status', 'published')

      totalProverbs.value = count || 0

      // Fetch a random proverb not yet guessed
      let query = client
        .from('proverbs')
        .select('id, original_text, literal_text, country_code, language_name, guess_options(*)')
        .eq('status', 'published')

      if (guessedIds.length > 0) {
        query = query.not('id', 'in', `(${guessedIds.join(',')})`)
      }

      const { data, error: fetchError } = await query.limit(10)

      if (fetchError) throw fetchError

      if (!data || data.length === 0) {
        noMore.value = true
        proverb.value = null
        return
      }

      // Pick a random one
      const random = data[Math.floor(Math.random() * data.length)] as unknown as GuessProverb
      proverb.value = random

      // Shuffle options
      options.value = normalizeGuessOptions(random.guess_options).sort(() => Math.random() - 0.5)
    } catch (e: any) {
      error.value = e.message || 'Failed to load proverb'
    } finally {
      loadingNext.value = false
    }
  }

  async function fetchDistribution(proverbId: string) {
    try {
      const { data } = await client.rpc('get_answer_distribution', {
        p_proverb_id: proverbId
      })
      distribution.value = (data || []) as DistributionItem[]
    } catch {
      // Non-critical
    }
  }

  async function submitGuess(optionId: string) {
    if (!proverb.value || loading.value || !user.value?.id) return

    loading.value = true
    selectedOption.value = optionId

    const option = options.value.find(o => o.id === optionId)
    const isCorrect = option?.is_correct ?? false
    result.value = isCorrect ? 'correct' : 'wrong'

    sessionScore.value.total++
    if (isCorrect) sessionScore.value.correct++

    // Store guess
    const userId = user.value.id
    const { error: insertError } = await client.from('guesses').insert({
      proverb_id: proverb.value.id,
      selected_option: optionId,
      is_correct: isCorrect
    })
    if (insertError) {
      console.error('Failed to save guess:', insertError.message)
      const { data: existing } = await client
        .from('guesses')
        .select('selected_option, is_correct')
        .eq('proverb_id', proverb.value.id)
        .eq('user_id', userId)
        .maybeSingle()

      if (existing?.selected_option) {
        selectedOption.value = existing.selected_option
        result.value = existing.is_correct ? 'correct' : 'wrong'
      }
    }

    answeredCount.value++

    // Fetch distribution after guess
    await fetchDistribution(proverb.value.id)

    loading.value = false
  }

  watch(
    () => user.value?.id,
    async (nextUserId) => {
      if (nextUserId) {
        await fetchNext()
        return
      }

      proverb.value = null
      options.value = []
      selectedOption.value = null
      result.value = null
      distribution.value = []
      answeredCount.value = 0
      noMore.value = false
      error.value = null
    },
    { immediate: true }
  )

  return {
    isAuthenticated,
    proverb,
    options,
    selectedOption,
    result,
    loading,
    loadingNext,
    error,
    sessionScore,
    noMore,
    distribution,
    totalProverbs,
    answeredCount,
    submitGuess,
    nextProverb: fetchNext
  }
}
