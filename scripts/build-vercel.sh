#!/bin/bash
set -e

echo "🏗️  Building for Vercel..."

# Build frontend with Vite
echo "📦 Building frontend..."
npx vite build

# Create Build Output API structure
echo "📁 Creating Vercel output structure..."
rm -rf .vercel/output
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions/api.func

# Copy static files
cp -r dist/* .vercel/output/static/

# Build API serverless function (bundle everything as CommonJS)
echo "⚡ Building API function..."
npx esbuild src/api/index.ts \
  --bundle \
  --platform=node \
  --target=es2020 \
  --format=cjs \
  --outfile=.vercel/output/functions/api.func/index.js

# Create function config
cat > .vercel/output/functions/api.func/.vc-config.json << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.default",
  "launcherType": "Nodejs"
}
EOF

# Create output config with routing
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    { "src": "/api/(.*)", "dest": "/api" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

echo "✅ Vercel build complete!"
