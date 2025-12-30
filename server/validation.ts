import { z } from 'zod'

/**
 * Validation schemas using Zod
 * These schemas are used for runtime validation of API requests
 */

// UUID validation helper
const uuidSchema = z.string().uuid('Invalid ID format')

// Church validation schema
export const churchSchema = z.object({
  name: z.string()
    .min(1, 'Church name is required')
    .max(255, 'Church name too long')
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, { message: 'Church name contains invalid characters' }),
  parentId: uuidSchema.nullable().optional(),
  metrics: z.record(z.string(), z.number().min(0, 'Metric values must be non-negative'))
})

export const churchUpdateSchema = churchSchema.partial()

// Metric validation schema
export const metricSchema = z.object({
  name: z.string()
    .min(1, 'Metric name is required')
    .max(100, 'Metric name too long')
    .regex(/^[a-zA-Z0-9\s\-]+$/, { message: 'Metric name contains invalid characters' }),
  key: z.string()
    .min(1, 'Metric key is required')
    .max(50, 'Metric key too long')
    .regex(/^[a-z0-9_]+$/, { message: 'Metric key must be lowercase letters, numbers, and underscores only' }),
  color: z.enum(['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'gray'], {
    errorMap: () => ({ message: 'Invalid color. Must be one of: red, blue, green, yellow, purple, pink, orange, gray' })
  } as any),
  icon: z.string()
    .min(1, 'Icon is required')
    .max(50, 'Icon name too long'),
  isPrimary: z.boolean().optional().default(false),
  order: z.number().int().nonnegative().optional()
})

export const metricUpdateSchema = metricSchema.partial().omit({ key: true })

// Settings validation schema
export const settingsSchema = z.object({
  settings: z.record(z.string(), z.any()).refine(
    (val) => typeof val === 'object' && val !== null,
    'Settings must be an object'
  )
})

// Auth validation schemas (for email/password)
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const signUpSchema = signInSchema.extend({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name too long')
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Name contains invalid characters')
})

// Reorder schema
export const reorderSchema = z.array(z.object({
  id: uuidSchema,
  order: z.number().int().nonnegative()
})).min(1, 'At least one item is required')

// Export all schemas for use in routes
export const schemas = {
  church: churchSchema,
  churchUpdate: churchUpdateSchema,
  metric: metricSchema,
  metricUpdate: metricUpdateSchema,
  settings: settingsSchema,
  signIn: signInSchema,
  signUp: signUpSchema,
  reorder: reorderSchema,
  uuid: uuidSchema
}
