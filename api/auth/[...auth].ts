/**
 * /api/auth/[...auth]
 * Handles all Better Auth routes via catchall
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { auth } from '../../server/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Construct full URL
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers.host
    const url = `${protocol}://${host}${req.url}`

    // Convert Vercel headers to Web API Headers
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

    // Prepare request body for POST requests
    let body: string | undefined
    if (req.body && Object.keys(req.body).length > 0) {
      body = JSON.stringify(req.body)
    }

    // Create Web API Request for Better Auth
    const webRequest = new Request(url, {
      method: req.method || 'GET',
      headers,
      body,
      // @ts-ignore - duplex required for Node.js Request with body
      duplex: 'half'
    })

    // Let Better Auth handle the request
    const authResponse = await auth.handler(webRequest)

    if (authResponse) {
      // Convert Web API Response to Vercel Response
      const statusCode = authResponse.status

      // Copy response headers (including Set-Cookie for sessions)
      authResponse.headers.forEach((value, key) => {
        res.setHeader(key, value)
      })

      // Send response body
      const responseBody = await authResponse.text()
      res.status(statusCode).send(responseBody)
    } else {
      // No response from Better Auth
      res.status(404).json({ error: 'Not found' })
    }
  } catch (error) {
    console.error('[Better Auth handler] Error:', error)
    res.status(500).json({
      error: 'Authentication error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
