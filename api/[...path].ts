/**
 * Catch-all API handler
 * Handles all routes except /api/auth/* (which uses Better Auth)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core'
import { eq, and, desc, asc } from 'drizzle-orm'
import { z } from 'zod'

// ============ DATABASE SCHEMA ============
const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
})

const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt', { mode: 'date' }),
  password: text('password'),
  scope: text('scope'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
})

const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
})

const churches: any = pgTable('churches', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  parentId: text('parentId').references((): any => churches.id, { onDelete: 'cascade' }),
  metrics: jsonb('metrics').notNull().$type<Record<string, number>>(),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
})

const userMetrics = pgTable('user_metrics', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  key: text('key').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  isPrimary: boolean('isPrimary').notNull().default(false),
  order: integer('order').notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
})

const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  settings: jsonb('settings').notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
})

// ============ DATABASE CONNECTION ============
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is not set')
}
const client = neon(connectionString)
const db = drizzle(client)

// ============ BETTER AUTH ============
const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ekklesia-mapper.vercel.app",
    "https://*.vercel.app",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, account, session: sessions },
  }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  advanced: { cookiePrefix: "ekklesia", useSecureCookies: process.env.NODE_ENV === 'production' },
})

// ============ VALIDATION SCHEMAS ============
const churchSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().nullable().optional(),
  metrics: z.record(z.string(), z.number().min(0))
})

const metricSchema = z.object({
  name: z.string().min(1).max(100),
  key: z.string().min(1).max(50),
  color: z.enum(['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'gray']),
  icon: z.string().min(1).max(50),
  isPrimary: z.boolean().optional().default(false),
  order: z.number().int().nonnegative().optional()
})

const reorderSchema = z.array(z.object({
  id: z.string().uuid(),
  order: z.number().int().nonnegative()
}))

// ============ AUTH HELPER ============
async function getUser(req: VercelRequest): Promise<{ id: string; email: string; name?: string } | null> {
  try {
    const url = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}${req.url}`
    const headers = new Headers()
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) value.forEach(v => headers.append(key, v))
        else headers.append(key, String(value))
      }
    })
    const session = await auth.api.getSession({ headers })
    if (!session?.user) return null
    return { id: session.user.id, email: session.user.email, name: session.user.name || undefined }
  } catch { return null }
}

// ============ ROUTE HANDLER ============
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel uses '...path' as the query key for [...path].ts catch-all
  const path = req.query['...path']
  const pathStr = Array.isArray(path) ? path.join('/') : path || ''
  const method = req.method || 'GET'

  // Debug endpoint - always works, no auth needed
  if (pathStr === 'debug' || req.url?.includes('/debug')) {
    return res.status(200).json({
      path,
      pathStr,
      url: req.url,
      method,
      query: req.query,
      headers: {
        host: req.headers.host,
        'x-forwarded-proto': req.headers['x-forwarded-proto']
      }
    })
  }

  try {
    // Auth routes - delegate to Better Auth
    if (pathStr.startsWith('auth/') || pathStr === 'auth') {
      const protocol = req.headers['x-forwarded-proto'] || 'http'
      const host = req.headers.host
      const url = `${protocol}://${host}${req.url}`

      const headers = new Headers()
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) value.forEach(v => headers.append(key, v))
          else headers.append(key, String(value))
        }
      })

      let body: string | undefined
      if (req.body && Object.keys(req.body).length > 0) {
        body = JSON.stringify(req.body)
      }

      const webRequest = new Request(url, {
        method: req.method || 'GET',
        headers,
        body,
        // @ts-ignore
        duplex: 'half'
      })

      const authResponse = await auth.handler(webRequest)

      if (authResponse) {
        authResponse.headers.forEach((value, key) => res.setHeader(key, value))
        const responseBody = await authResponse.text()
        return res.status(authResponse.status).send(responseBody)
      } else {
        return res.status(404).json({ error: 'Auth route not found' })
      }
    }

    // Health check
    if (pathStr === 'health') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' })
    }

    // Auth required for all other routes
    const user = await getUser(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // ============ CHURCHES ============
    if (pathStr === 'churches') {
      if (method === 'GET') {
        const result = await db.select().from(churches).where(eq(churches.userId, user.id)).orderBy(desc(churches.createdAt))
        return res.status(200).json(result)
      }
      if (method === 'POST') {
        const data = churchSchema.parse(req.body)
        const newChurch = await db.insert(churches).values({
          id: crypto.randomUUID(),
          userId: user.id,
          name: data.name,
          parentId: data.parentId ?? null,
          metrics: data.metrics
        }).returning()
        return res.status(201).json(newChurch[0])
      }
    }

    if (pathStr.startsWith('churches/')) {
      const id = pathStr.replace('churches/', '')
      if (method === 'GET') {
        const result = await db.select().from(churches).where(and(eq(churches.id, id), eq(churches.userId, user.id)))
        if (!result[0]) return res.status(404).json({ error: 'Church not found' })
        return res.status(200).json(result[0])
      }
      if (method === 'PUT') {
        const data = churchSchema.partial().parse(req.body)
        const result = await db.update(churches).set({ ...data, parentId: data.parentId ?? null, updatedAt: new Date().toISOString() })
          .where(and(eq(churches.id, id), eq(churches.userId, user.id))).returning()
        if (!result[0]) return res.status(404).json({ error: 'Church not found' })
        return res.status(200).json(result[0])
      }
      if (method === 'DELETE') {
        const existing = await db.select().from(churches).where(and(eq(churches.id, id), eq(churches.userId, user.id)))
        if (!existing[0]) return res.status(404).json({ error: 'Church not found' })
        if (existing[0].parentId === null) return res.status(400).json({ error: 'Cannot delete root church' })
        await db.delete(churches).where(and(eq(churches.id, id), eq(churches.userId, user.id)))
        return res.status(204).end()
      }
    }

    // ============ METRICS ============
    if (pathStr === 'metrics') {
      if (method === 'GET') {
        const result = await db.select().from(userMetrics).where(eq(userMetrics.userId, user.id)).orderBy(asc(userMetrics.order))
        return res.status(200).json(result)
      }
      if (method === 'POST') {
        const data = metricSchema.parse(req.body)
        const existing = await db.select().from(userMetrics).where(eq(userMetrics.userId, user.id))
        const maxOrder = existing.reduce((max, m) => Math.max(max, m.order), 0)
        const newMetric = await db.insert(userMetrics).values({
          id: crypto.randomUUID(),
          userId: user.id,
          ...data,
          isPrimary: data.isPrimary || false,
          order: data.order ?? maxOrder + 1
        }).returning()
        return res.status(201).json(newMetric[0])
      }
    }

    if (pathStr === 'metrics/reorder' && method === 'POST') {
      const data = reorderSchema.parse(req.body)
      for (const item of data) {
        await db.update(userMetrics).set({ order: item.order }).where(and(eq(userMetrics.id, item.id), eq(userMetrics.userId, user.id)))
      }
      const result = await db.select().from(userMetrics).where(eq(userMetrics.userId, user.id)).orderBy(asc(userMetrics.order))
      return res.status(200).json(result)
    }

    if (pathStr === 'metrics/reset' && method === 'POST') {
      const existing = await db.select().from(userMetrics).where(eq(userMetrics.userId, user.id))
      for (const m of existing) {
        if (!m.isPrimary) await db.delete(userMetrics).where(eq(userMetrics.id, m.id))
      }
      const defaults = [
        { name: 'Christians', key: 'christians', color: 'green', icon: 'check', order: 1 },
        { name: 'Baptized', key: 'baptized', color: 'purple', icon: 'star', order: 2 },
        { name: 'Reaching out', key: 'reaching_out', color: 'pink', icon: 'globe', order: 3 }
      ]
      for (const d of defaults) {
        await db.insert(userMetrics).values({ id: crypto.randomUUID(), userId: user.id, ...d, isPrimary: false })
      }
      const result = await db.select().from(userMetrics).where(eq(userMetrics.userId, user.id)).orderBy(asc(userMetrics.order))
      return res.status(200).json(result)
    }

    if (pathStr.startsWith('metrics/')) {
      const id = pathStr.replace('metrics/', '')
      if (method === 'GET') {
        const result = await db.select().from(userMetrics).where(and(eq(userMetrics.id, id), eq(userMetrics.userId, user.id)))
        if (!result[0]) return res.status(404).json({ error: 'Metric not found' })
        return res.status(200).json(result[0])
      }
      if (method === 'PUT') {
        const data = metricSchema.partial().parse(req.body)
        const result = await db.update(userMetrics).set({ ...data, updatedAt: new Date().toISOString() })
          .where(and(eq(userMetrics.id, id), eq(userMetrics.userId, user.id))).returning()
        if (!result[0]) return res.status(404).json({ error: 'Metric not found' })
        return res.status(200).json(result[0])
      }
      if (method === 'DELETE') {
        const existing = await db.select().from(userMetrics).where(and(eq(userMetrics.id, id), eq(userMetrics.userId, user.id)))
        if (!existing[0]) return res.status(404).json({ error: 'Metric not found' })
        if (existing[0].isPrimary) return res.status(400).json({ error: 'Cannot delete primary metric' })
        await db.delete(userMetrics).where(and(eq(userMetrics.id, id), eq(userMetrics.userId, user.id)))
        return res.status(204).end()
      }
    }

    // ============ SETTINGS ============
    if (pathStr === 'settings') {
      if (method === 'GET') {
        const result = await db.select().from(settings).where(eq(settings.userId, user.id))
        return res.status(200).json(result[0]?.settings || {})
      }
      if (method === 'PUT') {
        const data = req.body?.settings
        if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Invalid settings' })
        const existing = await db.select().from(settings).where(eq(settings.userId, user.id))
        if (existing[0]) {
          const result = await db.update(settings).set({ settings: data, updatedAt: new Date().toISOString() })
            .where(eq(settings.userId, user.id)).returning()
          return res.status(200).json(result[0].settings)
        } else {
          const result = await db.insert(settings).values({ id: crypto.randomUUID(), userId: user.id, settings: data }).returning()
          return res.status(200).json(result[0].settings)
        }
      }
      if (method === 'DELETE') {
        await db.delete(settings).where(eq(settings.userId, user.id))
        return res.status(204).end()
      }
    }

    // Not found
    return res.status(404).json({ error: 'Not found', path: pathStr })
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }
}
