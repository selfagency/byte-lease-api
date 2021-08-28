import is from '@sindresorhus/is'
import { FastifyInstance, FastifyReply } from 'fastify'
import ms from 'ms'
import { uid } from 'uid/secure'
import apiRequest from '../classes/api_request'
import Options from '../classes/options'
import Passphrase from '../classes/passphrase'
import Record from '../classes/record'
import set from '../db/set'
import { encryptSecret, generateSalt } from '../share/crypto'

const create = async (req: apiRequest, res: FastifyReply, app: FastifyInstance, options: Options, value: string) => {
  // define error event
  const errorOut = (status: number, message: string): Error => {
    let error = new Error(`(${req.id}) ${message}`)
    res.status(status).send({ error: message })
    return error
  }

  // generate key
  const key = uid(32)

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

  // if `passphrase === false`, then don't use one
  if (!options.passphrase) {
    // generate salt in place of password
    const salt = await generateSalt()

    // if that didn't fail and there's a value to encrypt, continue
    if (!(salt instanceof Error) && value && options) {
      // encrypt the secret
      const encryptedValue = await encryptSecret(value, salt)

      // if there's a target specified, encrypt that too
      let target: string | Error | undefined = undefined
      if (options.target) {
        target = await encryptSecret(options.target, salt)
      }

      // if there's an encrypted value, continue (if not it should throw)
      if (!(encryptedValue instanceof Error)) {
        // if target errors, set it to `undefined` (though it should throw)
        if (target instanceof Error) {
          target = undefined
        }

        try {
          // create the record
          const record = new Record(value, target, undefined, salt, options.autodestruct)
          // commit the record
          const result = await set(key, record, expire)
          app.log.info(`(${req.id}) create ${key}: ${result}`)

          // send the result to the client
          res.status(200).send({
            key,
            target: options.target,
            expires: `${expire} seconds`,
            result
          })
        } catch (error) {
          return errorOut(424, 'Could not store secret')
        }
      }
    } else {
      return errorOut(424, 'Could not generate salt')
    }
  } else {
    // generate a passphrase
    const credentials = await Passphrase.generate()

    // if that didn't error, continue (if it did, it should throw)
    if (!(credentials instanceof Error)) {
      // encyrpt the secret
      const encryptedValue = await encryptSecret(value, credentials.passphrase)
      // if there's a target, encrypt the target
      let target: string | Error | undefined = undefined
      if (options.target) {
        target = await encryptSecret(options.target, credentials.passphrase)
      }

      // if there's an encrypted value, continue (if not it should throw)
      if (!(encryptedValue instanceof Error)) {
        // if target errors, set it to undefined (though it should throw)
        if (target instanceof Error) {
          target = undefined
        }

        try {
          // create the record
          const record = new Record(value, target, credentials.hashed, credentials.salt, options.autodestruct)
          // commit the record
          const result = await set(key, record, expire)
          app.log.info(`(${req.id}) create ${key}: ${result}`)

          // send the result to the client
          res.status(200).send({
            key,
            passphrase: credentials.passphrase,
            target: target,
            expires: `${ms(expire * 1000)}`,
            result
          })
        } catch (error) {
          return errorOut(424, 'Could not store secret')
        }
      } else {
        return errorOut(424, 'Could not encrypt secret')
      }
    } else {
      return errorOut(424, 'Could not generate credentials')
    }
  }
}

export default create
