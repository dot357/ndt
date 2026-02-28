import posthog from 'posthog-js'
import type { ConfigDefaults } from 'posthog-js'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const consentStorageKey = 'ndt:analytics-consent'

  if (!runtimeConfig.public.posthogPublicKey) {
    return
  }

  function applyConsent(instance: {
    opt_in_capturing: (options?: { captureEventName?: string | null | false }) => void
    opt_out_capturing: () => void
  }) {
    if (!import.meta.client) return
    const consent = localStorage.getItem(consentStorageKey)
    if (consent === 'granted') {
      instance.opt_in_capturing({ captureEventName: false })
      return
    }
    instance.opt_out_capturing()
  }

  const posthogClient = posthog.init(runtimeConfig.public.posthogPublicKey, {
    api_host: runtimeConfig.public.posthogHost,
    defaults: runtimeConfig.public.posthogDefaults as ConfigDefaults,
    opt_out_capturing_by_default: true,
    loaded: (instance) => {
      if (import.meta.env.DEV) {
        instance.debug()
      }
      applyConsent(instance)
    }
  })

  if (import.meta.client) {
    window.addEventListener('ndt:analytics-consent-changed', (event: Event) => {
      const status = (event as CustomEvent<{ status?: 'granted' | 'denied' }>).detail?.status
      if (status === 'granted') {
        posthogClient?.opt_in_capturing({ captureEventName: false })
      } else {
        posthogClient?.opt_out_capturing()
      }
    })
  }

  return {
    provide: {
      posthog: () => posthogClient
    }
  }
})
