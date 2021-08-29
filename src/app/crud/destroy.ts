import is from '@sindresorhus/is'
import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import { Options, Params, Record } from '../class'
import { crypto, validations } from '../lib'
import { del, get } from '../services/db'

const destroy = async (
  req: FastifyRequest,
  res: FastifyReply,
  server: FastifyInstance,
  options: Options
): Promise<RouteHandlerMethod | Error | unknown> => {
  // define error handler
  const errorOut = (status: number, message: string): FastifyReply => {
    server.log.error(`(${req.id}) ${message}`)
    return res.status(status).send({ error: message })
  }

  // get key
  const params = <Params>req.params
  const id = (params.id || options.id) as string
  options.id = id

  // validate options
  try {
    options = await validations('destroy', options)
  } catch (error) {
    const message = (<Error>error).message as string
    const status = message.toLowerCase().includes('passphrase') ? 401 : 400
    return errorOut(status, message)
  }

  // get the record
  let record: Record
  try {
    const $record = (await get(id)) as string
    record = JSON.parse($record) as Record
  } catch (error) {
    return errorOut(404, `Secret with key ${id} not found`)
  }

  const hashed = record.passphrase
  const salt = record.salt
  const passphrase = options.passphrase as string
  let verified: boolean | Error = false

  // is there a salt?
  if (!is.string(salt)) {
    return errorOut(424, `Could not retrieve salt of secret ${id}`)
  }

  // does the record have passphrase?
  if (hashed && is.string(hashed)) {
    // verify the passphrase
    try {
      if (is.string(passphrase)) {
        verified = await crypto.verifyPassphrase(passphrase, hashed, salt)
      } else {
        verified = false
      }
    } catch (error) {
      return errorOut(424, `Could not verify passphrase of secret ${id}`)
    }

    if (!verified) {
      server.log.error(`(${req.id}) Failed passphrase attempt on ${id}`)
      return errorOut(401, 'Passphrase is incorrect')
    }

    // delete the secret
    try {
      const result = await del(id)
      server.log.info(`(${req.id}) Deleted secret ${id}: ${result}`)
      return res.status(200).send({
        success: true
      })
    } catch (error) {
      return errorOut(424, `Could not delete secret ${id}`)
    }
  } else {
    return errorOut(424, `Could not retrieve passphrase of secret ${id}`)
  }
}

export default destroy
