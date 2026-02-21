interface PendingProverb {
  id: string
  original_text: string
  literal_text: string
  meaning_text: string
  country_code: string
  language_name: string
  status: string
  created_at: string
  profiles: { display_name: string | null } | null
}

export function useManageModeration() {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()

  const proverbs = ref<PendingProverb[]>([])
  const loading = ref(false)
  const selected = ref<Set<string>>(new Set())

  function getUserId(): string | null {
    return user.value?.id ?? (user.value as any)?.sub ?? null
  }

  async function fetchPending() {
    loading.value = true

    try {
      const { data, error } = await client
        .from('proverbs')
        .select('id, original_text, literal_text, meaning_text, country_code, language_name, status, created_at, profiles:user_id(display_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) throw error
      proverbs.value = (data || []) as unknown as PendingProverb[]
      selected.value = new Set()
    } catch {
      // Non-critical
    } finally {
      loading.value = false
    }
  }

  async function approveProverb(proverbId: string, note?: string): Promise<boolean> {
    try {
      const { error } = await client
        .from('proverbs')
        .update({ status: 'published' })
        .eq('id', proverbId)

      if (error) throw error

      await logAction('approve', 'proverb', proverbId, note)
      proverbs.value = proverbs.value.filter(p => p.id !== proverbId)
      selected.value.delete(proverbId)
      return true
    } catch {
      return false
    }
  }

  async function rejectProverb(proverbId: string, note?: string): Promise<boolean> {
    try {
      const { error } = await client
        .from('proverbs')
        .update({ status: 'rejected' })
        .eq('id', proverbId)

      if (error) throw error

      await logAction('reject', 'proverb', proverbId, note)
      proverbs.value = proverbs.value.filter(p => p.id !== proverbId)
      selected.value.delete(proverbId)
      return true
    } catch {
      return false
    }
  }

  async function bulkApprove(): Promise<number> {
    let count = 0
    for (const id of selected.value) {
      if (await approveProverb(id)) count++
    }
    return count
  }

  async function bulkReject(): Promise<number> {
    let count = 0
    for (const id of selected.value) {
      if (await rejectProverb(id)) count++
    }
    return count
  }

  function toggleSelect(id: string) {
    if (selected.value.has(id)) {
      selected.value.delete(id)
    } else {
      selected.value.add(id)
    }
    // Trigger reactivity
    selected.value = new Set(selected.value)
  }

  function toggleSelectAll() {
    if (selected.value.size === proverbs.value.length) {
      selected.value = new Set()
    } else {
      selected.value = new Set(proverbs.value.map(p => p.id))
    }
  }

  async function logAction(action: string, targetType: string, targetId: string, note?: string) {
    const uid = getUserId()
    if (!uid) return
    await client.from('mod_actions').insert({
      mod_id: uid,
      action,
      target_type: targetType,
      target_id: targetId,
      note: note || null
    })
  }

  fetchPending()

  return {
    proverbs,
    loading,
    selected,
    fetchPending,
    approveProverb,
    rejectProverb,
    bulkApprove,
    bulkReject,
    toggleSelect,
    toggleSelectAll
  }
}
