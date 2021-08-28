import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import Options from '../class/options'

const update = async (
  req: FastifyRequest,
  res: FastifyReply,
  app: FastifyInstance,
  options: Options
): Promise<RouteHandlerMethod | Error | unknown> => {
  return res.status(200).send('OK')
}

export default update
