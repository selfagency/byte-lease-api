import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import ms from 'ms'
import { uid } from 'uid/secure'
import Options from '../class/options'
import Passphrase from '../class/passphrase'
import Record from '../class/record'
import set from '../db/set'
import { encryptSecret, generateSalt } from '../share/crypto'
import expiry from '../share/expiry'
import validations from '../share/validations'

const create = async (
  req: FastifyRequest,
  res: FastifyReply,
  server: FastifyInstance,
  options: Options
): Promise<RouteHandlerMethod | Error | undefined> => {
  // define error event
  const errorOut = (status: number, message: string): FastifyReply => {
    server.log.error(`(${req.id} ${message})`)
    return res.status(status).send({ error: message })
  }

  // validations
  try {
    options = await validations('create', options)
  } catch (error) {
    let message = (<Error>error).message as string
    const status = message.toLowerCase().includes('passphrase') ? 401 : 400
    return errorOut(status, (<Error>error).message)
  }

  // expand options
  const id = uid(48)
  let secret = options.secret as string
  const autodestruct = Boolean(options.autodestruct)
  const genPassphrase = Boolean(options.passphrase)

  // set expiration ttl
  let expire: number
  try {
    expire = await expiry(options.expire)
  } catch (error) {
    const message = (<Error>error).message as string
    return errorOut(500, message)
  }

  // if `passphrase === false`, then don't use one
  if (!genPassphrase) {
    let salt: string
    let target: string | undefined = options.target

    // generate salt in place of password
    try {
      salt = (await generateSalt()) as string
      server.log.info(`salt: ${salt}`)
    } catch (error) {
      const message = (<Error>error).message as string
      return errorOut(424, message)
    }

    // if that didn't fail and there's a secret to encrypt, continue
    if (salt && secret) {
      // encrypt the secret
      try {
        secret = (await encryptSecret(secret, salt)) as string
        server.log.info(`encryptedSecret: ${secret}`)
      } catch (error) {
        const message = (<Error>error).message as string
        return errorOut(424, message)
      }

      // if there's a target specified, encrypt that too
      if (target) {
        try {
          target = (await encryptSecret(target, salt)) as string
          server.log.info(`encryptedTarget: ${secret}`)
        } catch (error) {
          const message = (<Error>error).message as string
          return errorOut(424, message)
        }
      } else {
        target = undefined
      }

      try {
        // create the record
        const record = new Record(secret, target, undefined, salt, autodestruct)
        // commit the record
        const result = await set(id, record, expire)
        server.log.info(`(${req.id}) Create secret ${id}: ${result}`)

        // send the result to the client
        return res.status(200).send({
          id,
          target: options.target,
          expires: `${ms(expire * 1000)}`,
          result
        })
      } catch (error) {
        return errorOut(424, `Could not store secret ${id}`)
      }
    }
  } else {
    // if a passphrase is requested
    let credentials: Passphrase
    let target: string | undefined = options.target

    // generate a passphrase
    try {
      credentials = (await Passphrase.generate()) as Passphrase
      server.log.info(`credentials: ${JSON.stringify(credentials)}`)
    } catch (error) {
      return errorOut(424, `Could not generate credentials for secret ${id}`)
    }

    // encyrpt the secret
    try {
      secret = (await encryptSecret(secret, credentials.passphrase)) as string
    } catch (error) {
      const message = (<Error>error).message as string
      return errorOut(424, message)
    }

    // if there's a target, encrypt the target
    if (target) {
      try {
        target = (await encryptSecret(target, credentials.passphrase)) as string
      } catch (error) {
        return errorOut(424, `Could not encrypt secret ${id}`)
      }
    }

    try {
      // create the record
      const record = new Record(secret, target, credentials.hashed, credentials.salt, autodestruct)
      // commit the record
      const result = await set(id, record, expire)
      server.log.info(`(${req.id}) Create secret ${id}: ${result}`)

      // send the result to the client
      if (result === 'OK') {
        return res.status(200).send({
          id,
          passphrase: credentials.passphrase,
          target: target,
          expires: `${ms(expire * 1000)}`,
          result
        })
      } else {
        throw new Error(`Could not store secret`)
      }
    } catch (error) {
      const message = (<Error>error).message as string
      return errorOut(424, `${message} ${id}`)
    }
  }
}

export default create
