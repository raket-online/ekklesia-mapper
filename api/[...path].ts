// Vercel serverless function that handles all /api/* routes via Express
import type { VercelRequest, VercelResponse } from '@vercel/node'
import serverless from 'serverless-http'
import { createApiApp } from '../src/api/app-factory'
import { errorHandler, notFoundHandler } from '../src/middleware/error.middleware'

// Create Express app
const app = createApiApp()
app.use(notFoundHandler)
app.use(errorHandler)

// Convert to serverless handler
const handler = serverless(app)

// Export Vercel-compatible handler
export default async (req: VercelRequest, res: VercelResponse) => {
  return handler(req, res)
}
