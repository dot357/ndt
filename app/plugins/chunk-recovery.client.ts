const CHUNK_ERROR_RETRY_KEY = 'ndt:chunk-retry'
const CHUNK_ERROR_RETRY_TTL_MS = 5 * 60 * 1000

function isChunkLoadError(error: unknown): boolean {
  const text = String(
    (error as { message?: string })?.message ??
    (error as { reason?: { message?: string } })?.reason?.message ??
    error
  )

  return (
    text.includes('Failed to fetch dynamically imported module') ||
    text.includes('Importing a module script failed') ||
    text.includes('ChunkLoadError') ||
    text.includes('Loading chunk')
  )
}

function shouldRetryReload(): boolean {
  const last = Number(window.sessionStorage.getItem(CHUNK_ERROR_RETRY_KEY) || 0)
  return !Number.isFinite(last) || Date.now() - last > CHUNK_ERROR_RETRY_TTL_MS
}

function retryReloadOnce() {
  if (!shouldRetryReload()) {
    return
  }

  window.sessionStorage.setItem(CHUNK_ERROR_RETRY_KEY, String(Date.now()))

  const url = new URL(window.location.href)
  url.searchParams.set('_r', String(Date.now()))
  window.location.replace(url.toString())
}

export default defineNuxtPlugin((nuxtApp) => {
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      retryReloadOnce()
    }
  })

  nuxtApp.hook('app:error', (error) => {
    if (isChunkLoadError(error)) {
      retryReloadOnce()
    }
  })
})
