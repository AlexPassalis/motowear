import { errorTelegram } from '@/data/error'
import { readSecret } from '@/utils/readSecret'
import { Telegraf } from 'telegraf'

const chatIds = {
  ERROR: readSecret('TELEGRAM_ERROR_CHAT_ID'),
  AUTH: readSecret('TELEGRAM_AUTH_CHAT_ID'),
  // ORDER: readSecret('TELEGRAM_ORDER_CHAT_ID'),
  // REVIEW: readSecret('TELEGRAM_REVIEW_CHAT_ID'),
}

export async function sendTelegramMessage(
  chat: keyof typeof chatIds,
  message: string
) {
  if (!global.telegram) {
    global.telegram = new Telegraf(readSecret('TELEGRAM_BOT_TOKEN'))
    process.once('SIGINT', () => global.telegram!.stop('SIGINT'))
    process.once('SIGTERM', () => global.telegram!.stop('SIGTERM'))
    await telegramPing()
  }

  const chatId = chatIds[chat]
  try {
    await global.telegram.telegram.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    })
  } catch (e) {
    console.error(
      `Location: src/lib/telegram/index\nMessage: ${errorTelegram}\nError: ${e}.`
    )
  }
}

async function telegramPing() {
  try {
    await global.telegram!.telegram.getMe()
    console.log('Telegram connected successfully')
  } catch (e) {
    console.error(
      `Location: src/lib/telegram/index\nMessage: Telegram connection failed\nError: ${e}.`
    )
    process.exit(1)
  }
}
