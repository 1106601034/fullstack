# 9. Deployment Guide

[← Back to Index](./README.md) | [← Previous: Testing Strategy](./08-testing.md)

---

## 9.1 Environment Overview

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| **Development** | Local development | Docker Compose |
| **Staging** | Pre-production testing | Docker / Cloud VM |
| **Production** | Live system | Cloud (Azure/AWS/DigitalOcean) |

---

## 9.2 Local Development Setup

### Prerequisites

- Docker Desktop 4.x+
- .NET SDK 8.0
- Node.js 20 LTS
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/superstock.git
cd superstock

# Start infrastructure (PostgreSQL, Redis)
docker-compose up -d postgres redis

# Run database migrations
cd backend/SuperStock.API
dotnet ef database update

# Start backend (with hot reload)
dotnet watch run

# In another terminal - Start frontend
cd frontend
npm install
npm run dev
```

### Docker Compose (Full Stack)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: superstock-db
    environment:
      POSTGRES_USER: superstock
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devpassword}
      POSTGRES_DB: superstock
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U superstock"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: superstock-cache
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: superstock-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=superstock;Username=superstock;Password=${DB_PASSWORD:-devpassword}
      - ConnectionStrings__Redis=redis:6379
      - Jwt__Secret=${JWT_SECRET:-your-256-bit-secret-key-here}
    ports:
      - "5000:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: superstock-web
    environment:
      - VITE_API_URL=http://localhost:5000/api
    ports:
      - "3000:80"
    depends_on:
      - api

  hangfire:
    build:
      context: ./backend
      dockerfile: Dockerfile.hangfire
    container_name: superstock-jobs
    environment:
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=superstock;Username=superstock;Password=${DB_PASSWORD:-devpassword}
      - ConnectionStrings__Redis=redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:
```

### Environment Variables

Create `.env` file in project root:

```bash
# Database
DB_PASSWORD=your-secure-password

# Redis
REDIS_URL=redis:6379
REDIS_PASSWORD=  # Optional, set for production

# JWT
JWT_SECRET=your-256-bit-secret-key-minimum-32-characters

# API
ASPNETCORE_ENVIRONMENT=Development

# Frontend
VITE_API_URL=http://localhost:5000/api
```

---

## 9.3 Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Install healthcheck dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Non-root user for security
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "SuperStock.API.dll"]
```

## 9.4 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build
COPY . ./
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production image with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Frontend nginx.conf

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (if needed)
    location /api {
        proxy_pass http://api:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 9.5 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ============ Backend ============
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: superstock_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Restore dependencies
        run: dotnet restore
        working-directory: ./backend

      - name: Build
        run: dotnet build --no-restore
        working-directory: ./backend

      - name: Run tests
        run: dotnet test --no-build --verbosity normal --collect:"XPlat Code Coverage"
        working-directory: ./backend
        env:
          ConnectionStrings__DefaultConnection: "Host=localhost;Database=superstock_test;Username=test;Password=test"

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # ============ Frontend ============
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Lint
        run: npm run lint
        working-directory: ./frontend

      - name: Type check
        run: npm run type-check
        working-directory: ./frontend

      - name: Run tests
        run: npm run test:coverage
        working-directory: ./frontend

  # ============ Build & Push ============
  build:
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-api:${{ github.sha }}

      - name: Build and push Web image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-web:${{ github.sha }}
          build-args: |
            VITE_API_URL=${{ secrets.API_URL }}

  # ============ Deploy ============
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/superstock
            docker-compose pull
            docker-compose up -d --remove-orphans
            docker system prune -f
```

---

## 9.6 Database Migrations

### Running Migrations

```bash
# Development
cd backend/SuperStock.API
dotnet ef database update

# Generate new migration
dotnet ef migrations add AddNewFeature

# Rollback
dotnet ef database update PreviousMigrationName

# Production (via Docker)
docker exec -it superstock-api dotnet ef database update
```

### Migration Strategy

1. **Always backup** before production migrations
2. **Test migrations** on staging first
3. **Use transactions** for data migrations
4. **Avoid breaking changes** - add columns as nullable first

---

## 9.7 Production Deployment Checklist

### Pre-Deployment

- [ ] All tests passing in CI
- [ ] Database backup completed
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Health check endpoints working

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor logs for errors

### Post-Deployment

- [ ] Verify all endpoints responding
- [ ] Check database connections
- [ ] Monitor error rates
- [ ] Verify background jobs running

---

## 9.8 Cloud Deployment Options

### Option A: DigitalOcean (Recommended for Small Teams)

```bash
# Create droplet with Docker pre-installed
doctl compute droplet create superstock \
  --image docker-20-04 \
  --size s-2vcpu-4gb \
  --region nyc1

# Setup with docker-compose
scp docker-compose.prod.yml root@your-ip:/opt/superstock/
ssh root@your-ip "cd /opt/superstock && docker-compose up -d"
```

### Option B: Azure Container Apps

```bash
# Create resource group
az group create --name superstock-rg --location eastus

# Create container app environment
az containerapp env create \
  --name superstock-env \
  --resource-group superstock-rg \
  --location eastus

# Deploy API
az containerapp create \
  --name superstock-api \
  --resource-group superstock-rg \
  --environment superstock-env \
  --image ghcr.io/your-org/superstock-api:latest \
  --target-port 8080 \
  --ingress external
```

### Option C: AWS ECS

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name superstock

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster superstock \
  --service-name superstock-api \
  --task-definition superstock-api:1 \
  --desired-count 2
```

---

## 9.9 SSL/TLS Configuration

### Using Caddy (Automatic HTTPS)

```Caddyfile
# Caddyfile
superstock.yourdomain.com {
    reverse_proxy frontend:80

    handle /api/* {
        reverse_proxy api:8080
    }

    handle /hangfire/* {
        reverse_proxy api:8080
    }
}
```

### Using Certbot with nginx

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d superstock.yourdomain.com

# Auto-renewal (cron)
0 0 * * * certbot renew --quiet
```

---

[Next: Appendix →](./11-appendix.md)
