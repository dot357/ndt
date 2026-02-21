export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  // On server, user ID is in `sub` (JWT payload); on client it's `id`
  const uid = user.value?.id ?? (user.value as any)?.sub
  if (!uid) {
    return navigateTo('/')
  }

  const { isAdminOrMod, refresh } = useUserRole()

  await refresh()

  if (!isAdminOrMod.value) {
    return navigateTo('/')
  }
})
