# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the full-stack e-commerce website for motowear.gr, a Greek motorcycle accessories and apparel store. The application is deployed using Docker Stack with container orchestration.

**Stack:**
- **Next.js 15** (React 19) - Full-stack application at `services/nextjs/`
- **PostgreSQL** - Relational database with Drizzle ORM
- **Typesense** - Search engine
- **MinIO** - S3-compatible object storage
- **Redis** - Caching and queuing
- **Nginx** - Reverse proxy and TLS termination

**Key integrations:**
- Viva.com (payments)
- Aftersales/EasyShipping (logistics)
- Prosvasis Go (invoicing)
- Amazon SES (transactional email via Nodemailer)
- Better Auth (admin authentication)
- Telegram (notifications via Telegraf)

## Development Commands

All development happens in the Next.js service at `services/nextjs/`:

```bash
cd services/nextjs

# Development server
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Email template development
pnpm react-email

# Database schema generation and migration
pnpm postgres:generate  # Generate migrations from schema changes
pnpm postgres:migrate   # Push schema changes to database

# Production build (requires BUILD_TIME=true)
pnpm build

# Production start
pnpm start
```

## Docker Commands

From the repository root:

```bash
# Development stack
make docker-dev

# Production stack
make docker

# Other utilities
make 64           # Generate random base64 secret
make git-crypt    # Check git-crypt encrypted files
make lines-code   # Count lines of code
```

The Docker build process is defined in:
- `docker-stack-dev.yaml` - Development configuration
- `docker-stack.yaml` - Production configuration
- Individual Dockerfiles in each service directory

## Architecture

### Directory Structure

```
services/nextjs/src/
├── app/                    # Next.js App Router
│   ├── (user)/            # Public-facing routes
│   │   ├── page.tsx       # Homepage
│   │   ├── checkout/      # Checkout flow
│   │   ├── collection/    # Product collections
│   │   └── product/       # Product detail pages
│   ├── admin/             # Admin dashboard (auth required)
│   │   ├── home/          # Homepage management
│   │   ├── product/       # Product management
│   │   └── order/         # Order management
│   ├── api/               # API routes
│   │   ├── admin/         # Admin API endpoints
│   │   ├── user/          # User-facing endpoints
│   │   └── nextjs/        # Internal endpoints
│   └── layout.tsx         # Root layout
├── components/            # Shared React components
├── lib/                   # Library integrations
│   ├── better-auth/       # Admin authentication setup
│   ├── postgres/          # Database schema and client
│   │   ├── schema.ts      # Drizzle schema definitions
│   │   ├── data/          # Type definitions and Zod schemas
│   │   └── migrations/    # Database migrations
│   ├── react-email/       # Email templates
│   ├── redis/             # Redis client
│   ├── typesense/         # Search client
│   ├── minio/             # Object storage client
│   ├── telegram/          # Telegram bot
│   ├── nodemailer/        # Email sending
│   └── cron/              # Scheduled tasks
├── utils/                 # Utility functions
│   ├── readSecret.ts      # Docker secrets reader
│   └── ...
├── data/                  # Constants and configuration
├── context/               # React Context providers
└── middleware.ts          # Next.js middleware (auth, sessions)
```

### Database Architecture

The database uses **Drizzle ORM** with PostgreSQL schemas:

- `public` - Default schema
- `auth` - Better Auth tables (users, sessions, accounts)
- `pages` - CMS data (home_page, product_pages)
- `products` - Product catalog (brand, variant)
- `orders` - Order management (order, coupon, abandoned_cart)
- `reviews` - Product reviews
- `other` - Misc data (shipping, daily_session)

Schema is defined in `services/nextjs/src/lib/postgres/schema.ts`. After making changes, run:
1. `pnpm postgres:generate` to create migrations
2. `pnpm postgres:migrate` to apply changes

### Secrets Management

Secrets are managed using **git-crypt** for encryption in the repository. At runtime, Docker Swarm secrets are mounted at `/run/secrets/` and accessed via `readSecret()` utility.

Build-time operations set `BUILD_TIME=true` to bypass secret reading (returns dummy values).

### Authentication

- **Admin authentication**: Better Auth with session cookies
- **Admin access**: Custom middleware checks for `admin` cookie (base64 encoded) at `/admin/*` routes
- **Session tracking**: Daily session tracking via middleware for analytics

### Environment Configuration

Three environment files:
- `env.ts` - Shared constants
- `envClient.ts` - Client-side environment variables
- `envServer.ts` - Server-side configuration (secrets, API keys)

Development vs. production behavior is controlled by `NODE_ENV` checks in `envServer.ts`.

### API Structure

API routes follow Next.js 15 App Router conventions:

- `app/api/admin/*` - Admin operations (require auth)
- `app/api/user/*` - User operations (email, reviews, coupons)
- `app/api/nextjs/*` - Internal Next.js endpoints

Some legacy endpoints still use Pages Router at `src/pages/api/admin/`.

### Client/Server Pattern

Pages use a common pattern:
- `page.tsx` - Server component (data fetching)
- `client.tsx` - Client component (interactivity)

Server components fetch data directly from PostgreSQL/Redis, client components handle forms and UI interactions.

### Styling

- **Tailwind CSS** - Utility-first styling
- **Mantine v7/v8** - Component library (gradual migration from v7 to v8)
- Custom CSS modules in `src/css/`

### Linting

Husky + lint-staged runs `pnpm lint` on staged Next.js files before commits. Configuration in `.lintstagedrc`.

## Code Style Guidelines

When writing or modifying code in this repository, follow these conventions:

### Control Flow Braces
**ALWAYS use curly braces `{}` for all control structures**, even single-line statements:

```typescript
// ✅ CORRECT
if (condition) {
  doSomething()
}

if (value) {
  return result
}

for (const item of items) {
  process(item)
}

// ❌ INCORRECT - Never omit braces
if (condition) doSomething()
if (value) return result
for (const item of items) process(item)
```

This applies to:
- `if`, `else if`, `else` statements
- `for`, `while`, `do-while` loops
- `switch` cases (when containing single statements)

This convention prevents bugs when adding additional statements and maintains consistent code style throughout the codebase.

## Common Workflows

### Adding a new product type
1. Update database schema in `lib/postgres/schema.ts`
2. Run `pnpm postgres:generate && pnpm postgres:migrate`
3. Update Zod schemas in `lib/postgres/data/zod.ts`
4. Create admin UI in `app/admin/product/[product_type]/`
5. Create user-facing pages in `app/(user)/product/` or `app/(user)/collection/`
6. Update Typesense index if searchable

### Adding a new API endpoint
1. Create route handler at `app/api/{admin|user}/[endpoint]/route.ts`
2. Use `postgres` client from `@/lib/postgres` for database operations
3. Handle errors with `formatMessage()` and `sendTelegramMessage()`
4. For admin endpoints, verify session with `isSession()` from `@/lib/better-auth/isSession`

### Modifying email templates
1. Edit or create templates in `lib/react-email/`
2. Run `pnpm react-email` to preview changes
3. Templates are compiled at build time and sent via Nodemailer + Amazon SES

### Working with images
- Images uploaded to MinIO (S3-compatible)
- Public access at `https://motowear.gr/motowear/`
- Use `MINIO_PUBLIC_URL` from `envServer`
- Upload/delete operations in `lib/minio/`

## Testing

The codebase does not currently have a test suite. Manual testing is performed locally via `pnpm dev` and in staging via Docker development stack.

## Deployment

CI/CD via GitHub Actions deploys to VPS using Docker Stack. The deployment:
1. Builds images for postgres, typesense, nextjs, and nginx
2. Pushes to GitHub Container Registry
3. Deploys via `docker stack deploy` with production configuration

Branch: `main`
