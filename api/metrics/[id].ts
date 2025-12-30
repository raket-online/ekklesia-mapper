/**
 * /api/metrics/[id]
 * GET - Get specific metric
 * PUT - Update metric
 * DELETE - Delete metric
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, validateBody, handleError, sendJSON, sendNoContent } from '../lib/helpers'
import { schemas } from '../lib/validation'
import { queries } from '../lib/queries'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Require authentication
    const user = await requireAuth(req, res)
    if (!user) return // 401 already sent

    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid metric ID' })
    }

    if (req.method === 'GET') {
      // Get specific metric
      const metric = await queries.metrics.getById(id, user.id)

      if (!metric) {
        return res.status(404).json({ error: 'Metric not found' })
      }

      return sendJSON(res, 200, metric)
    }

    if (req.method === 'PUT') {
      // Validate request body
      const data = validateBody(schemas.metricUpdate, req, res)
      if (!data) return // 400 already sent

      const { name, color, icon, order } = data

      // Get current metric to preserve isPrimary and key
      const current = await queries.metrics.getById(id, user.id)

      if (!current) {
        return res.status(404).json({ error: 'Metric not found' })
      }

      // Update metric
      const updated = await queries.metrics.update(id, user.id, {
        name,
        color,
        icon,
        order: order ?? current.order
      })

      if (!updated || updated.length === 0) {
        return res.status(404).json({ error: 'Metric not found' })
      }

      const [metric] = updated
      return sendJSON(res, 200, metric)
    }

    if (req.method === 'DELETE') {
      // Check if metric exists
      const metric = await queries.metrics.getById(id, user.id)

      if (!metric) {
        return res.status(404).json({ error: 'Metric not found' })
      }

      // Prevent deleting primary metric
      if (metric.isPrimary) {
        return res.status(400).json({ error: 'Cannot delete the primary metric' })
      }

      await queries.metrics.delete(id, user.id)
      return sendNoContent(res)
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    handleError(res, error)
  }
}
