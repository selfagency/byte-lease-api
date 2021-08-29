import { FastifyInstance } from 'fastify'
import MailerResponse from '../class/mailer_response'
import { logger } from '../lib'

const mail = async (
  to: string,
  subject: string,
  text: string,
  server: FastifyInstance
): Promise<MailerResponse | Error> => {
  try {
    const send = server.mailer.sendMail

    return send({ to, subject, text }, (errors: any, info: any) => {
      if (errors) {
        logger.info(JSON.stringify(errors))
      }

      if (info) {
        logger.info(JSON.stringify(info))
      }

      return new MailerResponse('OK', 'Email sent successfully')
    })
  } catch (error) {
    logger.error(<Error>error)
    throw new Error('Could not send email')
  }
}

export default mail
