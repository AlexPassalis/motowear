import nodemailer from 'nodemailer'
import { envServer } from '@/env'

import { render } from '@react-email/components'

const transporter = nodemailer.createTransport({
  host: envServer.NODEMAILER_HOST,
  port: envServer.NODEMAILER_PORT,
  secure: envServer.NODEMAILER_SECURE,
  auth: {
    user: envServer.NODEMAILER_AUTH_USER,
    pass: envServer.NODEMAILER_AUTH_PASS,
  },
})

export async function sendEmail() {
  const emailHtml = await render(<EmailOTP />)
  const options = {
    from: envServer.NODEMAILER_AUTH_USER,
    to: email,
    subject: 'motowear.com',
    text: 'This is the text field',
    html: emailHtml,
  }
  const info = await transporter.sendMail(options)
  return info
}
