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
  message: string,
) {
  const bot = new Telegraf(readSecret('TELEGRAM_BOT_TOKEN'))

  const chatId = chatIds[chat]
  try {
    await bot.telegram.sendMessage(chatId, message, {
      parse_mode: 'HTML',
    })
  } catch (e) {
    const message = formatMessage(
      '@/lib/telegram/index.ts sendTelegramMessage()',
      errorTelegram,
      e,
    )
    console.error(message)
  }
}
