import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import * as schema from "./schema"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  trustedOrigins: (origin) => {
    // Handle undefined/null origin
    if (!origin) return false

    // Allow localhost
    if (origin.startsWith("http://localhost:")) return true

    // Allow all Vercel preview deployments
    if (origin.includes("vercel.app") && origin.includes("ekklesia-mapper")) return true

    return false
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      account: schema.account,
      session: schema.sessions,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can enable later
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement email sending
      // For now: log to console
      console.log('Password reset requested for:', user.email)
      console.log('Reset URL:', url)
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },
  advanced: {
    cookiePrefix: "ekklesia",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
})


