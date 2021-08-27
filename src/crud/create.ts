import ms from 'ms'
import { uid } from 'uid/secure'
import set from '../db/set'
import { Options } from '../main.d'
import { encryptSecret, generateSalt, Passphrase } from '../share/crypto'

class Record {
  value: string
  target?: string
  passphrase?: string
  salt?: string
  autodestruct: boolean

  constructor(
    value: string,
    target: string | undefined,
    passphrase: string | undefined,
    salt: string | undefined,
    autodestruct: boolean = true
  ) {
    this.value = value
    this.target = target
    this.passphrase = passphrase
    this.salt = salt
    this.autodestruct = autodestruct
  }
}

const create = async (req, res, options: Options, app) => {
  try {
    const key = uid(32)

    if (!options.passphrase) {
      const salt = await generateSalt()

      if (!(salt instanceof Error)) {
        const value = await encryptSecret(req.body.value, salt)
        const target = await encryptSecret(req.body.target, salt)
        const expire = (ms(req.body.expire) || ms('1d')) / 1000

        if (!(value instanceof Error) && !(target instanceof Error)) {
          const record = new Record(value, target, undefined, undefined, req.body.autodestruct)
          const result = await set(key, record, expire)
          app.logger.info(`create ${key}: ${result}`)

          res.status(200).json({
            key,
            target: req.body.target,
            expires: `${expire} seconds`,
            result
          })
        }
      }
    } else {
      const credentials = await Passphrase.generatePassphrase()

      if (!(credentials instanceof Error)) {
        const value = await encryptSecret(req.body.value, credentials.passphrase)
        const target = await encryptSecret(req.body.target, credentials.passphrase)
        const expire = (ms(req.body.expire) || ms('1d')) / 1000

        if (!(value instanceof Error) && !(target instanceof Error)) {
          const record = new Record(value, target, credentials.hashed, credentials.salt, req.body.autodestruct)
          const result = await set(key, record, expire)
          app.logger.info(`create ${key}: ${result}`)

          res.status(200).json({
            key,
            passphrase: credentials.passphrase,
            target: req.body.target,
            expires: `${expire} seconds`,
            result
          })
        }
      }
    }
  } catch (error) {
    app.logger.error(error)
    res.status(500).json(error)
  }
}

export default create
