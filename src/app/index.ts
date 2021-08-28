import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import Options from './class/options'
import create from './crud/create'
import destroy from './crud/destroy'
import read from './crud/read'
import update from './crud/update'

const getOpts = (opts: Options) => {
  return new Options(
    (opts.id = undefined),
    opts.secret,
    (opts.passphrase = true),
    opts.target,
    opts.autodestruct,
    opts.expire
  )
}

const app = (server: FastifyInstance) => {
  server.post('/create', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await create(req, res, server, getOpts(<Options>req.body))
    } catch (error) {
      server.log.error(error)
      throw error
    }
  })

  server.get('/:id', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await read(req, res, server, getOpts(<Options>req.body))
    } catch (error) {
      server.log.error(error)
      throw error
    }
  })

  server.put('/:id', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await update(req, res, server, getOpts(<Options>req.body))
    } catch (error) {
      server.log.error(error)
      throw error
    }
  })

  server.delete('/:id', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await destroy(req, res, server, getOpts(<Options>req.body))
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
