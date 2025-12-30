/**
 * /api/auth/[...auth]
 * Better Auth handler - all auth routes
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

// Schema
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

// Database
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is not set')
}
const client = neon(connectionString)
const db = drizzle(client)

// Auth
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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 }
  },
  advanced: {
    cookiePrefix: "ekklesia",
    crossSubDomainCookies: { enabled: false },
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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
      res.status(authResponse.status).send(responseBody)
    } else {
      res.status(404).json({ error: 'Not found' })
    }
  } catch (error) {
    console.error('[Auth] Error:', error)
    res.status(500).json({ error: 'Authentication error' })
  }
}
