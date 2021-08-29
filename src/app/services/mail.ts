import { FastifyInstance } from 'fastify'
import MailerResponse from '../class/mailer_response'

const mail = async (to: string, subject: string, text: string, server: FastifyInstance) => {
  const { mailer, log } = server

  return mailer.sendMail({ to, subject, text }, (errors: Error[]) => {
    if (errors) {
      errors.forEach(error => log.error(error))
      throw new Error('Could not send email')
    }

    return new MailerResponse('OK', 'Email sent successfully')
  })
}

export default mail
