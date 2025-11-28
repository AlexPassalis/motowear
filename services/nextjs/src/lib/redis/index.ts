import Redis from 'ioredis'
import { envServer } from '@/envServer'
import { formatMessage } from '@/utils/error/formatMessage'
import { ERROR } from '@/data/magic'

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
    console.info(`${ERROR.redis} connection closed.`)
  })
  process.once('SIGTERM', async () => {
    await global.global_redis!.quit()
    console.info(`${ERROR.redis} connection closed.`)
  })
  process.once('SIGTERM', async () => {
    await global.global_redis!.quit()
    console.info(`${ERROR.redis} connection closed.`)
  })

  await redisPing()

  return global.global_redis
}

async function redisPing() {
  try {
    const result = await global.global_redis!.ping()
    if (result === 'PONG') {
      console.info(`${ERROR.redis} connected successfully`)
    }
  } catch (err) {
    const location = `${ERROR.redis} connection failed.`
    const message = formatMessage(location, err)
    console.error(message)
    process.exit(1)
  }
}

export const redis =
  process.env.BUILD_TIME !== 'true' ? await establishRedis() : ({} as Redis)
