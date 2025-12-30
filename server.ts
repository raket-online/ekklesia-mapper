import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createServer as createViteServer } from 'vite'
import express from 'express'
import { createApiApp } from './src/app-factory'
import { errorHandler, notFoundHandler } from './src/middleware/error.middleware'

const isDev = process.env.NODE_ENV !== 'production'
const PORT = Number(process.env.PORT) || 5173

async function startServer() {
  // Create the base API app
  const app = createApiApp()

  // Vite/Production serving
  if (isDev) {
    // In development, use Vite's dev server with middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })

    app.use(vite.middlewares)
  } else {
    // In production (if running as a standalone node server), serve static files
    // Note: On Vercel, this part is skipped because Vercel handles static files.
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

startServer().catch(console.error)
