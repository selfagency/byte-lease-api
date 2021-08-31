import { TransportOptions } from 'nodemailer'
import { MailerResponse } from '../../../../src/app/class'
import mail from '../../../../src/app/services/mail'
const { base64decode } = require('nodejs-base64')

describe('services/mail', () => {
  const to =
    '\u006d\u0061\u0069\u006c\u0065\u0072\u005f\u0074\u0065\u0073\u0074\u0040\u0062\u0079\u0074\u0065\u002e\u006c\u0065\u0061\u0073\u0065'
  const subject = 'Test email'
  const message = 'This is a test'

  const options = <TransportOptions>{
    host: base64decode('c210cC5tYWlsdHJhcC5pbw=='),
    port: base64decode('MjUyNQ=='),
    secure: JSON.parse(base64decode('ZmFsc2U=')),
    auth: { user: base64decode('ZWI1ZDAzNTUxYmU1OTg='), pass: base64decode('N2FkMmI0OGNlN2Q4N2U=') }
  }

  test('send mail (good)', async () => {
    const result = await mail(to, subject, message, options)
    expect(result).toBeInstanceOf(MailerResponse)
    expect(result.status).toEqual('OK')
  })

  test('send mail (bad)', async () => {
    const result = await mail('not-an-email', subject, message, options)
    expect(result).toBeInstanceOf(MailerResponse)
    expect(result.status).toEqual('Failure')
  })
})
