// Simple test handler to verify Vercel function works
// With launcherType: "Nodejs", Vercel expects traditional Node.js (req, res) format
import type { IncomingMessage, ServerResponse } from 'http'

export default async (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({
    status: 'ok',
    message: 'Test handler works',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  }))
}
