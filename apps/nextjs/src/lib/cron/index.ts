import os from 'os'
import { CronJob } from 'cron'
import { formatMessage } from '@/utils/formatMessage'
import { v4 as id } from 'uuid'
import { errorCron } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram/index'

function establishCron() {
  console.debug(os.hostname())
  if (os.hostname().startsWith('stack-motowear_nextjs.1')) {
    try {
      global.cron = new CronJob(
        '0 0 * * * *', // Run at minute 0, second 0 of every hour
        function () {
          console.debug('You will see this message every hour (Athens time)')
        },
        null, // onComplete
        true, // start immediately
        'Europe/Athens'
      )
      console.log('Cron connected successfully')
    } catch (e) {
      const message = formatMessage(id(), '/lib/cron', errorCron, e)
      console.error(message)
      sendTelegramMessage('ERROR', message)
      process.exit(1)
    }
  }
  return global.cron
}

export const cron = global.cron ? global.cron : establishCron()
