import nodemailer, { TransportOptions } from 'nodemailer'
import MailerResponse from '../class/mailer_response'
import { logger } from '../lib'

const defaultOptions: TransportOptions = <TransportOptions>{
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_TLS,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
}

const mail = async (
  to: string,
  subject: string,
  message: string,
  options: TransportOptions = defaultOptions
): Promise<MailerResponse | Error> => {
  try {
    const mailer = nodemailer.createTransport(options, {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`
    })

    let response: string | null = null

    if (to && subject && message) {
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
    } else {
      throw new Error('Email requires `to`, `subject` and `message`')
    }
  } catch (error) {
    logger.error(<Error>error)
    throw new MailerResponse('Error', 'Could not send email', (<Error>error).message)
  }
}

export default mail
