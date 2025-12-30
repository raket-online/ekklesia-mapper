import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { asyncHandler } from '../middleware/error.middleware'
import { validate, schemas } from '../lib/validation/schemas'
import { queries } from '../lib/db/queries'

const router = Router()

// Apply authentication to all routes
router.use(authMiddleware)

/**
 * GET /api/settings
 * Get settings for authenticated user
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  let settings = await queries.settings.getByUser(req.user!.id)

  // If no settings exist, return empty object
  if (!settings) {
    return res.json({})
  }

  res.json(settings.settings)
}))

/**
 * PUT /api/settings
 * Update settings for authenticated user
 */
router.put('/', validate(schemas.settings), asyncHandler(async (req: Request, res: Response) => {
  const { settings } = req.body

  const updated = await queries.settings.upsert(req.user!.id, settings)

  if (!updated || (Array.isArray(updated) && updated.length === 0)) {
    return res.status(500).json({ error: 'Failed to update settings' })
  }

  const setting = Array.isArray(updated) ? updated[0] : updated
  res.json(setting.settings)
}))

/**
 * DELETE /api/settings
 * Delete settings for authenticated user
 */
router.delete('/', asyncHandler(async (req: Request, res: Response) => {
  await queries.settings.delete(req.user!.id)
  res.status(204).send()
}))

export default router
