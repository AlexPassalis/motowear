import '@/envServer'
import '@/lib/redis/index'
import '@/lib/telegram/index'
import '@/lib/postgres/index'
import '@/lib/cron/index'
import '@/lib/prometheus/index'

import { run_migrations } from '@/lib/postgres/run_migrations'
import { flush_all } from './lib/redis/flush_all'

export async function startup() {
  await run_migrations()
  await flush_all()

  console.info('Startup completed successfully')
}
