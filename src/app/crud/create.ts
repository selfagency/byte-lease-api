import is from '@sindresorhus/is'
import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import ms from 'ms'
import { uid } from 'uid/secure'
import { Credentials, Options, Record } from '../class'
import { set } from '../db'
import { crypto, expiry, targetHandler, validations } from '../lib'

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

  const createRecord = async (
    id: string,
    passphrase: Credentials | string | undefined,
    target: string | undefined,
    encryptedSecret: string,
    encryptedTarget: string | undefined,
    selfDestruct: boolean,
    expire: number
  ) => {
    try {
      // parse passphrase
      let hashed: string | undefined, salt: string | undefined
      if (passphrase && !is.string(passphrase)) {
        hashed = passphrase.hashed
        salt = passphrase.salt
      }

      // create the record
      const record = new Record(encryptedSecret, encryptedTarget, hashed, salt, selfDestruct)

      // commit the record
      const result = await set(id, record, expire)
      server.log.info(`(${req.id}) Create secret ${id}: ${result}`)

      // send the result to the client
      if (result === 'OK') {
        return res.status(200).send({
          id,
          passphrase: is.string(passphrase) ? passphrase : passphrase?.passphrase,
          target,
          selfDestruct,
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
  const selfDestruct = Boolean(options.selfDestruct)
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
        encryptedSecret = (await crypto.encryptSecret(secret, salt)) as string
      } catch (error) {
        const message = (<Error>error).message as string
        return errorOut(424, message)
      }

      // if there's a target, handle then encrypt the target
      const encryptedTarget: string | undefined = target
        ? await targetHandler(target, id, salt, server, errorOut)
        : undefined

      return createRecord(id, undefined, target, encryptedSecret, encryptedTarget, selfDestruct, expire)
    }
  } else {
    // if a passphrase is requested
    let credentials: Credentials
    let target: string | undefined = options.target

    // generate a passphrase
    try {
      credentials = (await crypto.generatePassphrase()) as Credentials
    } catch (error) {
      return errorOut(424, `Could not generate credentials for secret ${id}`)
    }

    // encrypt the secret
    let encryptedSecret: string
    try {
      encryptedSecret = (await crypto.encryptSecret(secret, credentials.passphrase)) as string
    } catch (error) {
      const message = (<Error>error).message as string
      return errorOut(424, message)
    }

    // if there's a target, handle then enrypt the target
    const encryptedTarget: string | undefined = target
      ? await targetHandler(target, id, credentials.passphrase, server, errorOut)
      : undefined

    return createRecord(id, credentials, target, encryptedSecret, encryptedTarget, selfDestruct, expire)
  }
}

export default create
