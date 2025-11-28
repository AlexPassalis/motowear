# Claude Task Log

Last updated: 2025-11-26

## Current Tasks

- [ ] Refactor product database schema to separate product and variant data
  - Create new `product` table with shared fields: name, description, brand, price, price_before, upsell
  - Update `variant` table to only contain variant-specific fields: images, color, size, sold_out
  - Add foreign key relationship from variant to product
  - Remove `index` field from both tables (will sort alphabetically instead)
  - Files involved: `services/nextjs/src/lib/postgres/schema.ts`, related Zod schemas
  - Migration strategy: Extract distinct products from variants, link variants to products, drop redundant columns

## Recently Completed

- [x] Added "Task Log" section to CLAUDE.md (2025-11-26)
- [x] Created docs/claude_log.md with template format (2025-11-26)

## Blockers / Notes

- None currently

## Next Steps

- Maintain this log throughout development sessions
- Update after completing significant tasks
- Review at start of each new session for context
