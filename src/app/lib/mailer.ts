import MailerResponse from '../class/mailer_response'

const mailer = async (to: string, subject: string, text: string, server) => {
  const { mailer, log } = server

  return mailer.sendMail({ to, subject, text }, errors => {
    if (errors) {
      errors.forEach(error => log.error(error))
      throw new Error('Could not send email')
    }

    return new MailerResponse('OK', 'Email sent successfully')
  })
}

export default mailer
