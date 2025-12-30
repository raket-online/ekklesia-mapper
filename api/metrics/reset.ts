/**
 * /api/metrics/reset
 * POST - Reset metrics to defaults
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, handleError, sendJSON } from '../../src/lib/vercel-helpers'
import { queries } from '../../src/lib/db/queries'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Require authentication
    const user = await requireAuth(req, res)
    if (!user) return // 401 already sent

    if (req.method === 'POST') {
      // Delete all non-primary metrics
      const metrics = await queries.metrics.getByUser(user.id)
      for (const metric of metrics) {
        if (!metric.isPrimary) {
          await queries.metrics.delete(metric.id, user.id)
        }
      }

      // Create default metrics (except primary which already exists)
      const defaultMetrics = [
        { name: 'Christians', key: 'christians', color: 'green', icon: 'check', order: 1 },
        { name: 'Baptized', key: 'baptized', color: 'purple', icon: 'star', order: 2 },
        { name: 'Reaching out', key: 'reaching_out', color: 'pink', icon: 'globe', order: 3 }
      ]

      for (const metric of defaultMetrics) {
        await queries.metrics.create({
          id: crypto.randomUUID(),
          userId: user.id,
          ...metric,
          isPrimary: false
        })
      }

      // Return updated metrics list
      const updatedMetrics = await queries.metrics.getByUser(user.id)
      return sendJSON(res, 200, updatedMetrics)
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    handleError(res, error)
  }
}
