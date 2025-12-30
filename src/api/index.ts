import { createApiApp } from './app-factory'
import { errorHandler, notFoundHandler } from '../middleware/error.middleware'
import type { Request, Response } from 'express'

const app = createApiApp()

// Add error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Export as Vercel serverless function handler
// Vercel expects a function, not an Express app object
export default (req: Request, res: Response) => {
  return app(req, res)
}
