import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import ms from 'ms'
import { uid } from 'uid/secure'
import Credentials from '../class/credentials'
import Options from '../class/options'
import Record from '../class/record'
import set from '../db/set'
import { encryptSecret, generatePassphrase } from '../share/crypto'
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
  let secret: string = options.secret as string
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
      salt = uid(64)
    } catch (error) {
      const message = (<Error>error).message as string
      return errorOut(424, message)
    }

    // if that didn't fail and there's a secret to encrypt, continue
    if (salt && secret.length) {
      // encrypt the secret
      let encryptedSecret: string
      try {
        encryptedSecret = (await encryptSecret(secret, salt)) as string
      } catch (error) {
        const message = (<Error>error).message as string
        return errorOut(424, message)
      }

      // if there's a target specified, encrypt that too
      let encryptedTarget: string | undefined
      if (target) {
        try {
          encryptedTarget = (await encryptSecret(target, salt)) as string
        } catch (error) {
          const message = (<Error>error).message as string
          return errorOut(424, message)
        }
      } else {
        encryptedTarget = undefined
      }

      try {
        // create the record
        const record = new Record(encryptedSecret, encryptedTarget, undefined, salt, autodestruct)
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
    let credentials: Credentials
    let target: string | undefined = options.target

    // generate a passphrase
    try {
      credentials = (await generatePassphrase()) as Credentials
    } catch (error) {
      return errorOut(424, `Could not generate credentials for secret ${id}`)
    }

    // encrypt the secret
    let encryptedSecret: string
    try {
      encryptedSecret = (await encryptSecret(secret, credentials.passphrase)) as string
    } catch (error) {
      const message = (<Error>error).message as string
      return errorOut(424, message)
    }

    // if there's a target, encrypt the target
    let encryptedTarget: string | undefined
    if (target) {
      try {
        encryptedTarget = (await encryptSecret(target, credentials.passphrase)) as string
      } catch (error) {
        return errorOut(424, `Could not encrypt secret ${id}`)
      }
    } else {
      encryptedTarget = undefined
    }

    try {
      const { hashed, salt } = credentials

      // create the record
      const record = new Record(encryptedSecret, encryptedTarget, hashed, salt, autodestruct)

      // commit the record
      const result = await set(id, record, expire)
      server.log.info(`(${req.id}) Create secret ${id}: ${result}`)

      // send the result to the client
      if (result === 'OK') {
        return res.status(200).send({
          id,
          passphrase: credentials.passphrase,
          target: target,
          autodestruct,
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
