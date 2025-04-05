import { formatMessage } from '@/utils/formatMessage'
import Redis from 'ioredis'
import { v4 as id } from 'uuid'
import { sendTelegramMessage } from '@/lib/telegram/index'
import { envServer } from '@/env'
import { errorRedis } from '@/data/error'
import { revalidateTag } from 'next/cache'

async function establishRedisSub() {
  if (!global.global_redisSub) {
    global.global_redisSub = new Redis({
      host: envServer.REDIS_HOST,
      port: envServer.REDIS_PORT,
    })
    process.once('SIGINT', () => {
      global.global_redisSub!.quit()
      console.info('RedisSub connection closed.')
    })
    process.once('SIGTERM', () => {
      global.global_redisSub!.quit()
      console.info('RedisSub connection closed.')
    })
    if (process.env.BUILD_TIME !== 'true') {
      await redisSubPing()
      global.global_redisSub.subscribe(
        envServer.REDIS_CACHE_INVALIDATION_CHANNEL,
        err => {
          if (err) {
            const message = formatMessage(
              id(),
              '@/lib/redis/redisSub.ts establishRedisSub() subscribe',
              `RedisSub connection to ${envServer.REDIS_CACHE_INVALIDATION_CHANNEL} failed.`,
              err
            )
            console.error(message)
            sendTelegramMessage('ERROR', message)
            process.exit(1)
          }
          console.info(
            `RedisSub connected successfully to ${envServer.REDIS_CACHE_INVALIDATION_CHANNEL}.`
          )
        }
      )
      global.global_redisSub.on('message', (channel, message) => {
        if (channel === envServer.REDIS_CACHE_INVALIDATION_CHANNEL) {
          try {
            const { tag }: { tag: 'product_types' | 'variants' } =
              JSON.parse(message)
            console.log('message received : ', message)
            revalidateTag(tag)
          } catch (e) {
            const message = formatMessage(
              id(),
              '@/lib/redis/index.ts establishRedisSub() on',
              errorRedis,
              e
            )
            console.error(message)
            sendTelegramMessage('ERROR', message)
          }
        }
      })
    }
  }
  return global.global_redisSub
}

async function redisSubPing() {
  try {
    const result = await global.global_redisSub!.ping()
    if (result === 'PONG') {
      console.info('RedisSub connected successfully.')
    }
  } catch (e) {
    const message = formatMessage(
      id(),
      '@/lib/redis/redisSub.ts redisSubPing()',
      'RedisSub connection failed.',
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    process.exit(1)
  }
}

export const redisSub = await establishRedisSub()
