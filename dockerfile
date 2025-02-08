# Stage 1: Base Stage
FROM node:20-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Stage 2: Builder Stage
FROM base AS builder

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

RUN npm run build

# Stage 3: Production Stage
FROM base AS production

ENV NODE_ENV=production PORT=${PORT}

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Install production dependencies only
RUN npm ci --only=production

EXPOSE ${PORT}
CMD ["node", "dist/index.js"]

# Stage 4: Development Stage
FROM base AS development

ENV NODE_ENV=development PORT=9000

WORKDIR /app

COPY --from=builder /app ./
RUN npm install

EXPOSE ${PORT}
CMD ["npx", "nodemon", "src/index.ts"]
