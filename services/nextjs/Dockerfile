FROM node:20-alpine3.20 AS base
# Install curl for the healthcheck
RUN apk add --no-cache curl

FROM base AS deps
WORKDIR /app/deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate && pnpm i --frozen-lockfile



FROM deps AS dev
WORKDIR /app
COPY . . 
COPY --from=deps /app/deps/node_modules ./node_modules
RUN rm -rf /app/deps

ENV WATCHPACK_POLLING=true
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["pnpm", "run", "dev"]



FROM deps AS build
WORKDIR /app/migrate
COPY --from=deps /app/deps/package.json ./
COPY --from=deps /app/deps/pnpm-lock.yaml ./
COPY --from=deps /app/deps/node_modules ./node_modules
COPY ./drizzle.config.ts ./
COPY ./src/utils/readSecret.ts ./src/utils/
COPY ./src/lib/postgres/ ./src/lib/postgres/

WORKDIR /app/build
COPY . .
COPY --from=deps /app/deps/node_modules ./node_modules
RUN rm -rf /app/deps

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build



FROM build AS start
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/migrate ./migrate
COPY --from=build --chown=nextjs:nodejs /app/build/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/build/.next/static ./.next/static
COPY --chown=nextjs:nodejs ./public ./public
RUN rm -rf /app/build

USER nextjs
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

CMD ["node", "server.js"]
