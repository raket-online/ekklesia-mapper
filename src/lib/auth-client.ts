import { createAuthClient } from "better-auth/client"

// For Vercel/production: use current hostname (empty string = relative URLs)
// For local dev: use VITE_API_URL from .env if provided
// Fallback to current origin for SPA deployments
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL
  if (envURL) return envURL

  // Production: use current origin (works for Vercel where frontend & API share domain)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

export const authClient = createAuthClient({
  baseURL: getBaseURL()
})
