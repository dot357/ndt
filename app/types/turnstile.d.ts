export {}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, options: Record<string, any>) => string
      execute: (widgetId: string, options?: Record<string, any>) => void
      remove: (widgetId: string) => void
    }
  }
}
