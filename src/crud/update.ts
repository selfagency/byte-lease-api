import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import Options from '../class/options'
import Params from '../class/params'

const update = async (
  req: FastifyRequest,
  res: FastifyReply,
  app: FastifyInstance,
  options: Options
): Promise<RouteHandlerMethod | Error | unknown> => {
  const params = <Params>req.params
  const id = params.id

  return res.status(501).send(`Cannot update secret ${id}`)
}

export default update
