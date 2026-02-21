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

  async function fetchNext() {
    loadingNext.value = true
    error.value = null
    result.value = null
    selectedOption.value = null

    try {
      // Get IDs the user has already guessed
      let guessedIds: string[] = []
      if (user.value) {
        const { data: guessed } = await client
          .from('guesses')
          .select('proverb_id')
          .eq('user_id', user.value.id)

        guessedIds = (guessed || []).map((g: any) => g.proverb_id)
      }

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

  async function submitGuess(optionId: string) {
    if (!proverb.value || loading.value) return

    loading.value = true
    selectedOption.value = optionId

    const option = options.value.find(o => o.id === optionId)
    const isCorrect = option?.is_correct ?? false
    result.value = isCorrect ? 'correct' : 'wrong'

    sessionScore.value.total++
    if (isCorrect) sessionScore.value.correct++

    // Store guess if authenticated
    if (user.value) {
      try {
        await client.from('guesses').insert({
          user_id: user.value.id,
          proverb_id: proverb.value.id,
          selected_option: optionId,
          is_correct: isCorrect
        })
      } catch {
        // Non-critical — don't block the UI
      }
    }

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
    submitGuess,
    nextProverb: fetchNext
  }
}
