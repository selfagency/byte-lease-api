import is from '@sindresorhus/is'
import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import isIp from 'is-ip'
import ms from 'ms'
import Options from '../class/options'
import Params from '../class/params'
import Passphrase from '../class/passphrase'
import ReadResponse from '../class/read_response'
import del from '../db/del'
import get from '../db/get'
import ttl from '../db/ttl'
import { decryptSecret } from '../share/crypto'

const read = async (
  req: FastifyRequest,
  res: FastifyReply,
  app: FastifyInstance,
  options: Options
): Promise<RouteHandlerMethod | Error | unknown> => {
  const params = <Params>req.params
  const id = params.id
  let autodestructSuccess = false
  let { passphrase } = options

  // define error event
  const errorOut = (status: number, message: string): Error => {
    let error = new Error(`(${req.id}) ${message}`)
    res.status(status).send({ error: message })
    throw error
  }

  // make sure user-provided passphrase is a string
  if (passphrase) {
    passphrase = passphrase.toString()
  }

  // is there a id?
  if (!id) {
    return errorOut(400, 'id is required')
  }

  // get the record
  const $record = await get(id)

  // if there's a record, continue
  if ($record && !is.error($record)) {
    const record = JSON.parse($record)
    const hashed = record.passphrase
    const expires = await ttl(id)
    let { secret, target, autodestruct, salt } = record
    let verified: boolean | Error = false

    // is there a salt?
    if (!is.string(salt)) {
      return errorOut(424, `Could not retrieve salt of secret ${id}`)
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

    // is the secret legit data?
    if (!is.string(secret)) {
      return errorOut(424, `Could not retrieve secret ${id}`)
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
      const response = await del(id)
      if (!is.error(response)) {
        autodestructSuccess = true
        app.log.info(`(${req.id}) Secret ${id} successfully autodestructed`)
      } else {
        return errorOut(424, `Could not delete secret ${id}`)
      }
    }

    // is there a ttl?
    if (is.error(expires)) {
      app.log.error(`${req.id}) Could not read expiration: ${expires}`)
      return errorOut(424, `Could not read expiration of secret ${id}`)
    }

    // return the secret
    secret = await decryptSecret(secret, passphrase || salt)
    if (!is.error(secret)) {
      app.log.info(`(${req.id}) Secret ${id} successfully retrieved`)
      res.status(200).send(new ReadResponse(secret, autodestructSuccess, is.number(expires) ? ms(expires * 1000) : '0'))
    } else {
      return errorOut(424, `Could not decrypt secret ${id}`)
    }
  } else {
    // if no record, return 404
    return errorOut(404, `Could not find secret ${id}`)
  }
}

export default read
