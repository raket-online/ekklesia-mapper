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

# Build test handler for Edge runtime
echo "⚡ Building test handler (Edge runtime)..."
npx esbuild src/api/test.ts \
  --bundle \
  --platform=browser \
  --target=es2020 \
  --format=esm \
  --outfile=.vercel/output/functions/test.func/index.js

# Create package.json in function directory to specify CommonJS
cat > .vercel/output/functions/api.func/package.json << 'EOF'
{
  "type": "commonjs"
}
EOF

# Create function config
cat > .vercel/output/functions/api.func/.vc-config.json << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.default",
  "launcherType": "Nodejs"
}
EOF

# Create test function directory structure
mkdir -p .vercel/output/functions/test.func

cat > .vercel/output/functions/test.func/package.json << 'EOF'
{
  "type": "commonjs"
}
EOF

cat > .vercel/output/functions/test.func/.vc-config.json << 'EOF'
{
  "runtime": "edge"
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
