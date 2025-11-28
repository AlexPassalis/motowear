FROM node:20-alpine3.20 AS base
# Install curl for the healthcheck
RUN apk add --no-cache curl

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate && pnpm i --frozen-lockfile



FROM deps AS dev
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ENV WATCHPACK_POLLING=true
ENV NODE_ENV=development

CMD ["pnpm", "run", "dev"]



FROM deps AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN pnpm run build



FROM build AS start
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/src/lib/postgres/migrations ./src/lib/postgres/migrations

USER nextjs
ENV NODE_ENV=production

CMD ["node", "server.js"]
