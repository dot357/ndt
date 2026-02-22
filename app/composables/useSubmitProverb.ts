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
  const user = useSupabaseUser()
  const { getToken } = useCaptcha()
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
      const captchaToken = await getToken('submit_proverb')
      const response = await $fetch<{ id: string }>('/api/proverbs/submit', {
        method: 'POST',
        body: {
          ...data,
          captchaToken
        }
      })
      return response.id
    } catch (e: any) {
      error.value = e?.data?.message || e.message || 'Failed to submit proverb'
      return null
    } finally {
      loading.value = false
    }
  }

  return { submit, loading, error }
}
