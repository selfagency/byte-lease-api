import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import Options from '../class/options'
import create from '../crud/create'
import destroy from '../crud/destroy'
import read from '../crud/read'
import update from '../crud/update'

const getOpts = (opts: Options) => {
  return new Options(opts.id, opts.secret, opts.passphrase, opts.target, opts.autodestruct, opts.expire)
}

const server = (app: FastifyInstance) => {
  app.get('/:id', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await read(req, res, app, getOpts(<Options>req.body))
    } catch (error) {
      app.log.error(error)
    }
  })

  app.post('/create', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const secret = getOpts(<Options>req.body).secret
      return await create(req, res, app, getOpts(<Options>req.body))
    } catch (error) {
      app.log.error(error)
    }
  })

  app.put('/:id/update', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await update(req, res, app, getOpts(<Options>req.body))
    } catch (error) {
      app.log.error(error)
    }
  })

  app.delete('/:id/destroy', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      return await destroy(req, res, app, getOpts(<Options>req.body))
    } catch (error) {
      app.log.error(error)
    }
  })

  app.get('/', {}, async (req: FastifyRequest, res: FastifyReply) => {
    try {
      await res.send('OK')
    } catch (error) {
      app.log.error(error)
    }
  })
}

export default server
