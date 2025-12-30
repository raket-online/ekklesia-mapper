import 'dotenv/config'
import fs from 'fs'
import path from 'path'

import express from 'express'
import cors from 'cors'
import { createServer as createViteServer } from 'vite'
import { auth } from './src/lib/auth'

// Import modular routes
import churchesRouter from './src/routes/churches.routes'
import metricsRouter from './src/routes/metrics.routes'
import settingsRouter from './src/routes/settings.routes'
import authHandler from './src/routes/auth.routes'

// Import middleware
import { errorHandler, notFoundHandler } from './src/middleware/error.middleware'
import { securityMiddleware, rateLimiter, authRateLimiter, hidePoweredBy } from './src/middleware/security.middleware'

const isDev = process.env.NODE_ENV !== 'production'
const PORT = Number(process.env.PORT) || 5173

async function createServer() {
  const app = express()

  // Security middleware
  app.use(hidePoweredBy)
  app.use(securityMiddleware)

  // Rate limiting
  app.use(rateLimiter)

  // CORS and JSON parsing
  app.use(cors())
  app.use(express.json())

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Mount modular routes
  app.use('/api/churches', churchesRouter)
  app.use('/api/metrics', metricsRouter)
  app.use('/api/settings', settingsRouter)
  app.use('/api/auth', authRateLimiter, authHandler)

  // Vite/Production serving
  if (isDev) {
    // In development, use Vite's dev server with middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })

    app.use(vite.middlewares)
  } else {
    // In production, serve static files
    app.use(express.static(path.join(__dirname, 'dist')))

    // SPA fallback
    app.get('*', (req, res, next) => {
      // Don't serve index.html for API requests that didn't match a route
      if (req.path.startsWith('/api')) {
        return next()
      }
      res.sendFile(path.join(__dirname, 'dist', 'index.html'))
    })
  }

  // Error handling (must be after all routes AND frontend serving)
  app.use(notFoundHandler)
  app.use(errorHandler)

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

createServer().catch(console.error)