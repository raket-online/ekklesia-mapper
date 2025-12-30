#!/bin/bash
# Simple script to bundle api/[...path].ts before Vercel deployment
echo "🔧 Pre-bundling API function..."

npx esbuild api/\[...path\].ts \
  --bundle \
  --platform=node \
  --target=es2020 \
  --format=cjs \
  --outfile=api/\[...path\].js \
  --external:@vercel/node

# Remove .ts file so Vercel uses the bundled .js
rm -f api/\[...path\].ts

echo "✅ API function bundled (TypeScript source removed)"
