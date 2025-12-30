/**
 * Shared utilities for Vercel Serverless Functions
 * Replaces Express middleware with pure function wrappers
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { auth } from './auth'
import { ZodSchema } from 'zod'

// Extended Request with user
export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    id: string
    email: string
    name?: string
  }
}

/**
 * Check authentication via Better Auth session
 * Returns user if authenticated, null if not
 */
export async function getUser(req: VercelRequest): Promise<{ id: string; email: string; name?: string } | null> {
  try {
    const url = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}${req.url}`

    // Convert Vercel request to Web API Request for Better Auth
    const headers = new Headers()
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v))
        } else {
          headers.append(key, String(value))
        }
      }
    })

    const webRequest = new Request(url, {
      method: req.method,
      headers
    })

    const session = await auth.api.getSession({ headers: webRequest.headers })

    if (!session || !session.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    return null
  }
}

/**
 * Require authentication
 * Returns user or sends 401
 */
export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<{ id: string; email: string; name?: string } | null> {
  const user = await getUser(req)

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  return user
}

/**
 * Validate request body with Zod schema
 * Returns validated data or sends 400
 */
export function validateBody<T>(
  schema: ZodSchema<T>,
  req: VercelRequest,
  res: VercelResponse
): T | null {
  try {
    const validated = schema.parse(req.body)
    return validated
  } catch (error: any) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.errors || error.message
    })
    return null
  }
}

/**
 * Handle errors consistently
 */
export function handleError(res: VercelResponse, error: unknown): void {
  console.error('API Error:', error)

  if (error instanceof Error) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Send JSON response
 */
export function sendJSON(res: VercelResponse, status: number, data: any): void {
  res.status(status).json(data)
}

/**
 * Send no content response
 */
export function sendNoContent(res: VercelResponse): void {
  res.status(204).end()
}
