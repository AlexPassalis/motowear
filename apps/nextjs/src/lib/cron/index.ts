import { CronJob } from 'cron'
import { startOfDay, subDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram/index'
import { postgres } from '@/lib/postgres/index'
import { abandoned_cart, order } from '@/lib/postgres/schema'
import { and, eq, gt, lt } from 'drizzle-orm'
import { errorCron, errorPostgres } from '@/data/error'
import {
  sendOrderReviewEmail,
  sendAbandonCartEmail,
} from '@/lib/nodemailer/index'
import pLimit from 'p-limit'

async function cronSendOrderReviewEmail() {
  const today = toZonedTime(new Date(), 'Europe/Athens')
  const fourteenDaysAgo = subDays(today, 14)
  const fourteenDaysAgoStart = startOfDay(fourteenDaysAgo)

  let array
  try {
    array = await postgres
      .select()
      .from(order)
      .where(
        and(
          eq(order.review_email, false),
          eq(order.date_fulfilled, fourteenDaysAgoStart)
        )
      )
  } catch (err) {
    const message = formatMessage(
      '@/lib/cron/index sendOrderReviewEmail',
      errorCron,
      err
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return
  }

  const limit = pLimit(10)
  const sendEmailPromises = array.map((orderItem) =>
    limit(async () => {
      await sendOrderReviewEmail(
        orderItem.checkout.first_name,
        orderItem.id,
        orderItem.checkout.email
      )

      try {
        await postgres
          .update(order)
          .set({ review_email: true })
          .where(eq(order.id, orderItem.id))
      } catch (err) {
        const message = formatMessage(
          `@/lib/cron/index cronSendOrderReviewEmail() order_id: #${order.id}`,
          errorPostgres,
          err
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      }
    })
  )

  await Promise.all(sendEmailPromises)
}

async function cronSendAbandonCartEmail() {
  const today = toZonedTime(new Date(), 'Europe/Athens')
  const oneDayAgo = subDays(today, 1)

  let array
  try {
    array = await postgres
      .select()
      .from(abandoned_cart)
      .where(gt(abandoned_cart.date, oneDayAgo))
  } catch (err) {
    const message = formatMessage(
      '@/lib/cron/index cronSendAbandonCartEmail',
      errorCron,
      err
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return
  }

  const limit = pLimit(10)
  const sendEmailPromises = array.map((ab_cart) =>
    limit(async () => {
      await sendAbandonCartEmail(ab_cart.cart, ab_cart.email)

      try {
        await postgres
          .delete(abandoned_cart)
          .where(eq(abandoned_cart.email, ab_cart.email))
      } catch (err) {
        const message = formatMessage(
          `@/lib/cron/index cronSendAbandonCartEmail() email: ${abandoned_cart.email}`,
          errorPostgres,
          err
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      }
    })
  )

  await Promise.all(sendEmailPromises)
}

async function cronDeleteNotPaidOrders() {
  const today = toZonedTime(new Date(), 'Europe/Athens')
  const threeDaysAgo = subDays(today, 3)

  try {
    await postgres
      .delete(order)
      .where(and(eq(order.paid, false), lt(order.order_date, threeDaysAgo)))
  } catch (err) {
    const message = formatMessage(
      '@/lib/cron/index cronDeleteNotPaidOrders',
      errorCron,
      err
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
  }
}

function establishCron() {
  if (process.env.INSTANCE_ID === '1') {
    if (!global.global_cron) {
      try {
        global.global_cron = new CronJob(
          '0 0 * * * *', // Run at minute 0, second 0 of every hour
          cronSendOrderReviewEmail,
          null, // onComplete
          true, // start immediately
          'Europe/Athens'
        )
        console.info('Cron INSTANCE_ID = 1 connected successfully.')
      } catch (e) {
        const message = formatMessage(
          '@/lib/cron/index.ts establishCron() INSTANCE_ID = 1',
          'Cron connection failed.',
          e
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        process.exit(1)
      }
    }
    return global.global_cron
  } else if (process.env.INSTANCE_ID === '2') {
    if (!global.global_cron) {
      try {
        global.global_cron = new CronJob(
          '0 30 * * * *', // Run at minute 30, second 0 of every hour
          cronSendAbandonCartEmail,
          null, // onComplete
          true, // start immediately
          'Europe/Athens'
        )
        console.info('Cron INSTANCE_ID = 2 connected successfully.')
      } catch (e) {
        const message = formatMessage(
          '@/lib/cron/index.ts establishCron() INSTANCE_ID = 2',
          'Cron connection failed.',
          e
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        process.exit(1)
      }
    }
  } else if (process.env.INSTANCE_ID === '3') {
    if (!global.global_cron) {
      try {
        global.global_cron = new CronJob(
          '0 45 0,12 * * *', // at second 0, minute 45 of hour 0 and 12 every day
          cronDeleteNotPaidOrders,
          null, // onComplete
          true, // start immediately
          'Europe/Athens'
        )
        console.info('Cron INSTANCE_ID = 3 connected successfully.')
      } catch (e) {
        const message = formatMessage(
          '@/lib/cron/index.ts establishCron() INSTANCE_ID = 3',
          'Cron connection failed.',
          e
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        process.exit(1)
      }
    }
  }
}

export const cron = establishCron()
