import is from '@sindresorhus/is'
import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import Options from '../class/options'
import Params from '../class/params'
import Passphrase from '../class/passphrase'
import del from '../db/del'
import get from '../db/get'

const destroy = async (
  req: FastifyRequest,
  res: FastifyReply,
  server: FastifyInstance,
  options: Options
): Promise<RouteHandlerMethod | Error | unknown> => {
  const params = <Params>req.params
  const id = params.id
  let { passphrase } = options

  // define error handler
  const errorOut = (status: number, message: string): Error => {
    let error = new Error(`(${req.id}) ${message}`)
    res.status(status).send({ error: message })
    throw error
  }

  // is there an id?
  if (!id) {
    return errorOut(400, 'id is required')
  }

  // make sure user-provided passphrase exist and is a string
  if (!passphrase || !is.string(passphrase)) {
    return errorOut(401, 'Passphrase is required\n(Secrets without passphrases cannot be manually deleted)')
  }

  // get the record
  const $record = await get(id)

  // if there's a record, continue
  if ($record && !is.error($record)) {
    const record = JSON.parse($record)
    const hashed = record.passphrase
    let { salt } = record
    let verified: boolean | Error = false

    // is there a salt?
    if (!is.string(salt)) {
      return errorOut(424, `Could not retrieve salt of secret ${id}`)
    }

    // does the record have passphrase?
    if (hashed && is.string(hashed)) {
      // verify the passphrase
      verified = await Passphrase.verify(passphrase, salt, hashed)
      if (!verified) {
        return errorOut(401, 'Passphrase is incorrect')
      }

      // delete the secret
      const result = await del(id)

      // if there's no error, proceed
      if (!is.error(result)) {
        server.log.info(`(${req.id}) Deleted secret ${id}: ${result}`)
        res.status(200).send({
          success: true
        })
      } else {
        return errorOut(424, `Could not delete secret ${id}`)
      }
    }
  } else {
    // if no record, return 404
    return errorOut(404, `Could not find secret ${id}`)
  }
}

export default destroy
