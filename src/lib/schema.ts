import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table (managed by Beter Auth)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
})

// Account table (managed by Beter Auth) - stores credentials and OAuth tokens
export const account = pgTable('account', {
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

// Sessions table (managed by Beter Auth)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
})

// Churches table
export const churches: any = pgTable('churches', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  parentId: text('parentId').references(() => churches.id, { onDelete: 'cascade' }),
  metrics: jsonb('metrics').notNull().$type<Record<string, number>>(),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
})

// User Metrics table (user-specific metric definitions)
export const userMetrics = pgTable('user_metrics', {
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

// Settings table (flexible JSONB for any future settings)
export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  settings: jsonb('settings').notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  churches: many(churches),
  sessions: many(sessions),
  accounts: many(account),
  userMetrics: many(userMetrics),
  userSettings: one(settings),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}))

export const churchesRelations = relations(churches, ({ one, many }) => ({
  user: one(users, {
    fields: [churches.userId],
    references: [users.id],
  }),
  parent: one(churches, {
    fields: [churches.parentId],
    references: [churches.id],
  }),
  children: many(churches),
}))
