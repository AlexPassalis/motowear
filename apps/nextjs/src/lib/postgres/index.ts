import { Pool, types } from 'pg'
import { readSecret } from '@/utils/readSecret'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/lib/postgres/schema'
import { sql } from 'drizzle-orm'

async function establishPostgres() {
  if (!global.postgres) {
    const postgresPool = new Pool({
      connectionString: readSecret('POSTGRES_URL'),
      max: process.env.POSTGRES_MIGRATING === 'true' ? 1 : undefined,
      ssl: false,
    })
    process.once('SIGINT', () => postgresPool.end())
    process.once('SIGTERM', () => postgresPool.end())
    global.postgres = drizzle(postgresPool, { schema })
    if (process.env.BUILD_TIME !== 'true') {
      await postgresPing()
    }
  }
  return global.postgres
}

async function postgresPing() {
  try {
    await global.postgres!.execute(sql`SELECT 1`)
    console.log('Postgres connected successfully')
  } catch (e) {
    console.error(
      `Location: src/lib/postgres/index\nMessage: Postgres connection failed\nError: ${e}.`
    )
    process.exit(1)
  }
}

types.setTypeParser(types.builtins.NUMERIC, (value: null | string) =>
  value === null ? null : parseFloat(value)
)

export const postgres = await establishPostgres()
