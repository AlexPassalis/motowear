import { redis } from '@/lib/redis/index'

import { envServer } from '@/envServer'
import { Telegraf } from 'telegraf'
import { formatMessage } from '@/utils/error/formatMessage'

const chatIds = {
  ERROR: envServer.TELEGRAM_ERROR_CHAT_ID,
  AUTH: envServer.TELEGRAM_AUTH_CHAT_ID,
  ORDER: envServer.TELEGRAM_ORDER_CHAT_ID,
  REVIEW: envServer.TELEGRAM_REVIEW_CHAT_ID,
}

async function establishTelegram() {
  if (global.global_telegram_bot) {
    return global.global_telegram_bot
  }

  global.global_telegram_bot = new Telegraf(envServer.TELEGRAM_BOT_TOKEN)
  await telegramPing()

  return global.global_telegram_bot
}

async function telegramPing() {
  try {
    await global.global_telegram_bot!.telegram.getMe()
    console.info('Telegram connected successfully.')
  } catch (err) {
    const message = formatMessage(__filename, 'telegramPing()', err)
    console.error(message)

    process.exit(1)
  }
}

export async function sendTelegramMessage(
  chat: keyof typeof chatIds,
  message: string,
) {
  if (envServer.NODE_ENV !== 'production') {
    return
  }

  const ERROR_REDIS_KEY = 'TELEGRAM_ERRORS_IN_LAST_MIN'
  const ERROR_LIMIT_PER_MINUTE = 5
  if (chat === 'ERROR') {
    const errorCount = await redis.get(ERROR_REDIS_KEY)
    const count = errorCount ? parseInt(errorCount, 10) : 0

    if (count >= ERROR_LIMIT_PER_MINUTE) {
      return
    }
  }

  const telegram_bot = await establishTelegram()
  const chatId = chatIds[chat]

  const max_attempts = 3
  for (let attempt = 1; attempt <= max_attempts; attempt = attempt + 1) {
    try {
      await telegram_bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      })

      if (chat === 'ERROR') {
        const newCount = await redis.incr(ERROR_REDIS_KEY)

        if (newCount === 1) {
          await redis.expire(ERROR_REDIS_KEY, 60)
        }
      }

      return
    } catch (err) {
      if (attempt === max_attempts) {
        const message = formatMessage(__filename, 'sendTelegramMessage()', err)
        console.error(message)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt))
      }
    }
  }
}

if (process.env.BUILD_TIME !== 'true') {
  await establishTelegram()
}

export {} // Initialize at application startup
