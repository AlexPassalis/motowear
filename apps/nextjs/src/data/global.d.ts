import type { drizzle } from 'drizzle-orm/node-postgres'
import type Redis from 'ioredis'
import type { Context, Telegraf } from 'telegraf'
import type { Update } from 'telegraf/types'
import type { CronJob } from 'cron'

declare global {
  var global_postgres: ReturnType<typeof drizzle> | undefined
  var global_redis: Redis | undefined
  var global_telegram: Telegraf<Context<Update>> | undefined
  var global_cron_send_order_review_email: CronJob | undefined
  var global_cron_send_abandon_cart_email: CronJob | undefined
  var global_cron_delete_not_paid_orders: CronJob | undefined
}

export {}
