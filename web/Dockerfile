# syntax=docker.io/docker/dockerfile:1

# Embark India — Next.js 14 production Dockerfile
# Build: docker build -t embark-web ./web
# Run:  docker run -p 3000:3000 --env-file ./web/.env embark-web

FROM node:22-bookworm-slim AS base

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libpng-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder

# Runtime libraries required by the canvas native module during the build
# openssl is required so Prisma detects the OpenSSL 3.x binary target correctly.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpng16-16 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args / env defaults
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL=http://localhost:3000
ARG RAZORPAY_KEY_ID
ARG RAZORPAY_KEY_SECRET
ARG R2_ENDPOINT
ARG S3_BUCKET_NAME
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION=auto
ARG EMAIL_FROM
ARG EMAIL_SERVER

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
ENV RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
ENV R2_ENDPOINT=${R2_ENDPOINT}
ENV S3_BUCKET_NAME=${S3_BUCKET_NAME}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV AWS_REGION=${AWS_REGION}
ENV EMAIL_FROM=${EMAIL_FROM}
ENV EMAIL_SERVER=${EMAIL_SERVER}

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime libraries required by the canvas native module
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpng16-16 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output from the builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
