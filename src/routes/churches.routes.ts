import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { asyncHandler } from '../middleware/error.middleware'
import { validate, schemas } from '../lib/validation/schemas'
import { queries } from '../lib/db/queries'

const router = Router()

// Apply authentication to all routes
router.use(authMiddleware)

/**
 * GET /api/churches
 * Get all churches for authenticated user
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const churches = await queries.churches.getByUser(req.user!.id)
  res.json(churches)
}))

/**
 * GET /api/churches/:id
 * Get a specific church by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const church = await queries.churches.getById(req.params.id, req.user!.id)

  if (!church) {
    return res.status(404).json({ error: 'Church not found' })
  }

  res.json(church)
}))

/**
 * POST /api/churches
 * Create a new church
 */
router.post('/', validate(schemas.church), asyncHandler(async (req: Request, res: Response) => {
  const { name, parentId, metrics } = req.body

  const newChurch = await queries.churches.create({
    id: crypto.randomUUID(),
    userId: req.user!.id,
    name,
    parentId,
    metrics
  })

  const church = Array.isArray(newChurch) ? newChurch[0] : newChurch
  res.status(201).json(church)
}))

/**
 * PUT /api/churches/:id
 * Update a church
 */
router.put('/:id', validate(schemas.churchUpdate), asyncHandler(async (req: Request, res: Response) => {
  const { name, parentId, metrics } = req.body

  const updated = await queries.churches.update(
    req.params.id,
    req.user!.id,
    { name, parentId, metrics }
  )

  if (!updated || (Array.isArray(updated) && updated.length === 0)) {
    return res.status(404).json({ error: 'Church not found' })
  }

  const church = Array.isArray(updated) ? updated[0] : updated
  res.json(church)
}))

/**
 * DELETE /api/churches/:id
 * Delete a church (and all its children)
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  // Check if church exists
  const church = await queries.churches.getById(req.params.id, req.user!.id)

  if (!church) {
    return res.status(404).json({ error: 'Church not found' })
  }

  // Prevent deleting root church
  if (church.parentId === null) {
    return res.status(400).json({ error: 'Cannot delete the root church' })
  }

  await queries.churches.delete(req.params.id, req.user!.id)
  res.status(204).send()
}))

export default router
