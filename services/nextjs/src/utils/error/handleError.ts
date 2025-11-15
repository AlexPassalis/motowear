import { formatMessage } from '@/utils/error/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { NODE_ENV } from '@/env'

export function handleError(location: string, err: unknown | string) {
  const message = formatMessage(__filename, location, err)
  console.error(message)

  if (NODE_ENV === 'production') {
    ;(async () => {
      await sendTelegramMessage('ERROR', message)
    })() // fire and forget
  }
}
