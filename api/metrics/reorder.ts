/**
 * /api/metrics/reorder
 * POST - Reorder metrics
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, validateBody, handleError, sendJSON } from '../lib/helpers'
import { schemas } from '../lib/validation'
import { queries } from '../lib/queries'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Require authentication
    const user = await requireAuth(req, res)
    if (!user) return // 401 already sent

    if (req.method === 'POST') {
      // Validate request body
      const data = validateBody(schemas.reorder, req, res)
      if (!data) return // 400 already sent

      // Convert to array of updates with userId
      const updates = data.map((item: any) => ({
        id: item.id,
        userId: user.id,
        order: item.order
      }))

      await queries.metrics.reorder(updates)

      // Return updated metrics list
      const metrics = await queries.metrics.getByUser(user.id)
      return sendJSON(res, 200, metrics)
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    handleError(res, error)
  }
}
