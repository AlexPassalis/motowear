import { formatMessage } from '@/utils/error/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'

export function handleError(location: string, err: unknown | string) {
  const message = formatMessage(__filename, location, err)
  console.error(message)
  ;(async () => {
    await sendTelegramMessage('ERROR', message)
  })() // fire and forget
}
