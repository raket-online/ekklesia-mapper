import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: app.get('/api/resource', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * Global error handling middleware
 * Should be mounted after all routes
 */
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err)

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.issues.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code
      }))
    })
  }

  // Database errors
  if (err.code && err.code.startsWith('23')) {
    // PostgreSQL error codes starting with 23 are integrity constraint violations
    return res.status(409).json({
      error: 'Data conflict',
      message: 'The request could not be processed due to a data conflict'
    })
  }

  // Authentication errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message || 'Authentication required'
    })
  }

  // Not found errors
  if (err.status === 404 || err.message?.toLowerCase().includes('not found')) {
    return res.status(404).json({
      error: 'Not found',
      message: err.message || 'Resource not found'
    })
  }

  // Generic error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
}

/**
 * Not found handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  })
}
