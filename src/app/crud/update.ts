import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import { Options, Params } from '../class'

const update = async (
  req: FastifyRequest,
  res: FastifyReply,
  server: FastifyInstance,
  options: Options
): Promise<RouteHandlerMethod | Error | unknown> => {
  const params = <Params>req.params
  const id = params.id

  return res.status(501).send(`Cannot update secret ${id}`)
}

export default update
