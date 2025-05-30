import { errorTelegram } from '@/data/error'
import { formatMessage } from '@/utils/formatMessage'
import { readSecret } from '@/utils/readSecret'
import { Telegraf } from 'telegraf'

const chatIds = {
  ERROR: readSecret('TELEGRAM_ERROR_CHAT_ID'),
  AUTH: readSecret('TELEGRAM_AUTH_CHAT_ID'),
  ORDER: readSecret('TELEGRAM_ORDER_CHAT_ID'),
  REVIEW: readSecret('TELEGRAM_REVIEW_CHAT_ID'),
}

export async function sendTelegramMessage(
  chat: keyof typeof chatIds,
  message: string
) {
  if (!global.global_telegram) {
    global.global_telegram = new Telegraf(readSecret('TELEGRAM_BOT_TOKEN'))
    process.once('SIGINT', () => {
      global.global_telegram!.stop('SIGINT')
      console.info('Telegram connection closed.')
    })
    process.once('SIGTERM', () => {
      global.global_telegram!.stop('SIGTERM')
      console.info('Telegram connection closed.')
    })
    await telegramPing()
  }

  const chatId = chatIds[chat]
  try {
    await global.global_telegram.telegram.sendMessage(chatId, message, {
      parse_mode: 'HTML',
    })
  } catch (e) {
    const message = formatMessage(
      '@/lib/telegram/index.ts sendTelegramMessage()',
      errorTelegram,
      e
    )
    console.error(message)
  }
}

async function telegramPing() {
  try {
    await global.global_telegram!.telegram.getMe()
    console.info('Telegram connected successfully.')
  } catch (e) {
    const message = formatMessage(
      '@/lib/telegram/index.ts telegramPing()',
      'Telegram connection failed.',
      e
    )
    console.error(message)
  }
}
