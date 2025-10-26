import { CronJob } from 'cron'
import { subDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram/index'
import { postgres } from '@/lib/postgres/index'
import { abandoned_cart, order } from '@/lib/postgres/schema'
import { and, eq, lt, or, isNotNull, isNull } from 'drizzle-orm'
import { errorCron, errorPostgres } from '@/data/error'
import {
  sendOrderReviewEmail,
  sendOrderLateEmail,
  sendAbandonCartEmail,
} from '@/lib/nodemailer/index'
import pLimit from 'p-limit'

async function cronSendAbandonCartEmail() {
  const today = toZonedTime(new Date(), 'Europe/Athens')
  const oneDayAgo = subDays(today, 1)

  let array
  try {
    array = await postgres
      .select()
      .from(abandoned_cart)
      .where(lt(abandoned_cart.date, oneDayAgo))
  } catch (err) {
    const message = formatMessage(
      '@/lib/cron/index cronSendAbandonCartEmail',
      errorCron,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)
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
          `@/lib/cron/index cronSendAbandonCartEmail() email: ${ab_cart.email}`,
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
      }
    }),
  )

  await Promise.all(sendEmailPromises)
}

async function cronSendOrderLateEmail() {
  const today = toZonedTime(new Date(), 'Europe/Athens')
  const fiveDaysAgo = subDays(today, 5)

  let array
  try {
    array = await postgres
      .select()
      .from(order)
      .where(
        and(
          lt(order.order_date, fiveDaysAgo),
          eq(order.order_late_email_sent, false),
          or(eq(order.paid, true), isNull(order.paid)),
        ),
      )
  } catch (err) {
    const message = formatMessage(
      '@/lib/cron/index cronSendOrderLateEmail',
      errorCron,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)
    return
  }

  const limit = pLimit(10)
  const sendEmailPromises = array.map((ord) =>
    limit(async () => {
      await sendOrderLateEmail(
        ord.id,
        ord.total,
        ord.cart,
        ord.checkout,
        ord.checkout.email,
      )

      try {
        await postgres
          .update(order)
          .set({ order_late_email_sent: true })
          .where(
            and(eq(order.id, ord.id), eq(order.order_late_email_sent, false)),
          )
      } catch (err) {
        const message = formatMessage(
          `@/lib/cron/index cronSendOrderLateEmail() email: ${ord.checkout.email}`,
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
      }
    }),
  )

  await Promise.all(sendEmailPromises)
}

async function cronSendOrderReviewEmail() {
  const today = toZonedTime(new Date(), 'Europe/Athens')
  const oneDayAgo = subDays(today, 1)

  let array
  try {
    array = await postgres
      .select()
      .from(order)
      .where(
        and(
          eq(order.review_email, false),
          isNotNull(order.date_delivered),
          lt(order.date_delivered, oneDayAgo),
        ),
      )
  } catch (err) {
    const message = formatMessage(
      '@/lib/cron/index sendOrderReviewEmail',
      errorCron,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)
    return
  }

  const limit = pLimit(10)
  const sendEmailPromises = array.map((ord) =>
    limit(async () => {
      await sendOrderReviewEmail(
        ord.checkout.first_name,
        ord.id,
        ord.checkout.email,
      )

      try {
        await postgres
          .update(order)
          .set({ review_email: true })
          .where(and(eq(order.id, ord.id), eq(order.review_email, false)))
      } catch (err) {
        const message = formatMessage(
          `@/lib/cron/index cronSendOrderReviewEmail() order_id: #${ord.id}`,
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
      }
    }),
  )

  await Promise.all(sendEmailPromises)
}

async function establishCron() {
  if (!global.global_cron_send_abandon_cart_email) {
    try {
      global.global_cron_send_abandon_cart_email = new CronJob(
        '0 0 12 * * *', // second 0, minute 0, hour 12 daily
        cronSendAbandonCartEmail,
        null,
        true,
        'Europe/Athens',
      )

      console.info('Cron sendAbandonCartEmail connected successfully.')
    } catch (err) {
      const message = formatMessage(
        '@/lib/cron/index.ts establishCron()',
        'Cron sendAbandonCartEmail connection failed.',
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)

      process.exit(1)
    }
  }

  if (!global.global_cron_send_order_late_email) {
    try {
      global.global_cron_send_order_late_email = new CronJob(
        '0 0 13 * * *', // second 0, minute 0, hour 13 daily
        cronSendOrderLateEmail,
        null, // onComplete
        true, // start immediately
        'Europe/Athens',
      )

      console.info('Cron sendOrderLateEmail connected successfully.')
    } catch (err) {
      const message = formatMessage(
        '@/lib/cron/index.ts establishCron()',
        'Cron sendOrderLateEmail connection failed.',
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)

      process.exit(1)
    }
  }

  if (!global.global_cron_send_order_review_email) {
    try {
      global.global_cron_send_order_review_email = new CronJob(
        '0 0 14 * * *', // second 0, minute 0, hour 14 daily
        cronSendOrderReviewEmail,
        null, // onComplete
        true, // start immediately
        'Europe/Athens',
      )

      console.info('Cron sendOrderReviewEmail connected successfully.')
    } catch (err) {
      const message = formatMessage(
        '@/lib/cron/index.ts establishCron()',
        'Cron sendOrderReviewEmail connection failed.',
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)

      process.exit(1)
    }
  }
}

if (process.env.BUILD_TIME !== 'true') {
  await establishCron()
}
