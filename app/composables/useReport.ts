export function useReport(proverbId: string | Ref<string>) {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()

  const hasReported = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getUserId(): string | null {
    return user.value?.id ?? (user.value as any)?.sub ?? null
  }

  async function checkIfReported() {
    const uid = getUserId()
    if (!uid) return

    const pid = unref(proverbId)
    if (!pid) return

    try {
      const { data, error: fetchError } = await client
        .from('reports')
        .select('id')
        .eq('reporter_id', uid)
        .eq('proverb_id', pid)
        .maybeSingle()

      if (fetchError) throw fetchError
      hasReported.value = !!data
    } catch {
      // Non-critical
    }
  }

  async function submitReport(reason: string): Promise<boolean> {
    const uid = getUserId()
    if (!uid) {
      error.value = 'You must be signed in to report'
      return false
    }

    const pid = unref(proverbId)
    if (!pid) return false

    loading.value = true
    error.value = null

    try {
      const { error: insertError } = await client
        .from('reports')
        .insert({
          reporter_id: uid,
          proverb_id: pid,
          reason
        })

      if (insertError) throw insertError

      hasReported.value = true
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to submit report'
      return false
    } finally {
      loading.value = false
    }
  }

  // Check on init if user is logged in
  if (user.value) {
    checkIfReported()
  }

  watch(() => getUserId(), (newId) => {
    if (newId) {
      checkIfReported()
    } else {
      hasReported.value = false
    }
  })

  return {
    hasReported,
    loading,
    error,
    submitReport
  }
}
