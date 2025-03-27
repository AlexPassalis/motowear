import { CronJob } from 'cron'
import { formatMessage } from '@/utils/formatMessage'
import { v4 as id } from 'uuid'
import { errorCron } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram/index'
// import { sendReviewEmail } from '@/lib/nodemailer/index'

function establishCron() {
  if (process.env.INSTANCE_ID === '1') {
    try {
      global.cron = new CronJob(
        '0 0 * * * *', // Run at minute 0, second 0 of every hour
        async function () {
          // await sendReviewEmail('alexanderpassalis@hotmail.com')
          console.debug('review email would have been sent now.')
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
    }
  }
  return global.cron
}

export const cron = global.cron ? global.cron : establishCron()
