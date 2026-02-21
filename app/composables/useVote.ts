export function useVote(proverbId: string | Ref<string>, initialCount = 0) {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()
  const hasVoted = ref(false)
  const voteCount = ref(initialCount)
  const loading = ref(false)

  async function checkVote() {
    if (!user.value) return
    const pid = unref(proverbId)

    const { data } = await client
      .from('votes')
      .select('id')
      .eq('user_id', user.value.id)
      .eq('proverb_id', pid)
      .maybeSingle()

    hasVoted.value = !!data
  }

  async function toggleVote() {
    if (!user.value) return
    const pid = unref(proverbId)

    loading.value = true

    // Optimistic update
    const wasVoted = hasVoted.value
    hasVoted.value = !wasVoted
    voteCount.value += wasVoted ? -1 : 1

    try {
      if (wasVoted) {
        const { error } = await client
          .from('votes')
          .delete()
          .eq('user_id', user.value.id)
          .eq('proverb_id', pid)
        if (error) throw error
      } else {
        const { error } = await client
          .from('votes')
          .insert({ user_id: user.value.id, proverb_id: pid })
        if (error) throw error
      }
    } catch {
      // Revert on error
      hasVoted.value = wasVoted
      voteCount.value += wasVoted ? 1 : -1
    } finally {
      loading.value = false
    }
  }

  // Check initial vote status
  watch(() => user.value, () => checkVote(), { immediate: true })

  return { hasVoted, voteCount, toggleVote, loading }
}
