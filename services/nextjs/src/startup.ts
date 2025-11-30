import '@/envServer'
console.info('envServer loaded successfully')
import '@/lib/redis/index'
import '@/lib/telegram/index'
import '@/lib/postgres/index'
import '@/lib/cron/index'
import '@/lib/prometheus/index'

import { run_migrations } from '@/lib/postgres/run_migrations'
import { run_scripts } from '@/scripts/index'
import { flush_all } from './lib/redis/flush_all'

async function startup() {
  await run_migrations()
  await run_scripts()
  // await flush_all()
}

if (process.env.BUILD_TIME !== 'true') {
  await startup()

  console.info('Startup completed successfully')
}

export {} // To make this a module
