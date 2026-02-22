import { createError, getRequestIP, type H3Event } from 'h3'

interface Bucket {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  name: string
  max: number
  windowMs: number
  key?: string
}

const memoryBuckets = new Map<string, Bucket>()

export async function enforceRateLimit(event: H3Event, options: RateLimitOptions) {
  const now = Date.now()
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown-ip'
  const actorKey = options.key || ip
  const bucketKey = `ratelimit:${options.name}:${actorKey}`

  const storage = useStorage('cache')

  let bucket: Bucket | null = await storage.getItem<Bucket>(bucketKey)

  if (!bucket) {
    bucket = memoryBuckets.get(bucketKey) || null
  }

  if (!bucket || bucket.resetAt <= now) {
    const nextBucket: Bucket = { count: 1, resetAt: now + options.windowMs }
    await storage.setItem(bucketKey, nextBucket)
    memoryBuckets.set(bucketKey, nextBucket)
    return
  }

  if (bucket.count >= options.max) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again shortly.'
    })
  }

  const updated: Bucket = {
    count: bucket.count + 1,
    resetAt: bucket.resetAt
  }

  await storage.setItem(bucketKey, updated)
  memoryBuckets.set(bucketKey, updated)

  if (memoryBuckets.size > 5000) {
    for (const [key, entry] of memoryBuckets.entries()) {
      if (entry.resetAt <= now) memoryBuckets.delete(key)
    }
  }
}
