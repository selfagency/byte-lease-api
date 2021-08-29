import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import Options from './class/options'
import create from './crud/create'
import destroy from './crud/destroy'
import read from './crud/read'
import update from './crud/update'

const getOpts = (opts: Options) => {
  if (opts) {
    return new Options(
      opts.id || undefined,
      opts.secret,
      opts.passphrase || true,
      opts.target,
      opts.autodestruct,
      opts.expire
    )
  } else {
    return new Options(undefined, undefined, undefined, undefined, undefined, undefined)
  }
}

const app = (server: FastifyInstance) => {
  server.post('/create', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const options = getOpts(<Options>req.body)
      return await create(req, res, server, options)
    } catch (error) {
      server.log.error(error)
      throw error
    }
  })

  server.route({
    url: '/:id',
    method: ['GET', 'POST'],
    handler: async (req: FastifyRequest, res: FastifyReply) => {
      try {
        const options = getOpts(<Options>req.body)
        return await read(req, res, server, options)
      } catch (error) {
        server.log.error(error)
        throw error
      }
    }
  })

  server.put('/:id', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const options = getOpts(<Options>req.body)
      return await update(req, res, server, options)
    } catch (error) {
      server.log.error(error)
      throw error
    }
  })

  server.delete('/:id', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const options = getOpts(<Options>req.body)
      return await destroy(req, res, server, options)
    } catch (error) {
      server.log.error(error)
      throw error
    }
  })

  server.get('/favicon.ico', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      await res.status(404).send('Not found')
    } catch (error) {
      server.log.error(error)
      throw error
    }
  })

  server.get('/', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      await res.send('OK')
    } catch (error) {
      server.log.error(error)
      throw error
    }
  })

  return server
}

export default app
