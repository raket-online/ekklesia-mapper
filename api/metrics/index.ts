/**
 * /api/metrics
 * GET - List all metrics for user
 * POST - Create new metric
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, validateBody, handleError, sendJSON } from '../../src/lib/vercel-helpers'
import { schemas } from '../../src/lib/validation/schemas'
import { queries } from '../../src/lib/db/queries'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Require authentication
    const user = await requireAuth(req, res)
    if (!user) return // 401 already sent

    if (req.method === 'GET') {
      // List all metrics for user
      const metrics = await queries.metrics.getByUser(user.id)
      return sendJSON(res, 200, metrics)
    }

    if (req.method === 'POST') {
      // Validate request body
      const data = validateBody(schemas.metric, req, res)
      if (!data) return // 400 already sent

      const { name, key, color, icon, isPrimary, order } = data

      // Get highest current order value
      const metrics = await queries.metrics.getByUser(user.id)
      const maxOrder = metrics.reduce((max, m) => Math.max(max, m.order), 0)

      // Create metric
      const newMetric = await queries.metrics.create({
        id: crypto.randomUUID(),
        userId: user.id,
        name,
        key,
        color,
        icon,
        isPrimary: isPrimary || false,
        order: order ?? maxOrder + 1
      })

      const [metric] = newMetric
      return sendJSON(res, 201, metric)
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    handleError(res, error)
  }
}
