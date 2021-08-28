import { FastifyInstance, FastifyReply } from 'fastify'
import apiRequest from '../classes/api_request'
import Options from '../classes/options'
import del from '../db/del'

const destroy = async (req: apiRequest, res: FastifyReply, app: FastifyInstance, options: Options) => {
  const { key, passphrase } = options

  const errorOut = (status: number, message: string): Error => {
    let error = new Error(`(${req.id}) ${message}`)
    res.status(status).send({ error: message })
    return error
  }

  if (!key) {
    return errorOut(400, 'Key is required')
  }

  const result = await del(key)
  res.status(200).send(result)
}

export default destroy
