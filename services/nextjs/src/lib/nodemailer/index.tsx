import type {
  typeCart,
  typeCheckout,
  typeEmail,
  typeOrder,
} from '../postgres/data/type'

import React from 'react'

import nodemailer from 'nodemailer'
import { Attachment } from 'nodemailer/lib/mailer'
import { envServer } from '@/env'
import { render } from '@react-email/components'
import { readSecret } from '@/utils/readSecret'
import { formatMessage } from '@/utils/formatMessage'
import { errorAxios, errorNodemailer, errorReactEmail } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram/index'
import AbandonCartEmail from '@/lib/react-email/AbandonCartEmail'
import OrderConfirmationEmail from '@/lib/react-email/OrderConfirmationEmail'
import OrderFullfilledEmail from '@/lib/react-email/OrderFullfilledEmail'
import ContentRequestEmail from '@/lib/react-email/ContentRequestEmail'
import OrderReviewEmail from '@/lib/react-email/OrderReviewEmail'
import path from 'path'
import axios from 'axios'
import mime from 'mime'

const transporter = nodemailer.createTransport({
  host: envServer.NODEMAILER_HOST,
  port: envServer.NODEMAILER_PORT,
  secure: envServer.NODEMAILER_SECURE,
  auth: {
    user: readSecret('NODEMAILER_AUTH_USER'),
    pass: readSecret('NODEMAILER_AUTH_PASS'),
  },
})

export async function sendAbandonCartEmail(cart: typeCart, email: string) {
  const attachments: Attachment[] = [
    {
      filename: 'motowear.png',
      path: path.join(process.cwd(), 'public', 'motowear.png'),
      cid: 'motowear_logo',
    },
  ]

  for (const [index, item] of cart.entries()) {
    try {
      const res = await axios.get(
        `${envServer.MINIO_PRODUCT_URL}/${item.product_type}/${item.image}`,
        { responseType: 'arraybuffer' },
      )
      attachments.push({
        filename: `${item.product_type} ${item.name}`,
        content: res.data,
        cid: `item-${index}`,
        contentDisposition: 'inline',
        contentType: mime.getType(item.image) || undefined,
      })
    } catch (err) {
      const message = formatMessage(
        `@/lib/nodemailer/index.tsx sendOrderConfirmationEmail() image: ${item.image}`,
        errorAxios,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)
    }
  }

  let emailHtml
  try {
    emailHtml = await render(<AbandonCartEmail cart={cart} email={email} />)
  } catch (err) {
    const message = formatMessage(
      `@/lib/nodemailer/sendAbandonCartEmail email: ${email}`,
      errorReactEmail,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }
  const options = {
    from: `Moto Wear <${envServer.NODEMAILER_EMAIL}>`,
    to: email,
    subject: 'Άσε το γκάζι... όχι την παραγγελία σου',
    html: emailHtml,
    attachments: attachments,
  }
  try {
    await transporter.sendMail(options)
  } catch (err) {
    const message = formatMessage(
      `@/lib/nodemailer/sendAbandonCartEmail email: ${email}`,
      errorNodemailer,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }
}

export async function sendOrderConfirmationEmail(
  order_id: typeOrder['id'],
  total: typeOrder['total'],
  cart: typeCart,
  checkout: typeCheckout,
  email: typeEmail,
) {
  const attachments: Attachment[] = [
    {
      filename: 'motowear.png',
      path: path.join(process.cwd(), 'public', 'motowear.png'),
      cid: 'motowear_logo',
    },
  ]

  for (const [index, item] of cart.entries()) {
    try {
      const res = await axios.get(
        `${envServer.MINIO_PRODUCT_URL}/${item.product_type}/${item.image}`,
        { responseType: 'arraybuffer' },
      )
      attachments.push({
        filename: `${item.product_type} ${item.name}`,
        content: res.data,
        cid: `item-${index}`,
        contentDisposition: 'inline',
        contentType: mime.getType(item.image) || undefined,
      })
    } catch (err) {
      const message = formatMessage(
        '@/lib/nodemailer/index.tsx sendOrderConfirmationEmail()',
        errorAxios,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)
    }
  }

  let emailHtml
  try {
    emailHtml = await render(
      <OrderConfirmationEmail
        order_id={order_id}
        total={total}
        cart={cart}
        checkout={checkout}
      />,
    )
  } catch (err) {
    const message = formatMessage(
      '@/lib/nodemailer/index.tsx sendOrderConfirmationEmail()',
      errorReactEmail,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }

  const options = {
    from: `Moto Wear <${envServer.NODEMAILER_EMAIL}>`,
    to: email,
    subject: `Η παραγγελία #${order_id} επιβεβαιώθηκε`,
    html: emailHtml,
    attachments: attachments,
  }
  try {
    await transporter.sendMail(options)
  } catch (err) {
    const message = formatMessage(
      '@/lib/nodemailer/index.tsx sendOrderConfirmationEmail()',
      errorNodemailer,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }
}

export async function sendOrderFulfilledEmail(
  tracking_number: NonNullable<typeOrder['tracking_number']>,
  order_id: typeOrder['id'],
  total: typeOrder['total'],
  cart: typeCart,
  email: typeEmail,
) {
  const attachments: Attachment[] = [
    {
      filename: 'motowear.png',
      path: path.join(process.cwd(), 'public', 'motowear.png'),
      cid: 'motowear_logo',
    },
  ]

  for (const [index, item] of cart.entries()) {
    try {
      const res = await axios.get(
        `${envServer.MINIO_PRODUCT_URL}/${item.product_type}/${item.image}`,
        { responseType: 'arraybuffer' },
      )
      attachments.push({
        filename: `${item.product_type} ${item.name}`,
        content: res.data,
        cid: `item-${index}`,
        contentDisposition: 'inline',
        contentType: mime.getType(item.image) || undefined,
      })
    } catch (err) {
      const message = formatMessage(
        '@/lib/nodemailer/index.tsx sendOrderConfirmationEmail()',
        errorAxios,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)

      return
    }
  }

  let emailHtml
  try {
    emailHtml = await render(
      <OrderFullfilledEmail
        tracking_number={tracking_number}
        order_id={order_id}
        total={total}
        cart={cart}
      />,
    )
  } catch (err) {
    const message = formatMessage(
      `@/lib/nodemailer/sendOrderFulfilledEmail for order with id: #${order_id}`,
      errorReactEmail,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }

  const options = {
    from: `Moto Wear <${envServer.NODEMAILER_EMAIL}>`,
    to: email,
    subject: `Η παραγγελία #${order_id} είναι καθ' οδόν`,
    html: emailHtml,
    attachments: attachments,
  }
  try {
    await transporter.sendMail(options)
  } catch (err) {
    const message = formatMessage(
      `@/lib/nodemailer/sendOrderFulfilledEmail for order with id: #${order_id}`,
      errorNodemailer,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }
}

export async function sendContentRequestEmail(email: typeEmail) {
  let emailHtml
  try {
    emailHtml = await render(<ContentRequestEmail email={email} />)
  } catch (err) {
    const message = formatMessage(
      `@/lib/nodemailer/sendContentRequestEmail for email: ${email}`,
      errorReactEmail,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }
  const options = {
    from: `Moto Wear <${envServer.NODEMAILER_EMAIL}>`,
    to: email,
    subject: 'Το δέμα σου ήρθε...',
    html: emailHtml,
    attachments: [
      {
        filename: 'motowear.png',
        path: path.join(process.cwd(), 'public', 'motowear.png'),
        cid: 'motowear_logo',
      },
    ],
  }
  try {
    await transporter.sendMail(options)
  } catch (err) {
    const message = formatMessage(
      `@/lib/nodemailer/sendContentRequestEmail for email: ${email}`,
      errorNodemailer,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }
}

export async function sendOrderReviewEmail(
  first_name: typeCheckout['first_name'],
  order_id: typeOrder['id'],
  email: typeEmail,
) {
  let emailHtml
  try {
    emailHtml = await render(
      <OrderReviewEmail first_name={first_name} order_id={order_id} />,
    )
  } catch (err) {
    const message = formatMessage(
      `@/lib/nodemailer/sendOrderReviewEmail order_id: #${order_id}`,
      errorReactEmail,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }
  const options = {
    from: `Moto Wear <${envServer.NODEMAILER_EMAIL}>`,
    to: email,
    subject: 'Πες μας την γνώμη σου',
    html: emailHtml,
    attachments: [
      {
        filename: 'motowear.png',
        path: path.join(process.cwd(), 'public', 'motowear.png'),
        cid: 'motowear_logo',
      },
    ],
  }
  try {
    await transporter.sendMail(options)
  } catch (err) {
    const message = formatMessage(
      `@/lib/nodemailer/sendOrderReviewEmail order_id: #${order_id}`,
      errorNodemailer,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return
  }
}
