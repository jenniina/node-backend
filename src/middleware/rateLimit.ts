import type { Request, RequestHandler } from "express"

type RateLimitOptions = {
  windowMs: number
  max: number
  message?: string
  keyGenerator?: (req: Request) => string
}

type Entry = { count: number; resetAt: number }

export const rateLimit = (opts: RateLimitOptions): RequestHandler => {
  const windowMs = opts.windowMs
  const max = opts.max
  const message = opts.message ?? "Too many requests, please try again later."
  const keyGenerator = opts.keyGenerator ?? ((req) => req.ip ?? "unknown")

  const hits = new Map<string, Entry>()

  return (req, res, next) => {
    const now = Date.now()
    const key = String(keyGenerator(req) ?? "unknown")

    const current = hits.get(key)
    if (!current || now >= current.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (current.count >= max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000)
      res.setHeader("Retry-After", String(retryAfterSeconds))
      return res.status(429).json({ success: false, message })
    }

    current.count += 1
    hits.set(key, current)

    // Lightweight cleanup to prevent unbounded growth.
    if (hits.size > 10_000) {
      for (const [k, v] of hits) {
        if (now >= v.resetAt) hits.delete(k)
      }
    }

    next()
  }
}
