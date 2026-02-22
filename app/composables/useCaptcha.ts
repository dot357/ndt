let scriptPromise: Promise<void> | null = null

function ensureScriptLoaded(): Promise<void> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    if (!import.meta.client) {
      resolve()
      return
    }

    if (window.turnstile) {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile script.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.setAttribute('data-turnstile', 'true')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile script.'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

export function useCaptcha() {
  const config = useRuntimeConfig()

  async function getToken(action: string): Promise<string | null> {
    const siteKey = config.public.captchaSiteKey as string | undefined
    if (!import.meta.client || !siteKey) return null

    try {
      await ensureScriptLoaded()
      if (!window.turnstile) return null

      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-9999px'
      container.style.top = '-9999px'
      document.body.appendChild(container)

      return await new Promise<string | null>((resolve) => {
        let settled = false
        let widgetId = ''

        const finish = (token: string | null) => {
          if (settled) return
          settled = true
          try {
            if (widgetId) window.turnstile?.remove(widgetId)
          } catch {
            // Ignore cleanup errors.
          }
          container.remove()
          resolve(token)
        }

        try {
          widgetId = window.turnstile!.render(container, {
            sitekey: siteKey,
            action,
            execution: 'execute',
            appearance: 'execute',
            callback: (token: string) => finish(token),
            'error-callback': () => finish(null),
            'expired-callback': () => finish(null),
            'timeout-callback': () => finish(null)
          })

          window.turnstile!.execute(widgetId)
          setTimeout(() => finish(null), 10_000)
        } catch {
          finish(null)
        }
      })
    } catch {
      return null
    }
  }

  return { getToken }
}
