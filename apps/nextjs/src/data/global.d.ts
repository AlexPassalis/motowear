import { drizzle } from 'drizzle-orm/node-postgres'
import { Context, Telegraf } from 'telegraf'
import type { Update } from 'telegraf/types'
import { CronJob } from 'cron'

declare global {
  var postgres: ReturnType<typeof drizzle> | undefined
  var telegram: Telegraf<Context<Update>> | undefined
  var cron: CronJob | undefined
}

export {}
