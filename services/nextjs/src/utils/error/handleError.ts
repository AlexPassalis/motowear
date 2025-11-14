import { formatMessage } from '@/utils/error/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { NODE_ENV } from '@/env'

export async function handleError(location: string, err: unknown | string) {
  const message = formatMessage(__filename, location, err)
  console.error(message)

  if (NODE_ENV === 'production') {
    await sendTelegramMessage('ERROR', message)
  }
}
