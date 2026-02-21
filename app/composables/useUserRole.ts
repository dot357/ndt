type Role = 'user' | 'moderator' | 'admin'

export function useUserRole() {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()

  const role = useState<Role>('user-role', () => 'user')
  const bannedAt = useState<string | null>('user-banned-at', () => null)
  const loaded = useState<boolean>('user-role-loaded', () => false)

  const isAdmin = computed(() => role.value === 'admin')
  const isModerator = computed(() => role.value === 'moderator')
  const isAdminOrMod = computed(() => role.value === 'admin' || role.value === 'moderator')
  const isBanned = computed(() => bannedAt.value !== null)

  function getUserId(): string | undefined {
    return user.value?.id ?? (user.value as any)?.sub
  }

  async function fetchRole() {
    const uid = getUserId()
    if (!uid) {
      role.value = 'user'
      bannedAt.value = null
      loaded.value = false
      return
    }

    try {
      const { data, error } = await client
        .from('profiles')
        .select('role, banned_at')
        .eq('id', uid)
        .single()

      if (error) throw error

      role.value = (data?.role as Role) || 'user'
      bannedAt.value = data?.banned_at || null
    } catch (e) {
      console.warn('[useUserRole] Failed to fetch role:', e)
      role.value = 'user'
      bannedAt.value = null
    } finally {
      loaded.value = true
    }
  }

  // Fetch on init if user is logged in and role not yet loaded
  if (getUserId() && !loaded.value) {
    fetchRole()
  }

  // Re-fetch when user changes
  watch(() => getUserId(), (newId) => {
    if (newId) {
      fetchRole()
    } else {
      role.value = 'user'
      bannedAt.value = null
      loaded.value = false
    }
  })

  return {
    role,
    isAdmin,
    isModerator,
    isAdminOrMod,
    isBanned,
    loaded,
    refresh: fetchRole
  }
}
