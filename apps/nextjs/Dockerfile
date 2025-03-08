FROM node:20-alpine AS base
# Install curl for the healthcheck
RUN apk add --no-cache curl

FROM base AS deps
WORKDIR /app
COPY ./package.json ./pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm i --frozen-lockfile



FROM deps AS dev
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ENV WATCHPACK_POLLING=true
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["pnpm", "run", "dev"]



FROM deps AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build



FROM build AS start
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

CMD ["node", "server.js"]
