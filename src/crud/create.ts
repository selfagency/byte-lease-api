import is from '@sindresorhus/is'
import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import ms from 'ms'
import { uid } from 'uid/secure'
import Options from '../class/options'
import Passphrase from '../class/passphrase'
import Record from '../class/record'
import set from '../db/set'
import { encryptSecret, generateSalt } from '../share/crypto'

const create = async (
  req: FastifyRequest,
  res: FastifyReply,
  app: FastifyInstance,
  options: Options
): Promise<RouteHandlerMethod | Error | undefined> => {
  // define error event
  const errorOut = (status: number, message: string): Error => {
    let error = new Error(`(${req.id}) ${message}`)
    res.status(status).send({ error: message })
    throw error
  }

  // generate id
  const id = uid(32)

  // convert expiration to seconds
  let expire: string | number
  const oneDay = ms('1d') / 1000
  const twoDays = ms('2d') / 1000

  if (is.string(options.expire)) {
    expire = ms(options.expire) / 1000
  } else if (is.number(options.expire)) {
    expire = options.expire
  } else {
    expire = oneDay
  }

  if (expire > twoDays) {
    expire = twoDays
  }

  // is there a secret?
  let secret = options.secret
  if (!is.string(secret)) {
    return errorOut(400, 'Secret is required')
  }

  // if `passphrase === false`, then don't use one
  if (!options.passphrase) {
    // generate salt in place of password
    const salt = await generateSalt()

    // if that didn't fail and there's a secret to encrypt, continue
    if (!is.error(salt) && secret) {
      // encrypt the secret
      const encryptedsecret = await encryptSecret(secret, salt)

      // if there's a target specified, encrypt that too
      let target: string | Error | undefined = undefined
      if (options.target) {
        target = await encryptSecret(options.target, salt)
      }

      // if there's an encrypted secret, continue (if not it should throw)
      if (!is.error(encryptedsecret)) {
        // if target errors, set it to `undefined` (though it should throw)
        if (is.error(target)) {
          target = undefined
        }

        try {
          // create the record
          const record = new Record(secret, target, undefined, salt, options.autodestruct)
          // commit the record
          const result = await set(id, record, expire)
          app.log.info(`(${req.id}) Create secret ${id}: ${result}`)

          // send the result to the client
          res.status(200).send({
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
      return errorOut(424, 'Could not generate salt')
    }
  } else {
    // generate a passphrase
    const credentials = await Passphrase.generate()

    // if that didn't error, continue (if it did, it should throw)
    if (!is.error(credentials)) {
      // encyrpt the secret
      const encryptedsecret = await encryptSecret(secret, credentials.passphrase)
      // if there's a target, encrypt the target
      let target: string | Error | undefined = undefined
      if (options.target) {
        target = await encryptSecret(options.target, credentials.passphrase)
      }

      // if there's an encrypted secret, continue (if not it should throw)
      if (!is.error(encryptedsecret)) {
        // if target errors, set it to undefined (though it should throw)
        if (is.error(target)) {
          target = undefined
        }

        try {
          // create the record
          const record = new Record(secret, target, credentials.hashed, credentials.salt, options.autodestruct)
          // commit the record
          const result = await set(id, record, expire)
          app.log.info(`(${req.id}) Create secret ${id}: ${result}`)

          // send the result to the client
          if (result === 'OK') {
            res.status(200).send({
              id,
              passphrase: credentials.passphrase,
              target: target,
              expires: `${ms(expire * 1000)}`,
              result
            })
            return
          } else {
            return errorOut(424, `Could not store secret ${id}: ${result}`)
          }
        } catch (error) {
          return errorOut(424, `Could not store secret ${id}`)
        }
      } else {
        return errorOut(424, `Could not encrypt secret ${id}`)
      }
    } else {
      return errorOut(424, `Could not generate credentials for secret ${id}`)
    }
  }
}

export default create
