import ms from 'ms'
import { uid } from 'uid/secure'
import Options from '../classes/options'
import Record from '../classes/record'
import set from '../db/set'
import { encryptSecret, generateSalt, Passphrase } from '../share/crypto'

const create = async (value: string, options: Options, app, res) => {
  try {
    // generate key
    const key = uid(32)

    // convert expiration to seconds
    const expire = (ms(options.expire) || ms('1d')) / 1000

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

          // create the record
          const record = new Record(value, target, undefined, salt, options.autodestruct)
          // commit the record
          const result = await set(key, record, expire)
          app.logger.info(`create ${key}: ${result}`)

          // send the result to the client
          res.status(200).json({
            key,
            target: options.target,
            expires: `${expire} seconds`,
            result
          })
        }
      }
    } else {
      // generate a passphrase
      const credentials = await Passphrase.generatePassphrase()

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

          // create the record
          const record = new Record(value, target, credentials.hashed, credentials.salt, options.autodestruct)
          // commit the record
          const result = await set(key, record, expire)
          app.logger.info(`create ${key}: ${result}`)

          // send the result to the client
          res.status(200).json({
            key,
            passphrase: credentials.passphrase,
            target: target,
            expires: `${expire} seconds`,
            result
          })
        }
      }
    }
  } catch (error) {
    // log error and return to client
    app.logger.error(error)
    res.status(500).json(error)
  }
}

export default create
