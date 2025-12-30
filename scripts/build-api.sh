#!/bin/bash
set -e

echo "🔨 Building API functions for Vercel..."

# Bundle each API function with esbuild and place in api directory
echo "📦 Bundling functions..."

# Health endpoint
npx esbuild api/health.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=api/health.js \
  --external:@vercel/node

# Auth catchall
npx esbuild api/auth/\[...auth\].ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=api/auth/\[...auth\].js \
  --external:@vercel/node

# Churches
npx esbuild api/churches/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=api/churches/index.js \
  --external:@vercel/node

npx esbuild api/churches/\[id\].ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=api/churches/\[id\].js \
  --external:@vercel/node

# Metrics
npx esbuild api/metrics/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=api/metrics/index.js \
  --external:@vercel/node

npx esbuild api/metrics/\[id\].ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=api/metrics/\[id\].js \
  --external:@vercel/node

npx esbuild api/metrics/reorder.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=api/metrics/reorder.js \
  --external:@vercel/node

npx esbuild api/metrics/reset.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=api/metrics/reset.js \
  --external:@vercel/node

# Settings
npx esbuild api/settings/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=api/settings/index.js \
  --external:@vercel/node

echo "✅ API build complete - bundled .js files created in api/"
