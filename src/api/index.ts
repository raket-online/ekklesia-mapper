import serverless from 'serverless-http'
import { createApiApp } from './app-factory'
import { errorHandler, notFoundHandler } from '../middleware/error.middleware'

const app = createApiApp()

// Add error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Export as Vercel serverless function handler using serverless-http adapter
// Configure for Node.js runtime (not AWS Lambda)
const handler = serverless(app, {
  provider: 'vercel'
})

export default handler
