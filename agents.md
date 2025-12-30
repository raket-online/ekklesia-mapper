# Agent Documentation for Ekklesia Mapper

This document provides essential context for AI agents working on the Ekklesia Mapper project.

## Project Overview

**Ekklesia Mapper** is a Full-Stack Web Application for visualizing and managing hierarchical church structures. 
It transitioned from a LocalStorage-only app to a robust **PostgreSQL + Express + Vue 3** architecture.

## Architecture & Technology Stack

- **Frontend**: Vue 3 + Pinia + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth (Session-based, HTTP-only cookies)
- **Validation**: Zod (Shared between frontend and backend)

### Key Architectural Pattern: "Strict Separation"

To prevent build crashes and logic leaks, the project enforces a strict separation between Client and Server code:

| Layer | Files | Responsibilities | Allowed Imports |
|-------|-------|------------------|-----------------|
| **Client** | `src/lib/auth-client.ts` | Browser-side auth handling | `better-auth/client` |
| **Server** | `src/lib/auth.ts` | Server-side auth verification | `better-auth`, `db` |
| **Shared** | `src/lib/api.ts`, `types/` | API types, Zod schemas | No Node/DB libs |

**CRITICAL RULE**: Never import `src/lib/auth.ts`, `src/lib/db.ts`, or `src/lib/db/queries.ts` into Vue components or Pinia stores.

## Data Storage & Schema

### Database Schema (`src/lib/schema.ts`)
1.  **Users**: Managed by Better Auth.
2.  **Churches**:
    *   `id`: UUID
    *   `userId`: Foreign Key (Multi-tenancy)
    *   `parentId`: UUID (Self-referencing for hierarchy)
    *   `metrics`: JSONB (Stores dynamic values: `{ members: 10, baptized: 2 }`)
3.  **UserMetrics**:
    *   Defines *what* to track (e.g., "Members", "Leaders").
    *   Stored per user to allow customization.

### Query Layer (`src/lib/db/queries.ts`)
*   All database interactions pass through this layer.
*   **Abstraction**: API routes call `queries.churches.getByUser()` instead of raw Drizzle calls.
*   **Safety**: Ensures users can only access their own data (`where(eq(userId, session.user.id))`).
*   **Dates**: All dates are stored as ISO strings (`mode: 'string'` in schema).

## State Management (Pinia)

### `src/stores/auth.ts` (Global Source of Truth)
*   Initialized on app launch.
*   Fetches session from `auth-client.ts`.
*   Properties: `user`, `isAuthenticated`, `isLoading`.

### `src/stores/churches.ts` & `metrics.ts`
*   **Reactive Loading**: Watches `authStore.isAuthenticated`.
*   **Auto-Fetch**: Automatically loads data via API once the user logs in.
*   **Optimistic UI**: Updates local state immediately for better UX, then syncs with API.

## File Structure & Responsibilities

### `/server.ts`
*   Main entry point.
*   Configures Express, Middleware (CORS, Helmet), and Routes.
*   Serves the Vite frontend in development and static files in production.

### `/src/routes/*.routes.ts`
*   Modular API endpoints (`/api/churches`, `/api/metrics`).
*   Uses `authMiddleware` to protect routes.
*   Uses `validate()` middleware with Zod schemas.

### `/src/lib/api.ts`
*   Type-safe API client used by the frontend.
*   Includes built-in error handling and Zod response validation.

## Development Guidelines

### 1. Adding a New Feature
1.  **Database**: Update `schema.ts` and run `npm run db:generate` & `npm run db:migrate`.
2.  **Backend**: Add query function in `queries.ts`, add route in `routes/`.
3.  **Frontend**: Update `api.ts`, add method to Store, build UI component.

### 2. Modifying Authentication
*   **Do not touch** the separation logic (`auth-client.ts` vs `auth.ts`).
*   Always use `useAuth()` composable in components.

### 3. Error Handling
*   Backend: Use `asyncHandler` wrapper for routes.
*   Frontend: Stores have an `error` state. Display it via `Toast` or alert.

## Debugging Tips

*   **"Route not found"**: Check middleware order in `server.ts`. Error handlers must be last.
*   **"Refused to connect ws://"**: CSP issue. Check `security.middleware.ts`.
*   **"Cannot find module 'fs' / 'path'"**: You imported backend code into a frontend file. Check imports.

---

**Last Updated**: December 30, 2025
**Framework Version**: Vue 3.5.13, Express 5.0, Better Auth 1.0