export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient<any>()
  const roleState = useState<'user' | 'moderator' | 'admin'>('user-role', () => 'user')
  const loadedState = useState<boolean>('user-role-loaded', () => false)

  // On server, user ID is in `sub` (JWT payload); on client it's `id`
  let uid = user.value?.id ?? (user.value as any)?.sub

  // Avoid false redirects on SSR hard refresh when auth state has not hydrated yet.
  if (process.server && !uid) {
    return
  }

  // On client, session can exist before useSupabaseUser() is hydrated.
  if (process.client && !uid) {
    const [{ data: sessionData }, { data: userData }] = await Promise.all([
      client.auth.getSession(),
      client.auth.getUser()
    ])
    uid = sessionData.session?.user?.id ?? userData.user?.id
  }

  if (!uid) {
    // Auth may still be restoring on client after hard refresh; avoid false redirects.
    if (process.client) {
      loadedState.value = false
      return
    }
    roleState.value = 'user'
    loadedState.value = false
    return navigateTo('/')
  }

  const { data, error } = await client
    .from('profiles')
    .select('role')
    .eq('id', uid)
    .maybeSingle()

  if (error) {
    // Keep current UI state if role lookup temporarily fails on client.
    if (process.client) {
      loadedState.value = false
      return
    }
    roleState.value = 'user'
    loadedState.value = false
    return navigateTo('/')
  }

  const role = data?.role
  roleState.value = role === 'admin' || role === 'moderator' ? role : 'user'
  loadedState.value = true

  if (roleState.value !== 'admin' && roleState.value !== 'moderator') {
    return navigateTo('/')
  }
})
