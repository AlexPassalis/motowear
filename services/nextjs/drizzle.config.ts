import { readSecret } from './src/utils/readSecret'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: readSecret('POSTGRES_URL'),
  },
  schemaFilter: [
    'public',
    'auth',
    'pages',
    'products',
    'orders',
    'reviews',
    'other',
  ],
  schema: './src/lib/postgres/schema.ts',
  out: './src/lib/postgres/migrations',
  verbose: true,
  strict: true,
})
