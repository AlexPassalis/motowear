import type { Registry } from 'prom-client'

import client from 'prom-client'

async function establishPrometheus() {
  if (global.global_prometheus_registry) {
    return global.global_prometheus_registry
  }

  global.global_prometheus_registry = new client.Registry()
  client.collectDefaultMetrics({ register: global.global_prometheus_registry })
  console.info('Prometheus client connected successfully.')

  return global.global_prometheus_registry
}

export const prometheus =
  process.env.BUILD_TIME !== 'true'
    ? await establishPrometheus()
    : ({} as Registry)
