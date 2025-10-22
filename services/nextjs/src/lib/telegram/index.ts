import { envServer } from '@/envServer'
import { Telegraf } from 'telegraf'
import { formatMessage } from '@/utils/formatMessage'
import { inspect } from 'node:util'

const chatIds = {
  ERROR: envServer.TELEGRAM_ERROR_CHAT_ID,
  AUTH: envServer.TELEGRAM_AUTH_CHAT_ID,
  ORDER: envServer.TELEGRAM_ORDER_CHAT_ID,
  REVIEW: envServer.TELEGRAM_REVIEW_CHAT_ID,
}

async function establishTelegram() {
  if (!global.global_telegram_bot) {
    const telegram_bot = new Telegraf(envServer.TELEGRAM_BOT_TOKEN)
    process.once('SIGINT', () => {
      telegram_bot.stop('SIGINT')
      console.info('Telegram connection closed.')
    })
    process.once('SIGTERM', () => {
      telegram_bot.stop('SIGTERM')
      console.info('Telegram connection closed.')
    })
    global.global_telegram_bot = telegram_bot
    await telegramPing()
  }

  return global.global_telegram_bot
}

async function telegramPing() {
  try {
    await global.global_telegram_bot!.telegram.getMe()
    console.info('Telegram connected successfully.')
  } catch (err) {
    const message = formatMessage(
      '@/lib/telegram/index.ts telegramPing()',
      'Telegram connection failed.',
      err,
    )
    console.error(message)

    process.exit(1)
  }
}

export async function sendTelegramMessage(
  chat: keyof typeof chatIds,
  message: string,
) {
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
        console.error(
          '@/lib/telegram/index.ts sendTelegramMessage()',
          inspect(err, { depth: null, colors: false }),
        )
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt))
      }
    }
  }
}
