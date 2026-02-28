type Role = 'user' | 'moderator' | 'admin'

export function useUserRole() {
  const user = useSupabaseUser()
  const client = useSupabaseClient<any>()

  const role = useState<Role>('user-role', () => 'user')
  const bannedAt = useState<string | null>('user-banned-at', () => null)
  const loaded = useState<boolean>('user-role-loaded', () => false)
  const clientHooksRegistered = useState<boolean>('user-role-client-hooks-registered', () => false)

  const isAdmin = computed(() => role.value === 'admin')
  const isModerator = computed(() => role.value === 'moderator')
  const isAdminOrMod = computed(() => role.value === 'admin' || role.value === 'moderator')
  const isBanned = computed(() => bannedAt.value !== null)

  function getUserId(): string | undefined {
    return user.value?.id ?? (user.value as any)?.sub
  }

  async function resolveUserId(): Promise<string | undefined> {
    const direct = getUserId()
    if (direct) return direct
    if (!process.client) return undefined

    const [{ data: sessionData }, { data: userData }] = await Promise.all([
      client.auth.getSession(),
      client.auth.getUser()
    ])
    return sessionData.session?.user?.id ?? userData.user?.id
  }

  async function fetchRole() {
    const uid = await resolveUserId()
    if (!uid) {
      role.value = 'user'
      bannedAt.value = null
      loaded.value = false
      return
    }

    let didLoad = false
    try {
      // On client, use Supabase directly to avoid SSR cookie/session timing issues on hard refresh.
      if (process.client) {
        const { data, error } = await client
          .from('profiles')
          .select('role, banned_at')
          .eq('id', uid)
          .maybeSingle()

        if (error) throw error

        role.value = (data?.role as Role) || 'user'
        bannedAt.value = data?.banned_at || null
      } else {
        const response = await $fetch<{ role: Role; banned_at: string | null }>('/api/profile/role')
        role.value = response.role || 'user'
        bannedAt.value = response.banned_at || null
      }
      didLoad = true
    } catch (e) {
      console.warn('[useUserRole] Failed to fetch role:', e)
      const hasUser = Boolean(await resolveUserId())
      if (!hasUser) {
        role.value = 'user'
        bannedAt.value = null
      }
      loaded.value = false
      return
    } finally {
      if (didLoad) {
        loaded.value = true
      }
    }
  }

  // Fetch on init if user is logged in and role not yet loaded
  if (getUserId() && !loaded.value) {
    void fetchRole()
  }

  // Re-fetch when user changes
  watch(() => getUserId(), (newId) => {
    if (newId) {
      void fetchRole()
    } else {
      role.value = 'user'
      bannedAt.value = null
      loaded.value = false
    }
  })

  if (process.client && !clientHooksRegistered.value) {
    clientHooksRegistered.value = true

    client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        role.value = 'user'
        bannedAt.value = null
        loaded.value = false
        return
      }

      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        void fetchRole()
      }
    })

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        void fetchRole()
      }
    })
  }

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
