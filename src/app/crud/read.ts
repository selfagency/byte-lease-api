import is from '@sindresorhus/is'
import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import isIp from 'is-ip'
import Options from '../class/options'
import Params from '../class/params'
import Passphrase from '../class/passphrase'
import ReadResponse from '../class/read_response'
import Record from '../class/record'
import del from '../db/del'
import get from '../db/get'
import ttl from '../db/ttl'
import { decryptSecret } from '../share/crypto'
import validations from '../share/validations'

const read = async (
  req: FastifyRequest,
  res: FastifyReply,
  server: FastifyInstance,
  options: Options
): Promise<RouteHandlerMethod | Error | unknown> => {
  // define error event
  const errorOut = (status: number, message: string): FastifyReply => {
    server.log.error(`(${req.id}) ${message}`)
    return res.status(status).send({ error: message })
  }

  // get key
  const params = <Params>req.params
  const id = (params.id || options.id) as string

  // validate options
  try {
    options = await validations('read', options)
  } catch (error) {
    const message = (<Error>error).message as string
    const status = message.toLowerCase().includes('passphrase') ? 401 : 400
    return errorOut(status, message)
  }

  let record: Record
  try {
    // get the record
    const $record = (await get(id)) as string
    record = JSON.parse($record)
  } catch (error) {
    return errorOut(404, `Secret ${id} not found`)
  }

  // if there's a record, continue
  const passphrase = options.passphrase
  const hashed = record.passphrase
  let { secret, target, autodestruct, salt } = record
  let autodestructSuccess: boolean = false
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
  if (is.string(target)) {
    try {
      target = (await decryptSecret(target, passphrase?.toString() || salt)) as string
    } catch (error) {
      return errorOut(424, 'Could not decrypt secret')
    }
    if (isIp(target)) {
      verified = req?.ips?.includes(target) || false
      if (!verified) {
        return errorOut(401, 'Access to secret restricted by IP')
      }
    }
  }

  // is there an autodestruct?
  if (autodestruct) {
    let response: string
    try {
      response = (await del(id)) as string
      autodestructSuccess = true
      server.log.info(`(${req.id}) Secret ${id} autodestructed: ${response}`)
    } catch (error) {
      return errorOut(424, `Could not delete secret ${id}`)
    }
  }

  // is there a ttl?
  let expires
  try {
    expires = (await ttl(id)) as string
  } catch (error) {
    server.log.error(`${req.id}) Could not read expiration: ${expires}`)
    return errorOut(424, `Could not read expiration of secret ${id}`)
  }

  // return the secret
  try {
    secret = (await decryptSecret(secret, passphrase?.toString() || salt)) as string
    server.log.info(`(${req.id}) Secret ${id} successfully retrieved`)
    return res.status(200).send(new ReadResponse(secret, autodestructSuccess, expires))
  } catch (error) {
    return errorOut(424, `Could not decrypt secret ${id}`)
  }
}

export default read
