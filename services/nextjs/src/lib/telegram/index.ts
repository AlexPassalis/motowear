import { envServer } from '@/envServer'
import { Telegraf } from 'telegraf'
import { formatMessage } from '@/utils/error/formatMessage'
import { redis } from '@/lib/redis/index'
import { ERROR } from '@/data/magic'

const chatIds = {
  ERROR: envServer.TELEGRAM_ERROR_CHAT_ID,
  AUTH: envServer.TELEGRAM_AUTH_CHAT_ID,
  ORDER: envServer.TELEGRAM_ORDER_CHAT_ID,
  REVIEW: envServer.TELEGRAM_REVIEW_CHAT_ID,
}

// Lua script for atomic rate limiting
// Returns 1 if allowed, 0 if rate limited
const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local ttl = tonumber(ARGV[2])

  local current = redis.call('GET', key)
  if current and tonumber(current) >= limit then
    return 0
  end

  local count = redis.call('INCR', key)
  if count == 1 then
    redis.call('EXPIRE', key, ttl)
  elseif redis.call('TTL', key) == -1 then
    redis.call('EXPIRE', key, ttl)
  end

  return 1
`

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
    console.info(`${ERROR.telegram} connected successfully`)
  } catch (err) {
    const message = formatMessage(`${ERROR.telegram} telegramPing()`, err)
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
    try {
      const allowed = await redis.eval(
        RATE_LIMIT_SCRIPT,
        1,
        ERROR_REDIS_KEY,
        ERROR_LIMIT_PER_MINUTE.toString(),
        '60',
      )

      if (!allowed) {
        return
      }
    } catch (err) {
      const location = `${ERROR.telegram} sendTelegramMessage()`
      const errorMessage = formatMessage(location, err)

      console.error(errorMessage)
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

      return
    } catch (err) {
      if (attempt === max_attempts) {
        const message = formatMessage(
          `${ERROR.telegram} sendTelegramMessage()`,
          err,
        )
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
