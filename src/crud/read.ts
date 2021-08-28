import is from '@sindresorhus/is'
import { FastifyInstance, FastifyReply } from 'fastify'
import isIp from 'is-ip'
import apiRequest from '../classes/api_request'
import Options from '../classes/options'
import Passphrase from '../classes/passphrase'
import del from '../db/del'
import get from '../db/get'
import { decryptSecret } from '../share/crypto'

const read = async (
  req: apiRequest,
  res: FastifyReply,
  app: FastifyInstance,
  options: Options
): Promise<void | Error> => {
  let { key, passphrase } = options

  // define error event
  const errorOut = (status: number, message: string): Error => {
    let error = new Error(`(${req.id}) ${message}`)
    res.status(status).send({ error: message })
    return error
  }

  // make sure user-provided passphrase is a string
  if (passphrase) {
    passphrase = passphrase.toString()
  }

  // is there a key?
  if (!key) {
    return errorOut(400, 'Key is required')
  }

  // get the record
  const $record = await get(key)

  // if there's a record, continue
  if ($record && !($record instanceof Error)) {
    const record = JSON.parse($record)
    const hashed = record.passphrase
    let { value, target, autodestruct, salt } = record
    let verified: boolean | Error = false

    // is there a salt?
    if (!is.string(salt)) {
      return errorOut(424, `${key} missing salt`)
    }

    // is there a passphrase?
    if (hashed && is.string(hashed)) {
      if (!is.string(passphrase)) {
        return errorOut(401, 'Passphrase is required')
      }

      verified = await Passphrase.verify(passphrase, salt, hashed)
      if (!verified) {
        return errorOut(401, 'Passphrase is incorrect')
      }
    }

    // is the value legit data?
    if (!is.string(value)) {
      return errorOut(424, `${key} missing secret`)
    }

    // is there a target?
    target = await decryptSecret(target, passphrase || salt)
    if (isIp(target)) {
      verified = req?.ips?.includes(target) || false
      if (!verified) {
        return errorOut(401, 'Access restricted by IP')
      }
    }

    // is there an autodestruct?
    if (autodestruct) {
      const response = await del(key)
      if (response instanceof Error) {
        return errorOut(424, `${key} could not be deleted`)
      } else {
        app.log.info(`(${req.id}) ${key} successfully autodestructed`)
      }
    }

    // return the secret
    value = await decryptSecret(value, passphrase || salt)
    if (!(value instanceof Error)) {
      return value
    } else {
      return errorOut(424, 'Could not decrypt secret')
    }
  } else {
    // if no record, return 404
    return errorOut(404, `Could not find secret ${key}`)
  }
}

export default read
