import { formatMessage } from '@/utils/formatMessage'
import Redis from 'ioredis'
import { v4 as id } from 'uuid'
import { sendTelegramMessage } from '@/lib/telegram/index'
import { envServer } from '@/env'

async function establishRedisPub() {
  if (!global.global_redisPub) {
    global.global_redisPub = new Redis({
      host: envServer.REDIS_HOST,
      port: envServer.REDIS_PORT,
    })
    process.once('SIGINT', () => {
      global.global_redisPub!.quit()
      console.info('RedisPub connection closed.')
    })
    process.once('SIGTERM', () => {
      global.global_redisPub!.quit()
      console.info('RedisPub connection closed.')
    })
    if (process.env.BUILD_TIME !== 'true') {
      await redisPubPing()
    }
  }
  return global.global_redisPub
}

async function redisPubPing() {
  try {
    const result = await global.global_redisPub!.ping()
    if (result === 'PONG') {
      console.info('RedisPub connected successfully.')
    }
  } catch (e) {
    const message = formatMessage(
      id(),
      '@/lib/redis/redisPub.ts redisPubPing()',
      'RedisPub connection failed.',
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    process.exit(1)
  }
}

export const redisPub = await establishRedisPub()
