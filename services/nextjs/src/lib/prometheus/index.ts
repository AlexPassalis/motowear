import type { Registry } from 'prom-client'

import { postgres_pool } from '@/lib/postgres/index'
import { redis } from '@/lib/redis/index'

import client from 'prom-client'
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

async function establishPrometheus() {
  if (global.global_prometheus_registry) {
    return global.global_prometheus_registry
  }

  try {
    global.global_prometheus_registry = new client.Registry()
    client.collectDefaultMetrics({
      register: global.global_prometheus_registry,
    })

    console.info(`${ERROR.prometheus} connected successfully`)
  } catch (err) {
    const location = `${ERROR.prometheus} connection failed.`
    handleError(location, err)

    process.exit(1)
  }

  new client.Gauge({
    name: 'nextjs_postgres_connections',
    help: 'Number of active PostgreSQL connections',
    registers: [global.global_prometheus_registry!],
    collect() {
      try {
        this.set(postgres_pool.totalCount)

        console.info(
          `${ERROR.postgres} ${ERROR.prometheus} client connected successfully`,
        )
      } catch (err) {
        const location = `${ERROR.postgres} nextjs_postgres_connections`
        handleError(location, err)
      }
    },
  })

  new client.Gauge({
    name: 'nextjs_redis_memory_bytes',
    help: 'Redis memory usage in bytes',
    registers: [global.global_prometheus_registry!],
    async collect() {
      try {
        const info = await redis.info('memory')
        const match = info.match(/used_memory:(\d+)/)
        if (match) {
          this.set(parseInt(match[1], 10))
        }

        console.info(
          `${ERROR.redis} ${ERROR.prometheus} client connected successfully`,
        )
      } catch (err) {
        const location = `${ERROR.redis} nextjs_redis_memory_bytes`
        handleError(location, err)
      }
    },
  })

  return global.global_prometheus_registry
}

export const prometheus =
  process.env.BUILD_TIME !== 'true'
    ? await establishPrometheus()
    : ({} as Registry)
