import { redis } from '@/lib/redis/index'
import { ERROR } from '@/data/magic'
import { formatMessage } from '@/utils/error/formatMessage'

export async function flush_all() {
  try {
    await redis.flushall()

    console.info('Redis cache cleared successfully')
  } catch (err) {
    const location = `${ERROR.redis} flush_all()`
    const message = formatMessage(location, err)
    console.error(message)

    process.exit(1)
  }
}
