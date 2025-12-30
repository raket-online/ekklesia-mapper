/**
 * /api/settings
 * GET - Get settings for user
 * PUT - Update settings for user
 * DELETE - Delete settings for user
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

    if (req.method === 'GET') {
      // Get settings for user
      const settings = await queries.settings.getByUser(user.id)

      // If no settings exist, return empty object
      if (!settings) {
        return sendJSON(res, 200, {})
      }

      return sendJSON(res, 200, settings.settings)
    }

    if (req.method === 'PUT') {
      // Validate request body
      const data = validateBody(schemas.settings, req, res)
      if (!data) return // 400 already sent

      const { settings } = data

      // Upsert settings
      const updated = await queries.settings.upsert(user.id, settings)

      if (!updated || (Array.isArray(updated) && updated.length === 0)) {
        return res.status(500).json({ error: 'Failed to update settings' })
      }

      const setting = Array.isArray(updated) ? updated[0] : updated
      return sendJSON(res, 200, setting.settings)
    }

    if (req.method === 'DELETE') {
      // Delete settings
      await queries.settings.delete(user.id)
      return sendNoContent(res)
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    handleError(res, error)
  }
}
