import type { drizzle } from 'drizzle-orm/node-postgres'
import type Redis from 'ioredis'
import type { Telegraf, Context, Update } from 'telegraf'
import type { CronJob } from 'cron'

declare global {
  var global_postgres: ReturnType<typeof drizzle> | undefined
  var global_redis: Redis | undefined
  var global_telegram_bot: Telegraf<Context<Update>> | undefined
  var global_cron_send_abandon_cart_email: CronJob | undefined
  var global_cron_send_order_late_email: CronJob | undefined
  var global_cron_send_order_review_email: CronJob | undefined
}

export {} // Treat as module
