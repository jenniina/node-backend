import type { RequestHandler } from "express"

type AnyRecord = Record<string, unknown>

const isPlainObject = (value: unknown): value is AnyRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

const sanitizeInPlace = (value: unknown): void => {
  if (Array.isArray(value)) {
    for (const item of value) sanitizeInPlace(item)
    return
  }

  if (!isPlainObject(value)) return

  for (const key of Object.keys(value)) {
    // Prevent Mongo operator injection and dotted path injection.
    if (key.startsWith("$") || key.includes(".")) {
      delete value[key]
      continue
    }

    sanitizeInPlace(value[key])
  }
}

export const mongoSanitize = (): RequestHandler => {
  return (req, _res, next) => {
    sanitizeInPlace(req.body)
    sanitizeInPlace(req.query)
    sanitizeInPlace(req.params)
    next()
  }
}
