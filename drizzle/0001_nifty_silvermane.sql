ALTER TABLE "users" DROP COLUMN IF EXISTS "emailVerified";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emailVerified" boolean NOT NULL DEFAULT false;