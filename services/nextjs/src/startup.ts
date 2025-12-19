import '@/envServer'
console.info('envServer loaded successfully')
import '@/lib/redis/index'
import '@/lib/telegram/index'
import '@/lib/postgres/index'
import '@/lib/cron/index'
import '@/lib/prometheus/index'

import { run_migrations } from '@/lib/postgres/run_migrations'
import { run_scripts } from '@/scripts/index'

async function startup() {
  await run_migrations()
  await run_scripts()
  global.global_startup_completed = true
  console.info('Startup completed successfully')
}

if (process.env.BUILD_TIME !== 'true') {
  if (!global.global_startup_completed) {
    await startup()
  }
}

export {} // To make this a module
