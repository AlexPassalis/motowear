import { readSecret } from '@/utils/readSecret'
import { Telegraf } from 'telegraf'
import { inspect } from 'node:util'

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
  const chatId = chatIds[chat]

  try {
    const bot = new Telegraf(readSecret('TELEGRAM_BOT_TOKEN'))
    await bot.telegram.sendMessage(chatId, message, {
      parse_mode: 'HTML',
    })
  } catch (err) {
    console.error(
      '@/lib/telegram/index.ts sendTelegramMessage()',
      inspect(err, { depth: null, colors: false }),
    )
  }
}
