interface ProverbSubmission {
  country_code: string
  region: string
  language_name: string
  original_text: string
  literal_text: string
  meaning_text: string
  wrong_options: string[]
}

export function useSubmitProverb() {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function submit(data: ProverbSubmission): Promise<string | null> {
    if (!user.value) {
      error.value = 'You must be signed in to submit a proverb'
      return null
    }

    loading.value = true
    error.value = null

    try {
      // Insert proverb
      const { data: proverb, error: insertError } = await client
        .from('proverbs')
        .insert({
          user_id: user.value.id,
          country_code: data.country_code,
          region: data.region,
          language_name: data.language_name,
          original_text: data.original_text,
          literal_text: data.literal_text,
          meaning_text: data.meaning_text,
          status: 'pending'
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      // Insert guess options (1 correct + 3 wrong)
      const options = [
        { proverb_id: proverb.id, option_text: data.meaning_text, is_correct: true, sort_order: 0 },
        ...data.wrong_options.map((text, i) => ({
          proverb_id: proverb.id,
          option_text: text,
          is_correct: false,
          sort_order: i + 1
        }))
      ]

      const { error: optionsError } = await client
        .from('guess_options')
        .insert(options)

      if (optionsError) throw optionsError

      return proverb.id as string
    } catch (e: any) {
      error.value = e.message || 'Failed to submit proverb'
      return null
    } finally {
      loading.value = false
    }
  }

  return { submit, loading, error }
}
