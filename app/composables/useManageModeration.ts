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
  const proverbs = ref<PendingProverb[]>([])
  const loading = ref(false)
  const selected = ref<Set<string>>(new Set())

  async function fetchPending() {
    loading.value = true

    try {
      const response = await $fetch<{ proverbs: PendingProverb[] }>('/api/manage/moderation/pending')
      proverbs.value = response.proverbs || []
      selected.value = new Set()
    } catch {
      // Non-critical
    } finally {
      loading.value = false
    }
  }

  async function approveProverb(proverbId: string, note?: string): Promise<boolean> {
    try {
      await $fetch(`/api/manage/moderation/${proverbId}/approve`, {
        method: 'POST',
        body: { note: note || null }
      })
      proverbs.value = proverbs.value.filter(p => p.id !== proverbId)
      selected.value.delete(proverbId)
      return true
    } catch {
      return false
    }
  }

  async function rejectProverb(proverbId: string, note?: string): Promise<boolean> {
    try {
      await $fetch(`/api/manage/moderation/${proverbId}/reject`, {
        method: 'POST',
        body: { note: note || null }
      })
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
