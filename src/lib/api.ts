/**
 * Type-safe API client with Zod validation
 * Centralizes all API calls with runtime type checking
 */

import { z } from 'zod'

const API_BASE = import.meta.env.VITE_API_URL || ''

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Church schema
 */
export const churchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().nullable(),
  metrics: z.record(z.string(), z.number().min(0))
})

export type Church = z.infer<typeof churchSchema>

/**
 * Church data for create/update (without id)
 */
export const churchDataSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().nullable(),
  metrics: z.record(z.string(), z.number().min(0))
})

export type ChurchData = z.infer<typeof churchDataSchema>

/**
 * Metric schema
 */
export const metricSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  key: z.string().min(1),
  color: z.string(),
  icon: z.string(),
  isPrimary: z.boolean(),
  order: z.number().int().min(0)
})

export type Metric = z.infer<typeof metricSchema>

/**
 * Metric data for create/update (without id)
 */
export const metricDataSchema = z.object({
  name: z.string().min(1).max(255),
  key: z.string().min(1),
  color: z.string(),
  icon: z.string(),
  isPrimary: z.boolean().optional(),
  order: z.number().int().min(0).optional()
})

export type MetricData = z.infer<typeof metricDataSchema>

/**
 * Settings schema
 */
export const settingsSchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional()
}).catchall(z.any())

export type Settings = z.infer<typeof settingsSchema>

/**
 * Auth schemas
 */
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type User = z.infer<typeof userSchema>

export const sessionSchema = z.object({
  user: userSchema,
  session: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    expiresAt: z.date(),
    token: z.string()
  }).optional()
})

export type Session = z.infer<typeof sessionSchema>

// ============================================================================
// API Error Handling
// ============================================================================

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// ============================================================================
// API Client
// ============================================================================

/**
 * Core fetch wrapper with error handling
 */
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: Send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    let errorDetails
    try {
      errorDetails = await response.json()
    } catch {
      errorDetails = await response.text()
    }

    throw new APIError(
      response.status,
      errorDetails?.error || `HTTP ${response.status}`,
      errorDetails
    )
  }

  return response
}

/**
 * Churches API
 */
export const churchesAPI = {
  /**
   * List all churches
   */
  list: async (): Promise<Church[]> => {
    const response = await fetchAPI('/api/churches')
    const data = await response.json()
    return z.array(churchSchema).parse(data)
  },

  /**
   * Get a single church by ID
   */
  get: async (id: string): Promise<Church> => {
    const response = await fetchAPI(`/api/churches/${id}`)
    const data = await response.json()
    return churchSchema.parse(data)
  },

  /**
   * Create a new church
   */
  create: async (parentId: string | null, data: ChurchData): Promise<Church> => {
    const validatedData = churchDataSchema.parse(data)
    const response = await fetchAPI('/api/churches', {
      method: 'POST',
      body: JSON.stringify({
        ...validatedData,
        parentId
      })
    })
    const created = await response.json()
    return churchSchema.parse(created)
  },

  /**
   * Update a church
   */
  update: async (id: string, data: ChurchData): Promise<Church> => {
    const validatedData = churchDataSchema.parse(data)
    const response = await fetchAPI(`/api/churches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(validatedData)
    })
    const updated = await response.json()
    return churchSchema.parse(updated)
  },

  /**
   * Delete a church
   */
  delete: async (id: string): Promise<void> => {
    await fetchAPI(`/api/churches/${id}`, {
      method: 'DELETE'
    })
  }
}

/**
 * Metrics API
 */
export const metricsAPI = {
  /**
   * List all metrics
   */
  list: async (): Promise<Metric[]> => {
    const response = await fetchAPI('/api/metrics')
    const data = await response.json()
    return z.array(metricSchema).parse(data)
  },

  /**
   * Get a single metric by ID
   */
  get: async (id: string): Promise<Metric> => {
    const response = await fetchAPI(`/api/metrics/${id}`)
    const data = await response.json()
    return metricSchema.parse(data)
  },

  /**
   * Create a new metric
   */
  create: async (data: MetricData): Promise<Metric> => {
    const validatedData = metricDataSchema.parse(data)
    const response = await fetchAPI('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(validatedData)
    })
    const created = await response.json()
    return metricSchema.parse(created)
  },

  /**
   * Update a metric
   */
  update: async (id: string, data: MetricData): Promise<Metric> => {
    const validatedData = metricDataSchema.partial().parse(data)
    const response = await fetchAPI(`/api/metrics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(validatedData)
    })
    const updated = await response.json()
    return metricSchema.parse(updated)
  },

  /**
   * Delete a metric
   */
  delete: async (id: string): Promise<void> => {
    await fetchAPI(`/api/metrics/${id}`, {
      method: 'DELETE'
    })
  },

  /**
   * Reorder metrics
   */
  reorder: async (metrics: Metric[]): Promise<void> => {
    const validatedMetrics = z.array(metricSchema).parse(metrics)
    await Promise.all(
      validatedMetrics.map((metric, index) =>
        fetchAPI(`/api/metrics/${metric.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...metric, order: index })
        })
      )
    )
  },

  /**
   * Reset to defaults
   */
  resetDefaults: async (): Promise<Metric[]> => {
    // Delete all non-primary metrics
    const metrics = await metricsAPI.list()
    await Promise.all(
      metrics
        .filter(m => !m.isPrimary)
        .map(m => metricsAPI.delete(m.id))
    )

    // Return remaining primary metrics
    return await metricsAPI.list()
  }
}

/**
 * Settings API
 */
export const settingsAPI = {
  /**
   * Get settings
   */
  get: async (): Promise<Settings> => {
    const response = await fetchAPI('/api/settings')
    const data = await response.json()
    return settingsSchema.parse(data)
  },

  /**
   * Update settings
   */
  update: async (settings: Settings): Promise<Settings> => {
    const validatedSettings = settingsSchema.parse(settings)
    const response = await fetchAPI('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings: validatedSettings })
    })
    const data = await response.json()
    return settingsSchema.parse(data)
  }
}

/**
 * Combined API client
 */
export const api = {
  churches: churchesAPI,
  metrics: metricsAPI,
  settings: settingsAPI
}

export default api
