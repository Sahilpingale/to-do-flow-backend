# Docker Deployment Flow Diagram

## 1. Overall Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                DOCKER DEPLOYMENT FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Source Code   │    │   Dockerfile    │    │ Docker Compose  │    │ GitHub Actions  │
│                 │    │                 │    │     Files       │    │   (deploy.yml)  │
│   • TypeScript  │───▶│  Multi-Stage    │───▶│                 │───▶│                 │
│   • Prisma      │    │  Build Process  │    │ • Production    │    │ • Automated     │
│   • Package.json│    │                 │    │ • Development   │    │   Deployment    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 2. Dockerfile Multi-Stage Build Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                DOCKERFILE STAGES                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   Stage 1       │
│   BASE          │
│                 │
│ • Node.js 20    │
│ • OpenSSL       │
│ • Workdir /app  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Stage 2       │
│   BUILDER       │
│                 │
│ • Install deps  │
│ • Generate      │
│   Prisma client │
│ • Build TS→JS   │
│ • Gen Swagger   │
└─────────┬───────┘
          │
          ├─────────────────┐
          ▼                 ▼
┌─────────────────┐    ┌─────────────────┐
│   Stage 3       │    │   Stage 4       │
│   PRODUCTION    │    │   DEVELOPMENT   │
│                 │    │                 │
│ • Prod deps     │    │ • All deps      │
│ • Built JS      │    │ • Source code   │
│ • Small size    │    │ • Hot reload    │
│ • node dist/    │    │ • nodemon       │
└─────────────────┘    └─────────────────┘
```

## 3. Docker Compose Files Usage

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           DOCKER COMPOSE ORCHESTRATION                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                PRODUCTION                                           │
│   docker-compose.yml                                                                │
│                                                                                     │
│   ┌─────────────────┐              ┌─────────────────┐                              │
│   │ app-production  │              │ db-production   │                              │
│   │                 │              │                 │                              │
│   │ • Dockerfile    │◄─────────────┤ • PostgreSQL 16 │                              │
│   │   target: prod  │              │ • Port 5432     │                              │
│   │ • Port 9000     │              │ • Persistent    │                              │
│   │ • Depends on DB │              │   Volume        │                              │
│   └─────────────────┘              │ • Health Check  │                              │
│                                     └─────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               DEVELOPMENT                                           │
│   docker-compose.dev.yml                                                            │
│                                                                                     │
│   ┌─────────────────┐              ┌─────────────────┐                              │
│   │ app-development │              │ db-development  │                              │
│   │                 │              │                 │                              │
│   │ • Dockerfile    │◄─────────────┤ • PostgreSQL 16 │                              │
│   │   target: dev   │              │ • Port 5432     │                              │
│   │ • Port 9001     │              │ • Persistent    │                              │
│   │ • Volume Mount  │              │   Volume        │                              │
│   │ • Hot Reload    │              │ • Health Check  │                              │
│   └─────────────────┘              └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 4. GitHub Actions Deployment Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           GITHUB ACTIONS DEPLOYMENT                                 │
│                                (.github/workflows/deploy.yml)                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   1. TRIGGER    │    │   2. SETUP      │    │   3. TRANSFER   │    │   4. DEPLOY     │
│                 │    │                 │    │                 │    │                 │
│ • Push to main  │───▶│ • Checkout code │───▶│ • Setup SSH     │───▶│ • Create .env   │
│ • Auto trigger  │    │ • Setup SSH     │    │ • rsync files   │    │ • Pull images   │
│                 │    │   keys          │    │   to EC2        │    │ • Build & run   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                                                │
                                                                                ▼
                                                                     ┌─────────────────┐
                                                                     │   5. MIGRATE    │
                                                                     │                 │
                                                                     │ • Wait for DB   │
                                                                     │ • Run migrations│
                                                                     │ • Cleanup       │
                                                                     └─────────────────┘
```

## 5. File Relationship Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              FILE RELATIONSHIPS                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

File                 │ Uses/References                │ Used By
─────────────────────┼────────────────────────────────┼─────────────────────────────
Dockerfile           │ • package.json                 │ • docker-compose.yml
                     │ • prisma/ folder               │ • docker-compose.dev.yml
                     │ • Source code                  │ • GitHub Actions
─────────────────────┼────────────────────────────────┼─────────────────────────────
docker-compose.yml   │ • Dockerfile (prod stage)     │ • GitHub Actions (deploy.yml)
                     │ • .env.production              │ • npm script (docker:prod)
─────────────────────┼────────────────────────────────┼─────────────────────────────
docker-compose.dev.yml│ • Dockerfile (dev stage)     │ • npm script (docker:dev)
                     │ • .env.development             │ • Local development
─────────────────────┼────────────────────────────────┼─────────────────────────────
deploy.yml           │ • docker-compose.yml          │ • GitHub Actions (auto)
                     │ • SSH keys (secrets)           │ • Push to main branch
                     │ • Environment variables        │
```

## 6. Deployment Command Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT COMMAND SEQUENCE                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

SSH to EC2 Instance
│
├─1. cd /home/user/app
├─2. echo "NODE_ENV=production" > .env.production
├─3. echo "PORT=9000" >> .env.production
├─4. ... (other env vars)
│
├─5. docker compose --env-file .env.production pull
│    │
│    └─▶ Downloads base images (node:20-slim, postgres:16)
│
├─6. docker compose --env-file .env.production up -d --build app-production db-production
│    │
│    ├─▶ Builds app-production using Dockerfile (production stage)
│    ├─▶ Starts db-production (PostgreSQL)
│    └─▶ Runs in detached mode (-d)
│
├─7. until docker compose exec -T db-production pg_isready; do sleep 2; done
│    │
│    └─▶ Waits for database to be ready
│
├─8. docker compose exec -T app-production npx prisma migrate deploy
│    │
│    └─▶ Runs migrations inside production container
│
└─9. docker system prune -f
     │
     └─▶ Cleans up unused images/containers
```

## 7. Environment Variables Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ENVIRONMENT VARIABLES FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

GitHub Secrets
│
├─ SSH_PRIVATE_KEY ───────────────────────────────┐
├─ AWS_EC2_USERNAME ──────────────────────────────┤
├─ AWS_EC2_HOST ──────────────────────────────────┤
├─ PORT ──────────────────────────────────────────┤
├─ DATABASE_URL ──────────────────────────────────┤
├─ FIREBASE_* (multiple) ─────────────────────────┤
└─ BACKEND_URL ───────────────────────────────────┤
                                                   │
                                                   ▼
                                        .env.production (Created on EC2)
                                                   │
                                                   ▼
                                        Docker Compose (--env-file)
                                                   │
                                                   ▼
                                        Container Environment Variables
                                                   │
                                                   ▼
                                        Application Runtime
```

## 8. Quick Reference Commands

```bash
# Development
npm run docker:dev
# └─▶ docker compose --env-file .env.development --file docker-compose.dev.yml up --build

# Production (Local)
npm run docker:prod
# └─▶ docker compose --env-file .env.production --file docker-compose.yml up --build

# Production (EC2 via GitHub Actions)
# Triggered by: git push origin main
# Runs: docker compose --env-file .env.production up -d --build app-production db-production
```

## 9. Data Flow Summary

```
Source Code → Dockerfile → Docker Images → Docker Compose → GitHub Actions → EC2 Production

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Local     │    │   Multi     │    │   Service   │    │   Auto      │    │   Live      │
│  Development│───▶│   Stage     │───▶│   Orches    │───▶│   Deploy    │───▶│   Production│
│             │    │   Build     │    │   tration   │    │   ment      │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

**To convert this to PDF:**

1. Copy this content to a Markdown editor
2. Use tools like:
   - Typora (export to PDF)
   - Pandoc: `pandoc docker-flow-diagram.md -o docker-flow-diagram.pdf`
   - VS Code with Markdown PDF extension
   - Online converters like markdown-pdf.com

**For Visual Diagrams:**

- Use draw.io, Lucidchart, or Miro to create professional flowcharts
- This text-based diagram provides the exact structure to follow
