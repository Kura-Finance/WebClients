FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_REOWN_PROJECT_ID
ARG NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
ARG NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY
ARG NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_MONTHLY
ARG NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_YEARLY

# Set environment variables from build arguments
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_REOWN_PROJECT_ID=$NEXT_PUBLIC_REOWN_PROJECT_ID
ENV NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=$NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
ENV NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=$NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY
ENV NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_MONTHLY=$NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_MONTHLY
ENV NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_YEARLY=$NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_YEARLY

# Copy package files first
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY eslint.config.mjs ./
COPY postcss.config.mjs ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY app ./app
COPY public ./public

# Build Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('https').get('https://:${NEXT_PUBLIC_APP_URL}:${PORT:-8080}/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node_modules/.bin/next", "start"]
