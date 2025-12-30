import { createApiApp } from './app-factory'
import { errorHandler, notFoundHandler } from '../middleware/error.middleware'

const app = createApiApp()

// Add error handling
app.use(notFoundHandler)
app.use(errorHandler)

export default app
