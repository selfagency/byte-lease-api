import nodemailer, { Transporter, TransportOptions } from 'nodemailer'
import MailerResponse from '../class/mailer_response'
import { isEmail } from '../lib'
import { logger } from '../services'

const defaultOptions: TransportOptions = <TransportOptions>{
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_TLS,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  socketTimeout: 2000,
  connectionTimeout: 2000,
  logger
}

const mail = async (
  to: string,
  subject: string,
  message: string,
  options: TransportOptions = defaultOptions
): Promise<MailerResponse> => {
  const mailer: Transporter = nodemailer.createTransport(options, {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`
  })

  try {
    if (!(isEmail(to) && subject.length && message.length))
      throw new Error('Email requires `to`, `subject` and `message`')

    let info = await mailer.sendMail({
      to,
      subject,
      text: message
    })

    mailer.close()
    return new MailerResponse('OK', 'Mail sent successfully', info.response)
  } catch (error) {
    mailer.close()
    logger.error((<Error>error).message)
    return new MailerResponse('Failure', 'Mail was not sent', (<Error>error).message)
  }
}

export default mail
