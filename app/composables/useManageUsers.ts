interface ManagedUser {
  id: string
  display_name: string | null
  role: string
  banned_at: string | null
  created_at: string
  marketing_updates_opt_in: boolean
}

interface UserProverb {
  id: string
  original_text: string
  country_code: string
  language_name: string
  status: string
  vote_count: number
  created_at: string
}

export function useManageUsers() {
  const users = ref<ManagedUser[]>([])
  const loading = ref(false)
  const search = ref('')
  const statusFilter = ref<Array<'active' | 'banned'>>(['active'])
  const emailFilter = ref<Array<'opted_in' | 'opted_out'>>(['opted_in', 'opted_out'])

  async function fetchUsers() {
    loading.value = true

    try {
      if (statusFilter.value.length === 0) {
        users.value = []
        return
      }

      const response = await $fetch<{ users: ManagedUser[] }>('/api/manage/users', {
        query: {
          search: search.value.trim(),
          status: statusFilter.value.join(','),
          email: emailFilter.value.join(',')
        }
      })
      users.value = response.users || []
    } catch {
      // Non-critical
    } finally {
      loading.value = false
    }
  }

  async function banUser(userId: string): Promise<boolean> {
    try {
      await $fetch(`/api/manage/users/${userId}/ban`, { method: 'POST' })
      await fetchUsers()
      return true
    } catch {
      return false
    }
  }

  async function unbanUser(userId: string): Promise<boolean> {
    try {
      await $fetch(`/api/manage/users/${userId}/unban`, { method: 'POST' })
      await fetchUsers()
      return true
    } catch {
      return false
    }
  }

  async function changeRole(userId: string, newRole: string): Promise<boolean> {
    try {
      await $fetch(`/api/manage/users/${userId}/role`, {
        method: 'POST',
        body: { role: newRole }
      })
      await fetchUsers()
      return true
    } catch {
      return false
    }
  }

  async function fetchUserProverbs(
    userId: string,
    opts: { page?: number; limit?: number; language?: string } = {}
  ): Promise<{ data: UserProverb[]; total: number }> {
    const page = opts.page ?? 0
    const limit = opts.limit ?? 10

    try {
      const response = await $fetch<{ proverbs: UserProverb[]; total: number }>('/api/manage/proverbs', {
        query: {
          userId,
          page,
          limit,
          language: opts.language || 'all'
        }
      })

      return { data: response.proverbs || [], total: response.total || 0 }
    } catch {
      return { data: [], total: 0 }
    }
  }

  async function fetchUserLanguages(userId: string): Promise<{ language: string; count: number }[]> {
    try {
      const response = await $fetch<{ languages: { language: string; count: number }[] }>('/api/manage/proverbs/languages', {
        query: { userId }
      })
      return response.languages || []
    } catch {
      return []
    }
  }

  return {
    users,
    loading,
    search,
    statusFilter,
    emailFilter,
    fetchUsers,
    banUser,
    unbanUser,
    changeRole,
    fetchUserProverbs,
    fetchUserLanguages
  }
}
