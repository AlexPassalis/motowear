import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { Pool } from 'pg'
import { envServer } from '@/envServer'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/lib/postgres/schema'
import { sql } from 'drizzle-orm'
import { formatMessage } from '@/utils/error/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram/index'

async function establishPostgres() {
  if (global.global_postgres_pool && global.global_postgres) {
    return {
      postgres_pool: global.global_postgres_pool,
      postgres: global.global_postgres,
    }
  }

  global.global_postgres_pool = new Pool({
    connectionString: envServer.POSTGRES_URL,
    ssl: false,
  })
  process.once('SIGINT', async () => {
    await global.global_postgres_pool!.end()
    console.info('Postgres connection closed.')
  })
  process.once('SIGTERM', async () => {
    await global.global_postgres_pool!.end()
    console.info('Postgres connection closed.')
  })
  global.global_postgres = drizzle(global.global_postgres_pool, { schema })
  await postgresPing()

  return {
    postgres_pool: global.global_postgres_pool,
    postgres: global.global_postgres,
  }
}

async function postgresPing() {
  try {
    await global.global_postgres!.execute(sql`SELECT 1`)
    console.info('Postgres connected successfully.')
  } catch (err) {
    const message = formatMessage(
      '@/lib/postgres/index.ts postgresPing()',
      'Postgres connection failed.',
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    process.exit(1)
  }
}

const result =
  process.env.BUILD_TIME !== 'true'
    ? await establishPostgres()
    : {
        postgres: {} as NodePgDatabase<typeof schema> & { $client: Pool },
        postgres_pool: {} as Pool,
      }

export const postgres = result.postgres
export const postgres_pool = result.postgres_pool
