import { validate, schemas } from '../lib/validation/schemas'
import type { Request, Response, NextFunction } from 'express'

// Re-export validation middleware factory
export { validate }

// Re-export schemas for convenience
export { schemas }

/**
 * Prebuilt validation middleware for common operations
 */
export const validationMiddleware = {
  // Church validation
  createChurch: validate(schemas.church),
  updateChurch: validate(schemas.churchUpdate),

  // Metric validation
  createMetric: validate(schemas.metric),
  updateMetric: validate(schemas.metricUpdate),
  reorderMetrics: validate(schemas.reorder),

  // Settings validation
  updateSettings: validate(schemas.settings),

  // Auth validation
  signIn: validate(schemas.signIn),
  signUp: validate(schemas.signUp),

  // UUID parameter validation
  validateId: () =>
    validate(schemas.uuid, 'params')
}

/**
 * Body parsing middleware with size limit
 */
export const bodyLimitMiddleware = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10)

    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Payload too large',
        message: `Request body exceeds maximum size of ${maxSize} bytes`
      })
    }

    next()
  }
}

/**
 * Content type validation middleware
 * Ensures request has correct Content-Type header
 */
export const contentTypeMiddleware = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      const contentType = req.headers['content-type']

      if (!contentType) {
        return res.status(415).json({
          error: 'Unsupported Media Type',
          message: 'Content-Type header is required'
        })
      }

      const isAllowed = allowedTypes.some(type => contentType.includes(type))

      if (!isAllowed) {
        return res.status(415).json({
          error: 'Unsupported Media Type',
          message: `Content-Type must be one of: ${allowedTypes.join(', ')}`
        })
      }
    }

    next()
  }
}
