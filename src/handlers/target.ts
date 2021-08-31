import { FastifyInstance, FastifyReply } from 'fastify'
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
): Promise<string | FastifyReply> => {
  try {
    if (isEmail(target)) {
      const mailerResponse = (await mail(
        target,
        'Someone has shared a secret with you',
        sharedSecret(id)
      )) as MailerResponse

      if (mailerResponse && mailerResponse.status === 'Error') {
        return errorOut(424, mailerResponse.message)
      } else if (mailerResponse && mailerResponse.status === 'OK') {
        server.log.debug(JSON.stringify(mailerResponse))
      }
    }

    const encryptedTarget = (await crypto.encryptSecret(target, passphrase)) as string
    return encryptedTarget
  } catch (error) {
    const message = (<Error>error).message as string
    return errorOut(424, message)
  }
}

export default targetHandler
