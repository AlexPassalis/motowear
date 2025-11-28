import '@/envServer'
import '@/lib/redis/index'
import '@/lib/telegram/index'
import '@/lib/postgres/index'
import '@/lib/cron/index'
import '@/lib/prometheus/index'

import { run_migrations } from '@/lib/postgres/run_migrations'
import { redis } from '@/lib/redis/index'
import { ERROR } from './data/magic'
import { formatMessage } from '@/utils/error/formatMessage'

export async function startup() {
  await run_migrations()

  try {
    await redis.flushall()

    console.info('Redis cache cleared successfully')
  } catch (err) {
    const location = `${ERROR.redis} startup() flushall`
    const message = formatMessage(location, err)

    console.error(message)
  }

  console.info('Startup completed successfully')
}
