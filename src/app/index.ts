import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import Options from './class/options'
import create from './crud/create'
import destroy from './crud/destroy'
import read from './crud/read'
import update from './crud/update'

const getOpts = (opts: Options) => {
  return new Options(opts.id, opts.secret, opts.passphrase, opts.target, opts.autodestruct, opts.expire)
}

const app = (server: FastifyInstance) => {
  server.get('/:id', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await read(req, res, server, getOpts(<Options>req.body))
    } catch (error) {
      server.log.error(error)
    }
  })

  server.post('/create', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const secret = getOpts(<Options>req.body).secret
      return await create(req, res, server, getOpts(<Options>req.body))
    } catch (error) {
      server.log.error(error)
    }
  })

  server.put('/:id/update', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await update(req, res, server, getOpts(<Options>req.body))
    } catch (error) {
      server.log.error(error)
    }
  })

  server.delete('/:id/destroy', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await destroy(req, res, server, getOpts(<Options>req.body))
    } catch (error) {
      server.log.error(error)
    }
  })

  server.get('/', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      await res.send('OK')
    } catch (error) {
      server.log.error(error)
    }
  })
}

export default app
