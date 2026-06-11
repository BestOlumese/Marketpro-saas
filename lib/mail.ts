import nodemailer from 'nodemailer'
import { APP_NAME } from '@/lib/constants/copy'

// Singleton transporter — reused across warm invocations
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!, // Gmail App Password, NOT your account password
  },
})

interface MailOptions {
  to: string
  subject: string
  html: string
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  await transporter.sendMail({
    from: `${APP_NAME} <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}
