interface RawReaction {
  emoji: string
  user_id: string
}

interface ReactionCount {
  emoji: string
  count: number
}

interface UseReactionsOptions {
  initialReactions?: RawReaction[]
}

export function useReactions(proverbId: string | Ref<string>, options: UseReactionsOptions = {}) {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()

  const rawReactions = ref<RawReaction[]>(options.initialReactions ?? [])
  const loading = ref(false)
  let fetchId = 0

  function getUserId(): string | null {
    return user.value?.id ?? (user.value as any)?.sub ?? null
  }

  // Derived state — automatically reacts to user auth changes
  const counts = computed<ReactionCount[]>(() => {
    const emojiMap = new Map<string, number>()
    for (const row of rawReactions.value) {
      emojiMap.set(row.emoji, (emojiMap.get(row.emoji) || 0) + 1)
    }
    return Array.from(emojiMap.entries()).map(([emoji, count]) => ({ emoji, count }))
  })

  const userEmoji = computed(() => {
    const uid = getUserId()
    if (!uid) return null
    return rawReactions.value.find(r => r.user_id === uid)?.emoji ?? null
  })

  const totalCount = computed(() => rawReactions.value.length)

  async function fetchReactions() {
    const pid = unref(proverbId)
    if (!pid) return

    const id = ++fetchId

    try {
      const { data, error } = await client
        .from('reactions')
        .select('emoji, user_id')
        .eq('proverb_id', pid)

      if (error) throw error
      if (id !== fetchId) return // discard stale response

      rawReactions.value = data || []
    } catch {
      // Non-critical
    }
  }

  async function toggleReaction(emoji: string) {
    if (!user.value || loading.value) return

    const pid = unref(proverbId)
    const uid = getUserId()
    if (!uid) return
    loading.value = true

    const isSameEmoji = userEmoji.value === emoji
    const previousRaw = [...rawReactions.value]

    // Optimistic update on raw data — computed values update automatically
    if (isSameEmoji) {
      rawReactions.value = rawReactions.value.filter(r => r.user_id !== uid)
    } else {
      rawReactions.value = [
        ...rawReactions.value.filter(r => r.user_id !== uid),
        { emoji, user_id: uid }
      ]
    }

    try {
      if (isSameEmoji) {
        const { error } = await client
          .from('reactions')
          .delete()
          .eq('proverb_id', pid)
          .eq('user_id', uid)
        if (error) throw error
      } else {
        const { error } = await client
          .from('reactions')
          .upsert(
            { proverb_id: pid, user_id: uid, emoji },
            { onConflict: 'user_id,proverb_id' }
          )
        if (error) throw error
      }
    } catch {
      rawReactions.value = previousRaw
    } finally {
      loading.value = false
    }
  }

  function getCount(emoji: string): number {
    return counts.value.find(c => c.emoji === emoji)?.count || 0
  }

  function hasReacted(emoji: string): boolean {
    return userEmoji.value === emoji
  }

  // Only fetch if no initial data was provided
  if (!options.initialReactions) {
    fetchReactions()
    onMounted(() => fetchReactions())
  }

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
