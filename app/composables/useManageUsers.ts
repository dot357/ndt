interface ManagedUser {
  id: string
  display_name: string | null
  role: string
  banned_at: string | null
  created_at: string
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
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()

  const users = ref<ManagedUser[]>([])
  const loading = ref(false)
  const search = ref('')

  async function fetchUsers() {
    loading.value = true

    try {
      let query = client
        .from('profiles')
        .select('id, display_name, role, banned_at, created_at')
        .order('created_at', { ascending: false })

      if (search.value.trim()) {
        query = query.ilike('display_name', `%${search.value.trim()}%`)
      }

      const { data, error } = await query
      if (error) throw error

      users.value = (data || []) as ManagedUser[]
    } catch {
      // Non-critical
    } finally {
      loading.value = false
    }
  }

  async function banUser(userId: string): Promise<boolean> {
    try {
      const { error } = await client
        .from('profiles')
        .update({ banned_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      await logAction('ban', 'user', userId)
      await fetchUsers()
      return true
    } catch {
      return false
    }
  }

  async function unbanUser(userId: string): Promise<boolean> {
    try {
      const { error } = await client
        .from('profiles')
        .update({ banned_at: null })
        .eq('id', userId)

      if (error) throw error

      await logAction('unban', 'user', userId)
      await fetchUsers()
      return true
    } catch {
      return false
    }
  }

  async function changeRole(userId: string, newRole: string): Promise<boolean> {
    try {
      const { error } = await client
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      await logAction('role_change', 'user', userId, `Changed to ${newRole}`)
      await fetchUsers()
      return true
    } catch {
      return false
    }
  }

  async function fetchUserProverbs(userId: string): Promise<UserProverb[]> {
    try {
      const { data, error } = await client
        .from('proverbs')
        .select('id, original_text, country_code, language_name, status, vote_count, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as UserProverb[]
    } catch {
      return []
    }
  }

  async function logAction(action: string, targetType: string, targetId: string, note?: string) {
    if (!user.value) return
    await client.from('mod_actions').insert({
      mod_id: user.value.id,
      action,
      target_type: targetType,
      target_id: targetId,
      note: note || null
    })
  }

  fetchUsers()

  return {
    users,
    loading,
    search,
    fetchUsers,
    banUser,
    unbanUser,
    changeRole,
    fetchUserProverbs
  }
}
