import posthog from 'posthog-js'
import type { ConfigDefaults } from 'posthog-js'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  if (!runtimeConfig.public.posthogPublicKey) {
    return
  }

  const posthogClient = posthog.init(runtimeConfig.public.posthogPublicKey, {
    api_host: runtimeConfig.public.posthogHost,
    defaults: runtimeConfig.public.posthogDefaults as ConfigDefaults,
    loaded: (instance) => {
      if (import.meta.env.DEV) {
        instance.debug()
      }
    }
  })

  return {
    provide: {
      posthog: () => posthogClient
    }
  }
})
