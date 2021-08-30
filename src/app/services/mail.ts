import nodemailer, { TransportOptions } from 'nodemailer'
import MailerResponse from '../class/mailer_response'
import { logger } from '../lib'

const mailer = nodemailer.createTransport(
  <TransportOptions>{
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_TLS || true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  },
  {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`
  }
)

const mail = async (to: string, subject: string, message: string): Promise<MailerResponse | Error> => {
  try {
    let response: string | null = null

    mailer.sendMail(
      {
        to,
        subject,
        text: message
      },
      (errors: any, info: any) => {
        if (errors) logger.error(`nodemailer error: ${JSON.stringify(errors)}`)
        if (info) logger.debug(`nodemailer operation: ${JSON.stringify(info)}`)
        if (info && info.response) response = info.response
      }
    )

    while (!response) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return new MailerResponse('OK', 'Mail sent successfully', response)
  } catch (error) {
    logger.error(<Error>error)
    throw new MailerResponse('Error', 'Could not send email', (<Error>error).message)
  }
}

export default mail
