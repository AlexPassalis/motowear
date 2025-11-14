import { formatMessage } from '@/utils/error/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { NODE_ENV } from '@/env'
import { fileURLToPath } from 'node:url'

export function handleError(location: string, err: unknown | string) {
  const filename = fileURLToPath(import.meta.url)
  const message = formatMessage(filename, location, err)
  console.error(message)

  if (NODE_ENV === 'production') {
    ;(async () => {
      await sendTelegramMessage('ERROR', message)
    })() // fire and forget
  }
}
