import is from '@sindresorhus/is'
import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import isIp from 'is-ip'
import { Options, Params, Query, ReadResponse, Record } from '../class'
import { crypto, validations } from '../lib'
import { del, get, ttl } from '../services/db'

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
  options.id = id

  server.log.debug(JSON.stringify(options))

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
    server.log.debug(JSON.stringify(record))
  } catch (error) {
    return errorOut(424, `Could not retrieve secret ${id}`)
  }

  if (!record) {
    return errorOut(404, `Secret ${id} not found`)
  }

  // if there's a record, continue
  const passphrase = options.passphrase
  const hashed = record.passphrase
  let { secret, target, selfDestruct, salt } = record
  let selfDestructSuccess: boolean = false
  let verified: boolean | Error = false

  // is there a salt?
  if (!salt) {
    return errorOut(424, `Could not retrieve salt of secret ${id}`)
  }

  // is there a passphrase?
  if (hashed && is.string(hashed)) {
    if (!is.string(passphrase)) {
      return errorOut(401, 'Passphrase is required')
    }

    verified = await crypto.verifyPassphrase(passphrase, hashed, salt)
    if (!verified) {
      return errorOut(401, 'Passphrase is incorrect')
    }
  }

  // is there a secret?
  if (!secret) {
    return errorOut(424, `Could not retrieve secret ${id}`)
  }

  // is there a target?
  let decryptedTarget: string
  if (target) {
    try {
      decryptedTarget = (await crypto.decryptSecret(target, passphrase?.toString() || salt)) as string
    } catch (error) {
      return errorOut(424, 'Could not decrypt secret')
    }

    if (isIp(decryptedTarget)) {
      verified = req?.ips?.includes(decryptedTarget) || false
      if (!verified) {
        return errorOut(401, 'Access to secret restricted by IP')
      }
    } else {
      const query = <Query>req.query
      verified = query.access_token === decryptedTarget
    }
  }

  // is there an selfDestruct?
  if (selfDestruct) {
    let response: boolean
    try {
      response = (await del(id)) as boolean
      selfDestructSuccess = true
      server.log.info(`(${req.id}) Secret ${id} selfDestructed: ${response}`)
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
  let decryptedSecret: string
  try {
    decryptedSecret = (await crypto.decryptSecret(secret, passphrase?.toString() || salt)) as string
    server.log.info(`(${req.id}) Secret ${id} successfully retrieved`)
    return res.status(200).send(new ReadResponse(decryptedSecret, selfDestructSuccess, expires))
  } catch (error) {
    return errorOut(424, `Could not decrypt secret ${id}`)
  }
}

export default read
