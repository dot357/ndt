interface GuessOption {
  id: string
  option_text: string
  is_correct: boolean
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

const ANON_GUESSES_KEY = 'ndt_guessed_proverbs'

function getAnonGuessedIds(): string[] {
  if (import.meta.server) return []
  try {
    return JSON.parse(localStorage.getItem(ANON_GUESSES_KEY) || '[]')
  } catch {
    return []
  }
}

function addAnonGuessedId(id: string) {
  const ids = getAnonGuessedIds()
  if (!ids.includes(id)) {
    ids.push(id)
    localStorage.setItem(ANON_GUESSES_KEY, JSON.stringify(ids))
  }
}

export function useGuess() {
  const client = useSupabaseClient<any>()

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

  async function getSessionUserId(): Promise<string | null> {
    const { data: { session } } = await client.auth.getSession()
    return session?.user?.id ?? null
  }

  async function fetchNext() {
    loadingNext.value = true
    error.value = null
    result.value = null
    selectedOption.value = null
    distribution.value = []

    try {
      const userId = await getSessionUserId()

      // Get IDs the user has already guessed
      let guessedIds: string[] = []
      if (userId) {
        const { data: guessed } = await client
          .from('guesses')
          .select('proverb_id')
          .eq('user_id', userId)

        guessedIds = (guessed || []).map((g: any) => g.proverb_id)
      } else {
        guessedIds = getAnonGuessedIds()
      }

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
      options.value = [...random.guess_options].sort(() => Math.random() - 0.5)
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
    if (!proverb.value || loading.value) return

    loading.value = true
    selectedOption.value = optionId

    const option = options.value.find(o => o.id === optionId)
    const isCorrect = option?.is_correct ?? false
    result.value = isCorrect ? 'correct' : 'wrong'

    sessionScore.value.total++
    if (isCorrect) sessionScore.value.correct++

    // Store guess
    const userId = await getSessionUserId()
    if (userId) {
      // user_id defaults to auth.uid() in DB, no need to pass it
      const { error: insertError } = await client.from('guesses').insert({
        proverb_id: proverb.value.id,
        selected_option: optionId,
        is_correct: isCorrect
      })
      if (insertError) {
        console.error('Failed to save guess:', insertError.message)
      }
    } else {
      addAnonGuessedId(proverb.value.id)
    }

    answeredCount.value++

    // Fetch distribution after guess
    await fetchDistribution(proverb.value.id)

    loading.value = false
  }

  // Load first proverb
  fetchNext()

  return {
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
