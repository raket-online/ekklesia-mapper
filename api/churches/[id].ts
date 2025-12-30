/**
 * /api/churches/[id]
 * GET - Get specific church
 * PUT - Update church
 * DELETE - Delete church
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
      return res.status(400).json({ error: 'Invalid church ID' })
    }

    if (req.method === 'GET') {
      // Get specific church
      const church = await queries.churches.getById(id, user.id)

      if (!church) {
        return res.status(404).json({ error: 'Church not found' })
      }

      return sendJSON(res, 200, church)
    }

    if (req.method === 'PUT') {
      // Validate request body
      const data = validateBody(schemas.churchUpdate, req, res)
      if (!data) return // 400 already sent

      const { name, parentId, metrics } = data

      // Update church
      const updated = await queries.churches.update(id, user.id, {
        name,
        parentId,
        metrics
      })

      if (!updated || (Array.isArray(updated) && updated.length === 0)) {
        return res.status(404).json({ error: 'Church not found' })
      }

      const church = Array.isArray(updated) ? updated[0] : updated
      return sendJSON(res, 200, church)
    }

    if (req.method === 'DELETE') {
      // Check if church exists
      const church = await queries.churches.getById(id, user.id)

      if (!church) {
        return res.status(404).json({ error: 'Church not found' })
      }

      // Prevent deleting root church
      if (church.parentId === null) {
        return res.status(400).json({ error: 'Cannot delete the root church' })
      }

      await queries.churches.delete(id, user.id)
      return sendNoContent(res)
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    handleError(res, error)
  }
}
