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

  const telegram_bot = await establishTelegram()
  const chatId = chatIds[chat]

  const max_attempts = 3
  for (let attempt = 1; attempt <= max_attempts; attempt = attempt + 1) {
    try {
      await telegram_bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      })

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
