import { db } from './db'
import * as schema from './schema'
import { eq, and, desc, asc } from 'drizzle-orm'

/**
 * Centralized database query layer
 * Eliminates code duplication and provides reusable query functions
 */

export const queries = {
  /**
   * Church queries
   */
  churches: {
    /**
     * Get all churches for a user, ordered by creation date (newest first)
     */
    getByUser: async (userId: string) =>
      db.select()
        .from(schema.churches)
        .where(eq(schema.churches.userId, userId))
        .orderBy(desc(schema.churches.createdAt)),

    /**
     * Get a single church by ID (with user ownership check)
     */
    getById: async (id: string, userId: string) =>
      db.select()
        .from(schema.churches)
        .where(and(
          eq(schema.churches.id, id),
          eq(schema.churches.userId, userId)
        ))
        .then(rows => rows[0]),

    /**
     * Get children churches by parent ID
     */
    getByParent: async (parentId: string | null, userId: string) =>
      db.select()
        .from(schema.churches)
        .where(and(
          parentId === null
            ? eq(schema.churches.parentId, parentId as any)
            : eq(schema.churches.parentId, parentId),
          eq(schema.churches.userId, userId)
        ))
        .orderBy(asc(schema.churches.name)),

    /**
     * Get root church (where parentId is null)
     */
    getRoot: async (userId: string) =>
      db.select()
        .from(schema.churches)
        .where(and(
          eq(schema.churches.parentId, null),
          eq(schema.churches.userId, userId)
        ))
        .then(rows => rows[0]),

    /**
     * Create a new church
     */
    create: async (data: {
      id: string
      userId: string
      name: string
      parentId: string | null
      metrics: Record<string, number>
    }) =>
      db.insert(schema.churches)
        .values(data)
        .returning(),

    /**
     * Update a church (with user ownership check)
     */
    update: async (id: string, userId: string, data: {
      name?: string
      parentId?: string | null
      metrics?: Record<string, number>
    }) =>
      db.update(schema.churches)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(and(
          eq(schema.churches.id, id),
          eq(schema.churches.userId, userId)
        ))
        .returning(),

    /**
     * Delete a church (with user ownership check)
     * Note: Cascade delete should handle children
     */
    delete: async (id: string, userId: string) =>
      db.delete(schema.churches)
        .where(and(
          eq(schema.churches.id, id),
          eq(schema.churches.userId, userId)
        ))
        .returning(),

    /**
     * Count churches for a user
     */
    count: async (userId: string) =>
      db.select({ count: schema.churches.id })
        .from(schema.churches)
        .where(eq(schema.churches.userId, userId))
        .then(rows => rows.length)
  },

  /**
   * Metric queries
   */
  metrics: {
    /**
     * Get all metrics for a user, ordered by order field
     */
    getByUser: async (userId: string) =>
      db.select()
        .from(schema.userMetrics)
        .where(eq(schema.userMetrics.userId, userId))
        .orderBy(asc(schema.userMetrics.order)),

    /**
     * Get a single metric by ID (with user ownership check)
     */
    getById: async (id: string, userId: string) =>
      db.select()
        .from(schema.userMetrics)
        .where(and(
          eq(schema.userMetrics.id, id),
          eq(schema.userMetrics.userId, userId)
        ))
        .then(rows => rows[0]),

    /**
     * Get primary metric
     */
    getPrimary: async (userId: string) =>
      db.select()
        .from(schema.userMetrics)
        .where(and(
          eq(schema.userMetrics.userId, userId),
          eq(schema.userMetrics.isPrimary, true)
        ))
        .then(rows => rows[0]),

    /**
     * Get metric by key
     */
    getByKey: async (key: string, userId: string) =>
      db.select()
        .from(schema.userMetrics)
        .where(and(
          eq(schema.userMetrics.key, key),
          eq(schema.userMetrics.userId, userId)
        ))
        .then(rows => rows[0]),

    /**
     * Create a new metric
     */
    create: async (data: {
      id: string
      userId: string
      name: string
      key: string
      color: string
      icon: string
      isPrimary: boolean
      order: number
    }) =>
      db.insert(schema.userMetrics)
        .values(data)
        .returning(),

    /**
     * Update a metric (with user ownership check)
     */
    update: async (id: string, userId: string, data: {
      name?: string
      color?: string
      icon?: string
      order?: number
    }) =>
      db.update(schema.userMetrics)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(and(
          eq(schema.userMetrics.id, id),
          eq(schema.userMetrics.userId, userId)
        ))
        .returning(),

    /**
     * Delete a metric (with user ownership check)
     */
    delete: async (id: string, userId: string) =>
      db.delete(schema.userMetrics)
        .where(and(
          eq(schema.userMetrics.id, id),
          eq(schema.userMetrics.userId, userId)
        ))
        .returning(),

    /**
     * Update order for multiple metrics in a transaction
     */
    reorder: async (updates: Array<{ id: string; userId: string; order: number }>) => {
      // Use a transaction for bulk updates
      return db.transaction(async (tx) => {
        const results = await Promise.all(
          updates.map(update =>
            tx.update(schema.userMetrics)
              .set({ order: update.order })
              .where(and(
                eq(schema.userMetrics.id, update.id),
                eq(schema.userMetrics.userId, update.userId)
              ))
              .returning()
          )
        )
        return results.flat()
      })
    }
  },

  /**
   * Settings queries
   */
  settings: {
    /**
     * Get settings for a user
     */
    getByUser: async (userId: string) =>
      db.select()
        .from(schema.settings)
        .where(eq(schema.settings.userId, userId))
        .then(rows => rows[0]),

    /**
     * Upsert settings for a user
     */
    upsert: async (userId: string, settings: Record<string, any>) =>
      db.insert(schema.settings)
        .values({
          id: crypto.randomUUID(),
          userId,
          settings
        })
        .onConflictDoUpdate({
          target: schema.settings.userId,
          set: { settings, updatedAt: new Date().toISOString() }
        })
        .returning(),

    /**
     * Update settings for a user
     */
    update: async (userId: string, settings: Record<string, any>) =>
      db.update(schema.settings)
        .set({ settings, updatedAt: new Date().toISOString() })
        .where(eq(schema.settings.userId, userId))
        .returning(),

    /**
     * Delete settings for a user
     */
    delete: async (userId: string) =>
      db.delete(schema.settings)
        .where(eq(schema.settings.userId, userId))
        .returning()
  },

  /**
   * User queries
   */
  users: {
    /**
     * Get user by ID
     */
    getById: async (id: string) =>
      db.select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .then(rows => rows[0]),

    /**
     * Get user by email
     */
    getByEmail: async (email: string) =>
      db.select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .then(rows => rows[0]),

    /**
     * Update user
     */
    update: async (id: string, data: {
      name?: string
      image?: string | null
    }) =>
      db.update(schema.users)
        .set(data)
        .where(eq(schema.users.id, id))
        .returning()
  },

  /**
   * Session queries (for debugging/admin)
   */
  sessions: {
    /**
     * Get active sessions for a user
     */
    getByUser: async (userId: string) =>
      db.select()
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, userId))
        .orderBy(desc(schema.sessions.expiresAt)),

    /**
     * Get session by ID
     */
    getById: async (id: string) =>
      db.select()
        .from(schema.sessions)
        .where(eq(schema.sessions.id, id))
        .then(rows => rows[0]),

    /**
     * Delete a session
     */
    delete: async (id: string, userId: string) =>
      db.delete(schema.sessions)
        .where(and(
          eq(schema.sessions.id, id),
          eq(schema.sessions.userId, userId)
        ))
        .returning(),

    /**
     * Delete all sessions for a user (except current)
     */
    deleteAllExcept: async (userId: string, currentSessionId: string) =>
      db.delete(schema.sessions)
        .where(and(
          eq(schema.sessions.userId, userId),
          eq(schema.sessions.id, currentSessionId)
        ))
        .returning()
  }
}

/**
 * Type exports for query results
 */
export type ChurchWithRelations = typeof schema.churches.$inferSelect
export type MetricWithRelations = typeof schema.userMetrics.$inferSelect
export type SettingsWithRelations = typeof schema.settings.$inferSelect
export type UserWithRelations = typeof schema.users.$inferSelect
export type SessionWithRelations = typeof schema.sessions.$inferSelect
