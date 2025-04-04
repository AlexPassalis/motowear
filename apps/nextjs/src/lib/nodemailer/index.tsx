import React from 'react'
import nodemailer from 'nodemailer'
import { envServer } from '@/env'
import { render } from '@react-email/components'
import AirbnbReviewEmail from '@/lib/react-email/ReviewEmail'
import { readSecret } from '@/utils/readSecret'
import { v4 as id } from 'uuid'
import { formatMessage } from '@/utils/formatMessage'
import { errorNodemailer, errorReactEmail } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram/index'

const transporter = nodemailer.createTransport({
  host: envServer.NODEMAILER_HOST,
  port: envServer.NODEMAILER_PORT,
  secure: envServer.NODEMAILER_SECURE,
  auth: {
    user: readSecret('NODEMAILER_AUTH_USER'),
    pass: readSecret('NODEMAILER_AUTH_PASS'),
  },
})

export async function sendOrderEmail(email: string) {
  let emailHtml
  try {
    emailHtml = await render(<AirbnbReviewEmail />)
  } catch (e) {
    const message = formatMessage(
      id(),
      '@/lib/nodemailer/sendOrderEmail',
      errorReactEmail,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorReactEmail
  }
  const options = {
    from: readSecret('NODEMAILER_EMAIL'),
    to: email,
    subject: 'motowear.com',
    text: 'This is the text field',
    html: emailHtml,
  }
  try {
    await transporter.sendMail(options)
  } catch (e) {
    const message = formatMessage(
      id(),
      '@/lib/nodemailer/sendOrderEmail',
      errorNodemailer,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorNodemailer
  }
}

export async function sendReviewEmail(email: string) {
  let emailHtml
  try {
    emailHtml = await render(<AirbnbReviewEmail />)
  } catch (e) {
    const message = formatMessage(
      id(),
      '@/lib/nodemailer/sendReviewEmail',
      errorReactEmail,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
  }
  const options = {
    from: readSecret('NODEMAILER_EMAIL'),
    to: email,
    subject: 'motowear.com',
    text: 'This is the text field',
    html: emailHtml,
  }
  try {
    await transporter.sendMail(options)
  } catch (e) {
    const message = formatMessage(
      id(),
      '@/lib/nodemailer/sendReviewEmail',
      errorNodemailer,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
  }
}
