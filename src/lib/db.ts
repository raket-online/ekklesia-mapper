import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is not set')
}

const client = neon(connectionString)
export const db = drizzle(client, { schema })
