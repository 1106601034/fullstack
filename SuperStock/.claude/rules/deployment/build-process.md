# Build Process Rules

**Priority: 🔴 CRITICAL**
**Applies to: CI/CD, Build Systems, Deployment**

## Build Configuration

### 1. Environment Variables
```typescript
// ✅ Good: Centralized env management
// .env.example (committed to repo)
DATABASE_URL=postgresql://user:pass@localhost/db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
API_URL=http://localhost:3000
NODE_ENV=development

// config/env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NODE_ENV'
] as const

// Validate on startup
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})

export const config = {
  database: {
    url: process.env.DATABASE_URL!,
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10')
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiry: process.env.JWT_EXPIRY || '7d'
  },
  app: {
    env: process.env.NODE_ENV as 'development' | 'production' | 'test',
    port: parseInt(process.env.PORT || '3000')
  }
}
```

### 2. Build Scripts
```json
// ✅ Good: package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "npm run lint && npm run type-check && npm run test && vite build",
    "build:prod": "NODE_ENV=production npm run build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "clean": "rm -rf dist node_modules .turbo",
    "pre-commit": "npm run lint && npm run type-check && npm run test"
  }
}
```

## CI/CD Pipeline

### 1. GitHub Actions
```yaml
# ✅ Good: Comprehensive CI/CD
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # Quality checks
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type checking
        run: npm run type-check

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  # Build
  build:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build:prod

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/

  # Deploy
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/

      - name: Deploy to production
        run: |
          # Deployment commands here
          echo "Deploying to production..."
```

### 2. Pre-commit Hooks
```json
// ✅ Good: .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run quality checks before commit
npm run lint
npm run type-check
npm run test

# Check for sensitive data
if git diff --cached --name-only | xargs grep -E "(api_key|password|secret|token)" ; then
  echo "⚠️  Possible sensitive data detected. Please review your changes."
  exit 1
fi
```

## Build Optimization

### 1. Production Build
```typescript
// ✅ Good: vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'production' && visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  build: {
    // Output directory
    outDir: 'dist',

    // Generate sourcemaps for production
    sourcemap: mode === 'production' ? 'hidden' : true,

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      }
    },

    // Chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'utils': ['lodash', 'date-fns', 'axios']
        },
        // Asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      }
    },

    // Performance thresholds
    chunkSizeWarningLimit: 1000, // KB
  }
}))
```

### 2. Docker Build
```dockerfile
# ✅ Good: Multi-stage Docker build
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

## Deployment Strategies

### 1. Blue-Green Deployment
```yaml
# ✅ Good: Zero-downtime deployment
deploy:
  stage: deploy
  script:
    # Deploy to green environment
    - kubectl set image deployment/app-green app=myapp:$CI_COMMIT_SHA

    # Wait for green to be ready
    - kubectl rollout status deployment/app-green

    # Run smoke tests on green
    - ./scripts/smoke-test.sh green

    # Switch traffic to green
    - kubectl patch service/app -p '{"spec":{"selector":{"version":"green"}}}'

    # Mark blue as previous version
    - kubectl label deployment/app-blue version=previous --overwrite
    - kubectl label deployment/app-green version=current --overwrite
```

### 2. Rolling Updates
```yaml
# ✅ Good: Kubernetes rolling update
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Max pods above desired replica count
      maxUnavailable: 0  # Keep all pods running during update
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

## Monitoring & Rollback

### 1. Health Checks
```typescript
// ✅ Good: Comprehensive health check
app.get('/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    database: 'unknown',
    redis: 'unknown'
  }

  try {
    // Check database
    await db.query('SELECT 1')
    checks.database = 'healthy'
  } catch {
    checks.database = 'unhealthy'
  }

  try {
    // Check Redis
    await redis.ping()
    checks.redis = 'healthy'
  } catch {
    checks.redis = 'unhealthy'
  }

  const isHealthy = checks.database === 'healthy' && checks.redis === 'healthy'

  res.status(isHealthy ? 200 : 503).json(checks)
})
```

### 2. Rollback Strategy
```bash
#!/bin/bash
# ✅ Good: Automated rollback script

# Check deployment health
check_deployment() {
  local max_attempts=30
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if curl -f http://app.example.com/health; then
      echo "Deployment healthy"
      return 0
    fi

    attempt=$((attempt + 1))
    sleep 10
  done

  return 1
}

# Deploy new version
kubectl set image deployment/app app=myapp:$NEW_VERSION

# Wait and check
if ! check_deployment; then
  echo "Deployment failed, rolling back..."
  kubectl rollout undo deployment/app

  # Alert team
  send_alert "Deployment failed and rolled back"
  exit 1
fi

echo "Deployment successful"
```

## Security Checks

### 1. Dependency Scanning
```yaml
# ✅ Good: Security scanning in CI
security:
  stage: test
  script:
    # Check for known vulnerabilities
    - npm audit --audit-level=moderate

    # Check dependencies for licenses
    - npx license-checker --production --failOn="GPL"

    # Scan Docker image
    - trivy image myapp:$CI_COMMIT_SHA

    # SAST scanning
    - semgrep --config=auto .
```

### 2. Secret Management
```typescript
// ✅ Good: Secure secret handling
// Never commit secrets
const config = {
  // From environment variables
  apiKey: process.env.API_KEY,

  // From secret manager
  dbPassword: await secretManager.getSecret('db-password'),

  // From mounted volume
  sslCert: fs.readFileSync('/secrets/ssl/cert.pem'),
}

// Validate secrets exist
if (!config.apiKey) {
  throw new Error('API_KEY not configured')
}
```

## Build Checklist

- [ ] Environment variables validated
- [ ] Linting passes with no warnings
- [ ] Type checking passes
- [ ] All tests pass
- [ ] Coverage meets threshold
- [ ] No sensitive data in code
- [ ] Dependencies up to date
- [ ] Security vulnerabilities checked
- [ ] Build artifacts optimized
- [ ] Source maps configured correctly
- [ ] Health checks implemented
- [ ] Rollback strategy defined
- [ ] Monitoring configured
- [ ] Alerts set up

## Remember

- **Build once**, deploy many times
- **Fail fast** in CI/CD pipeline
- **Automate everything** repeatable
- **Monitor** before, during, after
- **Rollback** must be instant
- **Security** is not optional