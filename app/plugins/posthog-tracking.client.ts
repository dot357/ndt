import posthog from 'posthog-js'

type ConsentChangedDetail = {
  optedIn: boolean
  userId?: string | null
  email?: string | null
}

export default defineNuxtPlugin({
  name: 'posthog-tracking',
  enforce: 'post',
  setup: () => {
    const runtimeConfig = useRuntimeConfig()
    if (!runtimeConfig.public.posthogPublicKey) return

    const route = useRoute()
    const user = useSupabaseUser()
    const client = useSupabaseClient<any>()
    let lastIdentifiedUserId: string | null = null

    async function syncIdentity() {
      const userValue = user.value as any
      const userId = userValue?.id || userValue?.sub
      const email = userValue?.email as string | undefined

      if (!userId || !email) {
        if (lastIdentifiedUserId) {
          posthog.reset()
          lastIdentifiedUserId = null
        }
        return
      }

      const { data, error } = await client
        .from('profiles')
        .select('marketing_updates_opt_in')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data?.marketing_updates_opt_in) {
        if (lastIdentifiedUserId) {
          posthog.reset()
          lastIdentifiedUserId = null
        }
        return
      }

      posthog.identify(userId, {
        email,
        marketing_updates_opt_in: true
      })
      lastIdentifiedUserId = userId
    }

    function capturePageChange(path: string) {
      posthog.capture('ndt_page_view', {
        path,
        route_name: route.name?.toString() || null
      })
    }

    watch(
      () => route.fullPath,
      (path) => {
        capturePageChange(path)
      },
      { immediate: true }
    )

    watch(
      () => (user.value as any)?.id || (user.value as any)?.sub || null,
      () => {
        void syncIdentity()
      },
      { immediate: true }
    )

    if (import.meta.client) {
      window.addEventListener('ndt:marketing-consent-changed', (event: Event) => {
        const detail = (event as CustomEvent<ConsentChangedDetail>).detail
        if (!detail) return

        if (detail.optedIn && detail.userId && detail.email) {
          posthog.identify(detail.userId, {
            email: detail.email,
            marketing_updates_opt_in: true
          })
          lastIdentifiedUserId = detail.userId
          return
        }

        posthog.reset()
        lastIdentifiedUserId = null
      })
    }
  }
})
