interface ReactionCount {
  emoji: string
  count: number
}

export function useReactions(proverbId: string | Ref<string>) {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()

  const counts = ref<ReactionCount[]>([])
  const userEmoji = ref<string | null>(null)
  const totalCount = ref(0)
  const loading = ref(false)

  async function fetchCounts() {
    const pid = unref(proverbId)
    if (!pid) return

    try {
      const { data, error } = await client
        .from('reactions')
        .select('emoji')
        .eq('proverb_id', pid)

      if (error) throw error

      const emojiMap = new Map<string, number>()
      for (const row of data || []) {
        emojiMap.set(row.emoji, (emojiMap.get(row.emoji) || 0) + 1)
      }

      counts.value = Array.from(emojiMap.entries()).map(([emoji, count]) => ({
        emoji,
        count
      }))
      totalCount.value = data?.length || 0
    } catch {
      // Non-critical
    }
  }

  async function fetchUserReaction() {
    if (!user.value) {
      userEmoji.value = null
      return
    }

    const pid = unref(proverbId)
    if (!pid) return

    try {
      const { data, error } = await client
        .from('reactions')
        .select('emoji')
        .eq('proverb_id', pid)
        .eq('user_id', user.value.id)
        .maybeSingle()

      if (error) throw error
      userEmoji.value = data?.emoji || null
    } catch {
      userEmoji.value = null
    }
  }

  async function fetchReactions() {
    await Promise.all([fetchCounts(), fetchUserReaction()])
  }

  async function toggleReaction(emoji: string) {
    if (!user.value || loading.value) return

    const pid = unref(proverbId)
    loading.value = true

    const previousEmoji = userEmoji.value
    const isSameEmoji = previousEmoji === emoji

    // Optimistic update
    if (isSameEmoji) {
      userEmoji.value = null
      decrementCount(emoji)
      totalCount.value--
    } else {
      if (previousEmoji) {
        decrementCount(previousEmoji)
      } else {
        totalCount.value++
      }
      userEmoji.value = emoji
      incrementCount(emoji)
    }

    try {
      if (isSameEmoji) {
        const { error } = await client
          .from('reactions')
          .delete()
          .eq('proverb_id', pid)
          .eq('user_id', user.value.id)
        if (error) throw error
      } else {
        const { error } = await client
          .from('reactions')
          .upsert(
            { proverb_id: pid, user_id: user.value.id, emoji },
            { onConflict: 'user_id,proverb_id' }
          )
        if (error) throw error
      }
    } catch {
      await fetchReactions()
    } finally {
      loading.value = false
    }
  }

  function incrementCount(emoji: string) {
    const existing = counts.value.find(c => c.emoji === emoji)
    if (existing) {
      existing.count++
    } else {
      counts.value = [...counts.value, { emoji, count: 1 }]
    }
  }

  function decrementCount(emoji: string) {
    const existing = counts.value.find(c => c.emoji === emoji)
    if (existing) {
      existing.count--
      if (existing.count <= 0) {
        counts.value = counts.value.filter(c => c.emoji !== emoji)
      }
    }
  }

  function getCount(emoji: string): number {
    return counts.value.find(c => c.emoji === emoji)?.count || 0
  }

  function hasReacted(emoji: string): boolean {
    return userEmoji.value === emoji
  }

  // Fetch counts immediately, user reaction when auth is ready
  fetchCounts()
  if (user.value) {
    fetchUserReaction()
  }
  watch(() => user.value?.id, (newId) => {
    if (newId) {
      fetchUserReaction()
    } else {
      userEmoji.value = null
    }
  })

  return {
    counts,
    userEmoji,
    totalCount,
    loading,
    toggleReaction,
    getCount,
    hasReacted,
    refresh: fetchReactions
  }
}
