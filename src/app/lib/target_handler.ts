import { FastifyInstance } from 'fastify'
import { MailerResponse } from '../class'
import { crypto, isEmail } from '../lib'
import { mail } from '../services'
import { sharedSecret } from '../templates'

const targetHandler = async (
  target: string,
  id: string,
  passphrase: string,
  server: FastifyInstance,
  errorOut: Function
): Promise<string | undefined> => {
  let encryptedTarget: string | undefined
  let mailSentSuccessfully: MailerResponse

  if (isEmail(target)) {
    try {
      mailSentSuccessfully = await mail(target, "Someone's shared a secret with you", sharedSecret(id), server)

      if (!mailSentSuccessfully) {
        return errorOut(424, 'Could not send email')
      }
    } catch (error) {
      const message = (<Error>error).message as string
      return errorOut(424, message)
    }
  }

  try {
    encryptedTarget = (await crypto.encryptSecret(target, passphrase)) as string
  } catch (error) {
    const message = (<Error>error).message as string
    return errorOut(424, message)
  }

  return encryptedTarget
}

export default targetHandler
