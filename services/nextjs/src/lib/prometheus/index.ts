import type { Registry } from 'prom-client'

import '@/lib/postgres/index'
import '@/lib/redis/index'

import client from 'prom-client'
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

async function establishPrometheus() {
  if (global.global_prometheus_registry) {
    return global.global_prometheus_registry
  }

  global.global_prometheus_registry = new client.Registry()
  client.collectDefaultMetrics({ register: global.global_prometheus_registry })

  new client.Gauge({
    name: 'nextjs_postgres_connections',
    help: 'Number of active PostgreSQL connections',
    registers: [global.global_prometheus_registry],
    collect() {
      try {
        if (global.global_postgres_pool) {
          this.set(global.global_postgres_pool.totalCount)
        }
      } catch (err) {
        const location = `${ERROR.postgres} nextjs_postgres_connections`
        handleError(location, err)
      }
    },
  })

  new client.Gauge({
    name: 'nextjs_redis_memory_bytes',
    help: 'Redis memory usage in bytes',
    registers: [global.global_prometheus_registry],
    async collect() {
      try {
        if (global.global_redis) {
          const info = await global.global_redis.info('memory')
          const match = info.match(/used_memory:(\d+)/)
          if (match) {
            this.set(parseInt(match[1], 10))
          }
        }
      } catch (err) {
        const location = `${ERROR.redis} nextjs_redis_memory_bytes`
        handleError(location, err)
      }
    },
  })

  console.info('Prometheus connected successfully.')

  return global.global_prometheus_registry
}

export const prometheus =
  process.env.BUILD_TIME !== 'true'
    ? await establishPrometheus()
    : ({} as Registry)
