import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { asyncHandler } from '../middleware/error.middleware'
import { validate, schemas } from '../lib/validation/schemas'
import { queries } from '../lib/db/queries'

const router = Router()

// Apply authentication to all routes
router.use(authMiddleware)

/**
 * GET /api/metrics
 * Get all metrics for authenticated user
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const metrics = await queries.metrics.getByUser(req.user!.id)
  res.json(metrics)
}))

/**
 * GET /api/metrics/:id
 * Get a specific metric by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const metric = await queries.metrics.getById(req.params.id, req.user!.id)

  if (!metric) {
    return res.status(404).json({ error: 'Metric not found' })
  }

  res.json(metric)
}))

/**
 * POST /api/metrics
 * Create a new metric
 */
router.post('/', validate(schemas.metric), asyncHandler(async (req: Request, res: Response) => {
  const { name, key, color, icon, isPrimary, order } = req.body

  // Get highest current order value
  const metrics = await queries.metrics.getByUser(req.user!.id)
  const maxOrder = metrics.reduce((max, m) => Math.max(max, m.order), 0)

  const newMetric = await queries.metrics.create({
    id: crypto.randomUUID(),
    userId: req.user!.id,
    name,
    key,
    color,
    icon,
    isPrimary: isPrimary || false,
    order: order ?? maxOrder + 1
  })

  const [metric] = newMetric
  res.status(201).json(metric)
}))

/**
 * PUT /api/metrics/:id
 * Update a metric
 */
router.put('/:id', validate(schemas.metricUpdate), asyncHandler(async (req: Request, res: Response) => {
  const { name, color, icon, order } = req.body

  // Get current metric to preserve isPrimary and key
  const current = await queries.metrics.getById(req.params.id, req.user!.id)

  if (!current) {
    return res.status(404).json({ error: 'Metric not found' })
  }

  const updated = await queries.metrics.update(
    req.params.id,
    req.user!.id,
    {
      name,
      color,
      icon,
      order: order ?? current.order
    }
  )

  if (!updated || updated.length === 0) {
    return res.status(404).json({ error: 'Metric not found' })
  }

  const [metric] = updated
  res.json(metric)
}))

/**
 * DELETE /api/metrics/:id
 * Delete a metric
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  // Check if metric exists
  const metric = await queries.metrics.getById(req.params.id, req.user!.id)

  if (!metric) {
    return res.status(404).json({ error: 'Metric not found' })
  }

  // Prevent deleting primary metric
  if (metric.isPrimary) {
    return res.status(400).json({ error: 'Cannot delete the primary metric' })
  }

  await queries.metrics.delete(req.params.id, req.user!.id)
  res.status(204).send()
}))

/**
 * POST /api/metrics/reorder
 * Reorder metrics
 */
router.post('/reorder', validate(schemas.reorder), asyncHandler(async (req: Request, res: Response) => {
  const { body } = req

  // Convert to array of updates with userId
  const updates = body.map((item: any) => ({
    id: item.id,
    userId: req.user!.id,
    order: item.order
  }))

  await queries.metrics.reorder(updates)

  // Return updated metrics list
  const metrics = await queries.metrics.getByUser(req.user!.id)
  res.json(metrics)
}))

/**
 * POST /api/metrics/reset
 * Reset metrics to defaults
 */
router.post('/reset', asyncHandler(async (req: Request, res: Response) => {
  // Delete all non-primary metrics
  const metrics = await queries.metrics.getByUser(req.user!.id)
  for (const metric of metrics) {
    if (!metric.isPrimary) {
      await queries.metrics.delete(metric.id, req.user!.id)
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
      userId: req.user!.id,
      ...metric,
      isPrimary: false
    })
  }

  // Return updated metrics list
  const updatedMetrics = await queries.metrics.getByUser(req.user!.id)
  res.json(updatedMetrics)
}))

export default router
