export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/')
  }

  const { isAdminOrMod, loaded, refresh } = useUserRole()

  if (!loaded.value) {
    await refresh()
  }

  if (!isAdminOrMod.value) {
    return navigateTo('/')
  }
})
