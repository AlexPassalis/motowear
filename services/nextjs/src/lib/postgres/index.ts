  import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { Pool } from 'pg'
import { readSecret } from '@/utils/readSecret'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/lib/postgres/schema'
import { sql } from 'drizzle-orm'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram/index'

async function establishPostgres() {
  if (!global.global_postgres) {
    const postgresPool = new Pool({
      connectionString: readSecret('POSTGRES_URL'),
      ssl: false,
    })
    process.once('SIGINT', () => {
      postgresPool.end()
      console.info('Postgres connection closed.')
    })
    process.once('SIGTERM', () => {
      postgresPool.end()
      console.info('Postgres connection closed.')
    })
    global.global_postgres = drizzle(postgresPool, { schema })
    await postgresPing()
  }

  return global.global_postgres
}

async function postgresPing() {
  try {
    await global.global_postgres!.execute(sql`SELECT 1`)
    console.info('Postgres connected successfully.')
  } catch (e) {
    const message = formatMessage(
      '@/lib/postgres/index.ts postgresPing()',
      'Postgres connection failed.',
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    process.exit(1)
  }
}

export const postgres =
  process.env.BUILD_TIME !== 'true'
    ? await establishPostgres()
    : ({} as NodePgDatabase<typeof schema> & { $client: Pool })
