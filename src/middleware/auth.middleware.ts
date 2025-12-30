import { auth } from '../lib/auth'
import type { Request, Response, NextFunction } from 'express'

/**
 * Authentication middleware using Beter Auth
 * Validates session from cookies and attaches user to request
 */
export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Convert Express headers to Web API Headers format
    const headers = new Headers()
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v))
        } else {
          headers.append(key, value)
        }
      }
    })

    // Beter Auth reads session from cookies automatically
    const session = await auth.api.getSession({ headers })

    if (!session) {
      return _res.status(401).json({ error: 'Unauthorized' })
    }

    // Attach user and session to request for downstream handlers
    req.user = session.user
    req.session = session.session
    next()
  } catch (error) {
    console.error('[Auth middleware] Error:', error)
    _res.status(500).json({ error: 'Authentication error' })
  }
}

/**
 * Optional authentication - attaches user if valid, but doesn't require it
 */
export const optionalAuthMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Convert Express headers to Web API Headers format
    const headers = new Headers()
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v))
        } else {
          headers.append(key, value)
        }
      }
    })

    const session = await auth.api.getSession({ headers })

    if (session) {
      req.user = session.user
      req.session = session.session
    }

    next()
  } catch (error) {
    console.error('[Optional auth middleware] Error:', error)
    // Continue without auth on error
    next()
  }
}

// Extend Express Request type to include user and session
declare module 'express' {
  interface Request {
    user?: {
      id: string
      email: string
      name: string
      image?: string | null
    }
    session?: {
      id: string
      userId: string
      expiresAt: Date
      token: string
      ipAddress?: string | null
      userAgent?: string | null
    }
  }
}
