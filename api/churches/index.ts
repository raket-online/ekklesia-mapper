/**
 * /api/churches
 * GET - List all churches for user
 * POST - Create new church
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, validateBody, handleError, sendJSON } from '../../server/helpers'
import { schemas } from '../../server/validation'
import { queries } from '../../server/queries'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Require authentication
    const user = await requireAuth(req, res)
    if (!user) return // 401 already sent

    if (req.method === 'GET') {
      // List all churches for user
      const churches = await queries.churches.getByUser(user.id)
      return sendJSON(res, 200, churches)
    }

    if (req.method === 'POST') {
      // Validate request body
      const data = validateBody(schemas.church, req, res)
      if (!data) return // 400 already sent

      const { name, parentId, metrics } = data

      // Create church
      const newChurch = await queries.churches.create({
        id: crypto.randomUUID(),
        userId: user.id,
        name,
        parentId: parentId ?? null,
        metrics
      })

      const church = Array.isArray(newChurch) ? newChurch[0] : newChurch
      return sendJSON(res, 201, church)
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    handleError(res, error)
  }
}
