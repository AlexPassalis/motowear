import Redis from 'ioredis'
import { envServer } from '@/envServer'
import { formatMessage } from '@/utils/error/formatMessage'

async function establishRedis() {
  if (global.global_redis) {
    return global.global_redis
  }

  global.global_redis = new Redis({
    host: envServer.REDIS_HOST,
    port: envServer.REDIS_PORT,
  })
  process.once('SIGINT', async () => {
    await global.global_redis!.quit()
    console.info('Redis connection closed.')
  })
  process.once('SIGTERM', async () => {
    await global.global_redis!.quit()
    console.info('Redis connection closed.')
  })
  await redisPing()

  return global.global_redis
}

async function redisPing() {
  try {
    const result = await global.global_redis!.ping()
    if (result === 'PONG') {
      console.info('Redis connected successfully.')
    }
  } catch (err) {
    const message = formatMessage(
      '@/lib/redis/index.ts redisPing()',
      'Redis connection failed.',
      err,
    )
    console.error(message)

    process.exit(1)
  }
}

export const redis =
  process.env.BUILD_TIME !== 'true' ? await establishRedis() : ({} as Redis)
