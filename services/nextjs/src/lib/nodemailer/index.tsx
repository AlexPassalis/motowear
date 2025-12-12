import type {
  typeCart,
  typeCheckout,
  typeEmail,
  typeOrder,
} from '@/lib/postgres/data/type'

import React from 'react'

import nodemailer from 'nodemailer'
import { Attachment } from 'nodemailer/lib/mailer'
import { envServer } from '@/envServer'
import { render } from '@react-email/components'
import { handleError } from '@/utils/error/handleError'
import AbandonCartEmail from '@/lib/react-email/AbandonCartEmail'
import OrderConfirmationEmail from '@/lib/react-email/OrderConfirmationEmail'
import OrderLateEmail from '@/lib/react-email/OrderLateEmail'
import OrderFullfilledEmail from '@/lib/react-email/OrderFullfilledEmail'
import ContentRequestEmail from '@/lib/react-email/ContentRequestEmail'
import OrderReviewEmail from '@/lib/react-email/OrderReviewEmail'
import MistakeEmail from '@/lib/react-email/MistakeEmail'
import path from 'path'
import axios from 'axios'
import mime from 'mime'

const transporter = nodemailer.createTransport({
  host: envServer.NODEMAILER_HOST,
  port: envServer.NODEMAILER_PORT,
  secure: envServer.NODEMAILER_SECURE,
  auth: {
    user: envServer.NODEMAILER_AUTH_USER,
    pass: envServer.NODEMAILER_AUTH_PASS,
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
        `${envServer.MINIO_PRODUCT_URL}/${item.collection}/${item.image}`,
        { responseType: 'arraybuffer' },
      )
      attachments.push({
        filename: `${item.collection} ${item.name}`,
        content: res.data,
        cid: `item-${index}`,
        contentDisposition: 'inline',
        contentType: mime.getType(item.image) || undefined,
      })
    } catch (err) {
      const location = `NODEMAILER fetch image ${item.image}`
      handleError(location, err)
    }
  }

  let emailHtml
  try {
    emailHtml = await render(<AbandonCartEmail cart={cart} email={email} />)
  } catch (err) {
    const location = `NODEMAILER render AbandonCartEmail email: ${email}`
    handleError(location, err)

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
    const location = `NODEMAILER sendAbandonCartEmail email: ${email}`
    handleError(location, err)

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
        `${envServer.MINIO_PRODUCT_URL}/${item.collection}/${item.image}`,
        { responseType: 'arraybuffer' },
      )
      attachments.push({
        filename: `${item.collection} ${item.name}`,
        content: res.data,
        cid: `item-${index}`,
        contentDisposition: 'inline',
        contentType: mime.getType(item.image) || undefined,
      })
    } catch (err) {
      const location = 'NODEMAILER fetch order image'
      handleError(location, err)
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
    const location = 'NODEMAILER render OrderConfirmationEmail'
    handleError(location, err)

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
    const location = 'NODEMAILER sendOrderConfirmationEmail'
    handleError(location, err)

    return
  }
}

export async function sendOrderLateEmail(
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
        `${envServer.MINIO_PRODUCT_URL}/${item.collection}/${item.image}`,
        { responseType: 'arraybuffer' },
      )
      attachments.push({
        filename: `${item.collection} ${item.name}`,
        content: res.data,
        cid: `item-${index}`,
        contentDisposition: 'inline',
        contentType: mime.getType(item.image) || undefined,
      })
    } catch (err) {
      const location = 'NODEMAILER fetch late order image'
      handleError(location, err)
    }
  }

  let emailHtml
  try {
    emailHtml = await render(
      <OrderLateEmail
        order_id={order_id}
        total={total}
        cart={cart}
        checkout={checkout}
      />,
    )
  } catch (err) {
    const location = 'NODEMAILER render OrderLateEmail'
    handleError(location, err)

    return
  }

  const options = {
    from: `Moto Wear <${envServer.NODEMAILER_EMAIL}>`,
    to: email,
    subject: `Η παραγγελία σου έχει καθυστερήσει`,
    html: emailHtml,
    attachments: attachments,
  }
  try {
    await transporter.sendMail(options)
  } catch (err) {
    const location = 'NODEMAILER sendOrderLateEmail'
    handleError(location, err)

    return
  }
}

export async function sendOrderFulfilledEmail(
  tracking_number: NonNullable<typeOrder['tracking_number']>,
  order_id: typeOrder['id'],
  total: typeOrder['total'],
  einvoice_link: typeOrder['einvoice_link'],
  cart: typeCart,
  email: typeEmail,
  box_now_locker_id: typeOrder['checkout']['box_now_locker_id'],
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
        `${envServer.MINIO_PRODUCT_URL}/${item.collection}/${item.image}`,
        { responseType: 'arraybuffer' },
      )
      attachments.push({
        filename: `${item.collection} ${item.name}`,
        content: res.data,
        cid: `item-${index}`,
        contentDisposition: 'inline',
        contentType: mime.getType(item.image) || undefined,
      })
    } catch (err) {
      const location = 'NODEMAILER fetch fulfilled order image'
      handleError(location, err)

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
        einvoice_link={einvoice_link}
        cart={cart}
        box_now_locker_id={box_now_locker_id}
      />,
    )
  } catch (err) {
    const location = `NODEMAILER render OrderFullfilledEmail order_id: ${order_id}`
    handleError(location, err)

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
    const location = `NODEMAILER sendOrderFulfilledEmail order_id: ${order_id}`
    handleError(location, err)

    return
  }
}

export async function sendContentRequestEmail(email: typeEmail) {
  let emailHtml
  try {
    emailHtml = await render(<ContentRequestEmail email={email} />)
  } catch (err) {
    const location = `NODEMAILER render ContentRequestEmail email: ${email}`
    handleError(location, err)

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
    const location = `NODEMAILER sendContentRequestEmail email: ${email}`
    handleError(location, err)

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
    const location = `NODEMAILER render OrderReviewEmail order_id: ${order_id}`
    handleError(location, err)

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
    const location = `NODEMAILER sendOrderReviewEmail order_id: ${order_id}`
    handleError(location, err)

    return
  }
}

import { postgres } from '@/lib/postgres/index'
import { order } from '@/lib/postgres/schema'
import { and, eq, isNotNull } from 'drizzle-orm'
import pLimit from 'p-limit'

async function sendMistakeEmail(email: string) {
  const attachments: Attachment[] = [
    {
      filename: 'motowear.png',
      path: path.join(process.cwd(), 'public', 'motowear.png'),
      cid: 'motowear_logo',
    },
  ]

  let emailHtml
  try {
    emailHtml = await render(<MistakeEmail email={email} />)
  } catch (err) {
    const location = `NODEMAILER render MistakeEmail email: ${email}`
    handleError(location, err)

    return
  }
  const options = {
    from: `Moto Wear <${envServer.NODEMAILER_EMAIL}>`,
    to: email,
    subject: 'Σχετικά με το προηγούμενο email',
    html: emailHtml,
    attachments: attachments,
  }
  try {
    await transporter.sendMail(options)
  } catch (err) {
    const location = `NODEMAILER sendMistakeEmail email: ${email}`
    handleError(location, err)

    return
  }
}

export async function sendMistakeEmails() {
  let array
  try {
    array = await postgres
      .select()
      .from(order)
      .where(
        and(
          isNotNull(order.date_fulfilled),
          eq(order.order_late_email_sent, true),
        ),
      )
  } catch (err) {
    const location = 'NODEMAILER select orders for mistake emails'
    handleError(location, err)

    return
  }

  const limit = pLimit(10)
  const sendEmailPromises = array.map((ord) =>
    limit(async () => {
      await sendMistakeEmail(ord.checkout.email)
    }),
  )

  await Promise.all(sendEmailPromises)
}
