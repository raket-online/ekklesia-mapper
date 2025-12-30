import { type Request, type Response, type NextFunction } from 'express'
import { auth } from '../lib/auth'

/**
 * Beter Auth handler middleware
 * This handles all Beter Auth operations (sign-in, sign-up, sign-out, etc.)
 * It converts Express requests to Web API requests that Beter Auth expects
 */
export const authHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Convert Express request to Web API Request
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`

    // Convert Express headers to Web API Headers
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

    // Prepare request body
    let body: string | undefined
    if (req.body && Object.keys(req.body).length > 0) {
      body = JSON.stringify(req.body)
    }

    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body,
      // @ts-ignore - duplex option is required by Node.js for Request with body
      duplex: 'half'
    })

    // Let Beter Auth handle the request
    const authResponse = await auth.handler(webRequest)

    if (authResponse) {
      // Convert Web API Response to Express Response
      const statusCode = authResponse.status

      // Copy response headers (including Set-Cookie for sessions)
      authResponse.headers.forEach((value, key) => {
        res.setHeader(key, value)
      })

      // Send response body
      const responseBody = await authResponse.text()
      res.status(statusCode).send(responseBody)
    } else {
      // No response from Beter Auth (shouldn't happen)
      res.status(404).json({ error: 'Not found' })
    }
  } catch (error) {
    console.error('[Auth handler] Error:', error)
    next(error)
  }
}

// No router export - this is a middleware function to be mounted directly
export default authHandler
