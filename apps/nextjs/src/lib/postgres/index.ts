import { Pool, types } from 'pg'
import { readSecret } from '@/utils/readSecret'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/lib/postgres/schema'
import { sql } from 'drizzle-orm'

types.setTypeParser(types.builtins.NUMERIC, (value: null | string) =>
  value === null ? null : parseFloat(value)
)

const postgresPool = new Pool({
  connectionString: readSecret('POSTGRES_URL'),
  max: process.env.POSTGRES_MIGRATING === 'true' ? 1 : undefined,
  ssl: false,
})

export const postgres = drizzle(postgresPool, { schema })

async function postgresPing() {
  try {
    await postgres.execute(sql`SELECT 1`)
    console.log('Postgres connected successfully')
  } catch (e) {
    console.error(e)
    console.log('Postgres connection failed')
    process.exit(1)
  }
}
postgresPing()
