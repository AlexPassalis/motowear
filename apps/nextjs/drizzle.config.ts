import { readSecret } from './src/utils/readSecret'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: readSecret('POSTGRES_URL'),
  },
  schemaFilter: ['public', 'auth', 'metrics'], // remove 'product' schema after the first migration, so that tables are not dropped.
  schema: './src/lib/postgres/schema.ts',
  out: './src/lib/postgres/migrations',
  verbose: true,
  strict: false,
})
