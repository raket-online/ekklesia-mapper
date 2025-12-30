import express from 'express'
import cors from 'cors'
import path from 'path'

// Import modular routes
import churchesRouter from '../src/routes/churches.routes'
import metricsRouter from '../src/routes/metrics.routes'
import settingsRouter from '../src/routes/settings.routes'
import authHandler from '../src/routes/auth.routes'

// Import middleware
import { errorHandler, notFoundHandler } from '../src/middleware/error.middleware'
import { securityMiddleware, rateLimiter, authRateLimiter, hidePoweredBy } from '../src/middleware/security.middleware'

export const createApiApp = () => {
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

  // Note: We do NOT attach error handlers here yet if we want to add more routes (like static files) later.
  // But for the "API App" logic, we should probably attach them, OR provide a way to mount them later.
  // If we return 'app', the consumer can use 'app.use(...)' after.
  
  return app
}
