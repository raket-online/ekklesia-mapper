var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/app-factory.ts
import express from "express";
import cors from "cors";

// src/routes/churches.routes.ts
import { Router } from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// src/lib/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// src/lib/schema.ts
var schema_exports = {};
__export(schema_exports, {
  account: () => account,
  accountRelations: () => accountRelations,
  churches: () => churches,
  churchesRelations: () => churchesRelations,
  sessions: () => sessions,
  settings: () => settings,
  userMetrics: () => userMetrics,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull()
});
var account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: timestamp("expiresAt", { mode: "date" }),
  password: text("password"),
  scope: text("scope"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull()
});
var sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull()
});
var churches = pgTable("churches", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  parentId: text("parentId").references(() => churches.id, { onDelete: "cascade" }),
  metrics: jsonb("metrics").notNull().$type(),
  createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow()
});
var userMetrics = pgTable("user_metrics", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  key: text("key").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  isPrimary: boolean("isPrimary").notNull().default(false),
  order: integer("order").notNull(),
  createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow()
});
var settings = pgTable("settings", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow()
});
var usersRelations = relations(users, ({ many, one }) => ({
  churches: many(churches),
  sessions: many(sessions),
  accounts: many(account),
  userMetrics: many(userMetrics),
  userSettings: one(settings)
}));
var accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id]
  })
}));
var churchesRelations = relations(churches, ({ one, many }) => ({
  user: one(users, {
    fields: [churches.userId],
    references: [users.id]
  }),
  parent: one(churches, {
    fields: [churches.parentId],
    references: [churches.id]
  }),
  children: many(churches)
}));

// src/lib/db.ts
var connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("POSTGRES_URL or DATABASE_URL environment variable is not set");
}
var client = neon(connectionString);
var db = drizzle(client, { schema: schema_exports });

// src/lib/auth.ts
var auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      account,
      session: sessions
    }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // Can enable later
    sendResetPassword: async ({ user, url }) => {
      console.log("Password reset requested for:", user.email);
      console.log("Reset URL:", url);
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    // 7 days
    updateAge: 60 * 60 * 24,
    // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
      // 5 minutes
    }
  },
  advanced: {
    cookiePrefix: "ekklesia",
    crossSubDomainCookies: {
      enabled: false
    },
    useSecureCookies: process.env.NODE_ENV === "production"
  }
});

// src/middleware/auth.middleware.ts
var authMiddleware = async (req, _res, next) => {
  try {
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.append(key, value);
        }
      }
    });
    const session = await auth.api.getSession({ headers });
    if (!session) {
      return _res.status(401).json({ error: "Unauthorized" });
    }
    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    console.error("[Auth middleware] Error:", error);
    _res.status(500).json({ error: "Authentication error" });
  }
};

// src/middleware/error.middleware.ts
import { ZodError } from "zod";
var asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
var errorHandler = (err, _req, res, _next) => {
  console.error("[Error]", err);
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: err.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
        code: e.code
      }))
    });
  }
  if (err.code && err.code.startsWith("23")) {
    return res.status(409).json({
      error: "Data conflict",
      message: "The request could not be processed due to a data conflict"
    });
  }
  if (err.name === "UnauthorizedError" || err.status === 401) {
    return res.status(401).json({
      error: "Unauthorized",
      message: err.message || "Authentication required"
    });
  }
  if (err.status === 404 || err.message?.toLowerCase().includes("not found")) {
    return res.status(404).json({
      error: "Not found",
      message: err.message || "Resource not found"
    });
  }
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message || "An unexpected error occurred",
    ...process.env.NODE_ENV !== "production" && { stack: err.stack }
  });
};
var notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`
  });
};

// src/lib/validation/schemas.ts
import { z } from "zod";
var uuidSchema = z.string().uuid("Invalid ID format");
var churchSchema = z.object({
  name: z.string().min(1, "Church name is required").max(255, "Church name too long").regex(/^[a-zA-Z0-9\s\-\.]+$/, { message: "Church name contains invalid characters" }),
  parentId: uuidSchema.nullable().optional(),
  metrics: z.record(z.string(), z.number().min(0, "Metric values must be non-negative"))
});
var churchUpdateSchema = churchSchema.partial();
var metricSchema = z.object({
  name: z.string().min(1, "Metric name is required").max(100, "Metric name too long").regex(/^[a-zA-Z0-9\s\-]+$/, { message: "Metric name contains invalid characters" }),
  key: z.string().min(1, "Metric key is required").max(50, "Metric key too long").regex(/^[a-z0-9_]+$/, { message: "Metric key must be lowercase letters, numbers, and underscores only" }),
  color: z.enum(["red", "blue", "green", "yellow", "purple", "pink", "orange", "gray"], {
    errorMap: () => ({ message: "Invalid color. Must be one of: red, blue, green, yellow, purple, pink, orange, gray" })
  }),
  icon: z.string().min(1, "Icon is required").max(50, "Icon name too long"),
  isPrimary: z.boolean().optional().default(false),
  order: z.number().int().nonnegative().optional()
});
var metricUpdateSchema = metricSchema.partial().omit({ key: true });
var settingsSchema = z.object({
  settings: z.record(z.string(), z.any()).refine(
    (val) => typeof val === "object" && val !== null,
    "Settings must be an object"
  )
});
var signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
var signUpSchema = signInSchema.extend({
  name: z.string().min(1, "Name is required").max(255, "Name too long").regex(/^[a-zA-Z0-9\s\-\.]+$/, "Name contains invalid characters")
});
var reorderSchema = z.array(z.object({
  id: uuidSchema,
  order: z.number().int().nonnegative()
})).min(1, "At least one item is required");
var validate = (schema, property = "body") => {
  return async (req, _res, next) => {
    try {
      if (property === "body" && req.body) {
        req.body = schema.parse(req.body);
      } else if (property === "query" && req.query) {
        req.query = schema.parse(req.query);
      } else if (property === "params" && req.params) {
        req.params = schema.parse(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var schemas = {
  church: churchSchema,
  churchUpdate: churchUpdateSchema,
  metric: metricSchema,
  metricUpdate: metricUpdateSchema,
  settings: settingsSchema,
  signIn: signInSchema,
  signUp: signUpSchema,
  reorder: reorderSchema,
  uuid: uuidSchema
};

// src/lib/db/queries.ts
import { eq, and, desc, asc } from "drizzle-orm";
var queries = {
  /**
   * Church queries
   */
  churches: {
    /**
     * Get all churches for a user, ordered by creation date (newest first)
     */
    getByUser: async (userId) => db.select().from(churches).where(eq(churches.userId, userId)).orderBy(desc(churches.createdAt)),
    /**
     * Get a single church by ID (with user ownership check)
     */
    getById: async (id, userId) => db.select().from(churches).where(and(
      eq(churches.id, id),
      eq(churches.userId, userId)
    )).then((rows) => rows[0]),
    /**
     * Get children churches by parent ID
     */
    getByParent: async (parentId, userId) => db.select().from(churches).where(and(
      parentId === null ? eq(churches.parentId, parentId) : eq(churches.parentId, parentId),
      eq(churches.userId, userId)
    )).orderBy(asc(churches.name)),
    /**
     * Get root church (where parentId is null)
     */
    getRoot: async (userId) => db.select().from(churches).where(and(
      eq(churches.parentId, null),
      eq(churches.userId, userId)
    )).then((rows) => rows[0]),
    /**
     * Create a new church
     */
    create: async (data) => db.insert(churches).values(data).returning(),
    /**
     * Update a church (with user ownership check)
     */
    update: async (id, userId, data) => db.update(churches).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and(
      eq(churches.id, id),
      eq(churches.userId, userId)
    )).returning(),
    /**
     * Delete a church (with user ownership check)
     * Note: Cascade delete should handle children
     */
    delete: async (id, userId) => db.delete(churches).where(and(
      eq(churches.id, id),
      eq(churches.userId, userId)
    )).returning(),
    /**
     * Count churches for a user
     */
    count: async (userId) => db.select({ count: churches.id }).from(churches).where(eq(churches.userId, userId)).then((rows) => rows.length)
  },
  /**
   * Metric queries
   */
  metrics: {
    /**
     * Get all metrics for a user, ordered by order field
     */
    getByUser: async (userId) => db.select().from(userMetrics).where(eq(userMetrics.userId, userId)).orderBy(asc(userMetrics.order)),
    /**
     * Get a single metric by ID (with user ownership check)
     */
    getById: async (id, userId) => db.select().from(userMetrics).where(and(
      eq(userMetrics.id, id),
      eq(userMetrics.userId, userId)
    )).then((rows) => rows[0]),
    /**
     * Get primary metric
     */
    getPrimary: async (userId) => db.select().from(userMetrics).where(and(
      eq(userMetrics.userId, userId),
      eq(userMetrics.isPrimary, true)
    )).then((rows) => rows[0]),
    /**
     * Get metric by key
     */
    getByKey: async (key, userId) => db.select().from(userMetrics).where(and(
      eq(userMetrics.key, key),
      eq(userMetrics.userId, userId)
    )).then((rows) => rows[0]),
    /**
     * Create a new metric
     */
    create: async (data) => db.insert(userMetrics).values(data).returning(),
    /**
     * Update a metric (with user ownership check)
     */
    update: async (id, userId, data) => db.update(userMetrics).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and(
      eq(userMetrics.id, id),
      eq(userMetrics.userId, userId)
    )).returning(),
    /**
     * Delete a metric (with user ownership check)
     */
    delete: async (id, userId) => db.delete(userMetrics).where(and(
      eq(userMetrics.id, id),
      eq(userMetrics.userId, userId)
    )).returning(),
    /**
     * Update order for multiple metrics in a transaction
     */
    reorder: async (updates) => {
      return db.transaction(async (tx) => {
        const results = await Promise.all(
          updates.map(
            (update) => tx.update(userMetrics).set({ order: update.order }).where(and(
              eq(userMetrics.id, update.id),
              eq(userMetrics.userId, update.userId)
            )).returning()
          )
        );
        return results.flat();
      });
    }
  },
  /**
   * Settings queries
   */
  settings: {
    /**
     * Get settings for a user
     */
    getByUser: async (userId) => db.select().from(settings).where(eq(settings.userId, userId)).then((rows) => rows[0]),
    /**
     * Upsert settings for a user
     */
    upsert: async (userId, settings2) => db.insert(settings).values({
      id: crypto.randomUUID(),
      userId,
      settings: settings2
    }).onConflictDoUpdate({
      target: settings.userId,
      set: { settings: settings2, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }
    }).returning(),
    /**
     * Update settings for a user
     */
    update: async (userId, settings2) => db.update(settings).set({ settings: settings2, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(eq(settings.userId, userId)).returning(),
    /**
     * Delete settings for a user
     */
    delete: async (userId) => db.delete(settings).where(eq(settings.userId, userId)).returning()
  },
  /**
   * User queries
   */
  users: {
    /**
     * Get user by ID
     */
    getById: async (id) => db.select().from(users).where(eq(users.id, id)).then((rows) => rows[0]),
    /**
     * Get user by email
     */
    getByEmail: async (email) => db.select().from(users).where(eq(users.email, email)).then((rows) => rows[0]),
    /**
     * Update user
     */
    update: async (id, data) => db.update(users).set(data).where(eq(users.id, id)).returning()
  },
  /**
   * Session queries (for debugging/admin)
   */
  sessions: {
    /**
     * Get active sessions for a user
     */
    getByUser: async (userId) => db.select().from(sessions).where(eq(sessions.userId, userId)).orderBy(desc(sessions.expiresAt)),
    /**
     * Get session by ID
     */
    getById: async (id) => db.select().from(sessions).where(eq(sessions.id, id)).then((rows) => rows[0]),
    /**
     * Delete a session
     */
    delete: async (id, userId) => db.delete(sessions).where(and(
      eq(sessions.id, id),
      eq(sessions.userId, userId)
    )).returning(),
    /**
     * Delete all sessions for a user (except current)
     */
    deleteAllExcept: async (userId, currentSessionId) => db.delete(sessions).where(and(
      eq(sessions.userId, userId),
      eq(sessions.id, currentSessionId)
    )).returning()
  }
};

// src/routes/churches.routes.ts
var router = Router();
router.use(authMiddleware);
router.get("/", asyncHandler(async (req, res) => {
  const churches2 = await queries.churches.getByUser(req.user.id);
  res.json(churches2);
}));
router.get("/:id", asyncHandler(async (req, res) => {
  const church = await queries.churches.getById(req.params.id, req.user.id);
  if (!church) {
    return res.status(404).json({ error: "Church not found" });
  }
  res.json(church);
}));
router.post("/", validate(schemas.church), asyncHandler(async (req, res) => {
  const { name, parentId, metrics } = req.body;
  const newChurch = await queries.churches.create({
    id: crypto.randomUUID(),
    userId: req.user.id,
    name,
    parentId,
    metrics
  });
  const church = Array.isArray(newChurch) ? newChurch[0] : newChurch;
  res.status(201).json(church);
}));
router.put("/:id", validate(schemas.churchUpdate), asyncHandler(async (req, res) => {
  const { name, parentId, metrics } = req.body;
  const updated = await queries.churches.update(
    req.params.id,
    req.user.id,
    { name, parentId, metrics }
  );
  if (!updated || Array.isArray(updated) && updated.length === 0) {
    return res.status(404).json({ error: "Church not found" });
  }
  const church = Array.isArray(updated) ? updated[0] : updated;
  res.json(church);
}));
router.delete("/:id", asyncHandler(async (req, res) => {
  const church = await queries.churches.getById(req.params.id, req.user.id);
  if (!church) {
    return res.status(404).json({ error: "Church not found" });
  }
  if (church.parentId === null) {
    return res.status(400).json({ error: "Cannot delete the root church" });
  }
  await queries.churches.delete(req.params.id, req.user.id);
  res.status(204).send();
}));
var churches_routes_default = router;

// src/routes/metrics.routes.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.use(authMiddleware);
router2.get("/", asyncHandler(async (req, res) => {
  const metrics = await queries.metrics.getByUser(req.user.id);
  res.json(metrics);
}));
router2.get("/:id", asyncHandler(async (req, res) => {
  const metric = await queries.metrics.getById(req.params.id, req.user.id);
  if (!metric) {
    return res.status(404).json({ error: "Metric not found" });
  }
  res.json(metric);
}));
router2.post("/", validate(schemas.metric), asyncHandler(async (req, res) => {
  const { name, key, color, icon, isPrimary, order } = req.body;
  const metrics = await queries.metrics.getByUser(req.user.id);
  const maxOrder = metrics.reduce((max, m) => Math.max(max, m.order), 0);
  const newMetric = await queries.metrics.create({
    id: crypto.randomUUID(),
    userId: req.user.id,
    name,
    key,
    color,
    icon,
    isPrimary: isPrimary || false,
    order: order ?? maxOrder + 1
  });
  const [metric] = newMetric;
  res.status(201).json(metric);
}));
router2.put("/:id", validate(schemas.metricUpdate), asyncHandler(async (req, res) => {
  const { name, color, icon, order } = req.body;
  const current = await queries.metrics.getById(req.params.id, req.user.id);
  if (!current) {
    return res.status(404).json({ error: "Metric not found" });
  }
  const updated = await queries.metrics.update(
    req.params.id,
    req.user.id,
    {
      name,
      color,
      icon,
      order: order ?? current.order
    }
  );
  if (!updated || updated.length === 0) {
    return res.status(404).json({ error: "Metric not found" });
  }
  const [metric] = updated;
  res.json(metric);
}));
router2.delete("/:id", asyncHandler(async (req, res) => {
  const metric = await queries.metrics.getById(req.params.id, req.user.id);
  if (!metric) {
    return res.status(404).json({ error: "Metric not found" });
  }
  if (metric.isPrimary) {
    return res.status(400).json({ error: "Cannot delete the primary metric" });
  }
  await queries.metrics.delete(req.params.id, req.user.id);
  res.status(204).send();
}));
router2.post("/reorder", validate(schemas.reorder), asyncHandler(async (req, res) => {
  const { body } = req;
  const updates = body.map((item) => ({
    id: item.id,
    userId: req.user.id,
    order: item.order
  }));
  await queries.metrics.reorder(updates);
  const metrics = await queries.metrics.getByUser(req.user.id);
  res.json(metrics);
}));
router2.post("/reset", asyncHandler(async (req, res) => {
  const metrics = await queries.metrics.getByUser(req.user.id);
  for (const metric of metrics) {
    if (!metric.isPrimary) {
      await queries.metrics.delete(metric.id, req.user.id);
    }
  }
  const defaultMetrics = [
    { name: "Christians", key: "christians", color: "green", icon: "check", order: 1 },
    { name: "Baptized", key: "baptized", color: "purple", icon: "star", order: 2 },
    { name: "Reaching out", key: "reaching_out", color: "pink", icon: "globe", order: 3 }
  ];
  for (const metric of defaultMetrics) {
    await queries.metrics.create({
      id: crypto.randomUUID(),
      userId: req.user.id,
      ...metric,
      isPrimary: false
    });
  }
  const updatedMetrics = await queries.metrics.getByUser(req.user.id);
  res.json(updatedMetrics);
}));
var metrics_routes_default = router2;

// src/routes/settings.routes.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.use(authMiddleware);
router3.get("/", asyncHandler(async (req, res) => {
  let settings2 = await queries.settings.getByUser(req.user.id);
  if (!settings2) {
    return res.json({});
  }
  res.json(settings2.settings);
}));
router3.put("/", validate(schemas.settings), asyncHandler(async (req, res) => {
  const { settings: settings2 } = req.body;
  const updated = await queries.settings.upsert(req.user.id, settings2);
  if (!updated || Array.isArray(updated) && updated.length === 0) {
    return res.status(500).json({ error: "Failed to update settings" });
  }
  const setting = Array.isArray(updated) ? updated[0] : updated;
  res.json(setting.settings);
}));
router3.delete("/", asyncHandler(async (req, res) => {
  await queries.settings.delete(req.user.id);
  res.status(204).send();
}));
var settings_routes_default = router3;

// src/routes/auth.routes.ts
var authHandler = async (req, res, next) => {
  try {
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.append(key, value);
        }
      }
    });
    let body;
    if (req.body && Object.keys(req.body).length > 0) {
      body = JSON.stringify(req.body);
    }
    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body,
      // @ts-ignore - duplex option is required by Node.js for Request with body
      duplex: "half"
    });
    const authResponse = await auth.handler(webRequest);
    if (authResponse) {
      const statusCode = authResponse.status;
      authResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const responseBody = await authResponse.text();
      res.status(statusCode).send(responseBody);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  } catch (error) {
    console.error("[Auth handler] Error:", error);
    next(error);
  }
};
var auth_routes_default = authHandler;

// src/middleware/security.middleware.ts
import rateLimit from "express-rate-limit";
import helmet from "helmet";
var rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});
var authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Stricter for auth endpoints
  skipSuccessfulRequests: true,
  // Don't count successful requests
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});
var securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536e3,
    // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});
var hidePoweredBy = (_req, res, next) => {
  res.removeHeader("X-Powered-By");
  next();
};

// api/app-factory.ts
var createApiApp = () => {
  const app2 = express();
  app2.use(hidePoweredBy);
  app2.use(securityMiddleware);
  app2.use(rateLimiter);
  app2.use(cors());
  app2.use(express.json());
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.use("/api/churches", churches_routes_default);
  app2.use("/api/metrics", metrics_routes_default);
  app2.use("/api/settings", settings_routes_default);
  app2.use("/api/auth", authRateLimiter, auth_routes_default);
  return app2;
};

// api/index.ts
var app = createApiApp();
app.use(notFoundHandler);
app.use(errorHandler);
var index_default = app;
export {
  index_default as default
};
