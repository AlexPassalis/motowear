# CLAUDE.md

## Project Overview

Full-stack e-commerce website for motowear.gr, a Greek motorcycle accessories store. Next.js 15 (React 19) full-stack app at `services/nextjs/`, PostgreSQL with Drizzle ORM, Typesense search, MinIO (S3), Redis caching, Nginx reverse proxy. Integrations: Viva.com (payments), Aftersales/EasyShipping (logistics), Prosvasis Go (invoicing), Amazon SES (email), Better Auth (admin auth), Telegram (notifications).

## Code Style

- No code comments
- snake_case for variables and functions; PascalCase for React components
- Always use curly braces `{}` for control structures, even single-line
- Blank line before `return` or `throw` when preceded by other code
- Server/client pattern: `page.tsx` (server component), `client.tsx` (client component)

```typescript
function process_order(order_id: string) {
    const order_data = fetchOrder(order_id)
    validateOrder(order_data)

    return order_data
}
```

## Commands

All commands run from `services/nextjs/`:

- `pnpm dev`: Development server
- `pnpm typecheck`: Type checking
- `pnpm lint`: Linting
- `pnpm postgres:generate`: Generate migrations from schema changes
- `pnpm postgres:migrate`: Apply migrations
- `pnpm react-email`: Email template development

From repository root:

- `make start`: Start development Docker stack
- `make stop`: Stop development stack
- `make docker`: Production stack
