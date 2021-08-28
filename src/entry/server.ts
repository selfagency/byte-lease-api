import { FastifyInstance, FastifyReply } from 'fastify'
import apiRequest from '../classes/api_request'
import Options from '../classes/options'
import create from '../crud/create'
import destroy from '../crud/destroy'
import read from '../crud/read'
import update from '../crud/update'

const server = (app: FastifyInstance) => {
  app.route({
    url: '/:id',
    method: 'GET',
    handler: async (req: apiRequest, res: FastifyReply) => {
      try {
        const options = new Options(
          req.body.key,
          req.body.passphrase,
          req.body.target,
          req.body.autodestruct,
          req.body.expire
        )
        await read(req, res, app, options)
      } catch (error) {
        app.log.error(error)
      }
    }
  })

  app.route({
    url: '/:id/create',
    method: 'POST',
    handler: async (req: apiRequest, res: FastifyReply) => {
      try {
        const options = new Options(
          req.body.key,
          req.body.passphrase,
          req.body.target,
          req.body.autodestruct,
          req.body.expire
        )
        await create(req, res, app, options, req.body.value)
      } catch (error) {
        app.log.error(error)
      }
    }
  })

  app.route({
    url: '/:id/update',
    method: 'PUT',
    handler: async (req: apiRequest, res: FastifyReply) => {
      try {
        const options = new Options(
          req.body.key,
          req.body.passphrase,
          req.body.target,
          req.body.autodestruct,
          req.body.expire
        )
        await update(req, res, app, options)
      } catch (error) {
        app.log.error(error)
      }
    }
  })

  app.route({
    url: '/:id/destroy',
    method: 'DELETE',
    handler: async (req: apiRequest, res: FastifyReply) => {
      try {
        const options = new Options(
          req.body.key,
          req.body.passphrase,
          req.body.target,
          req.body.autodestruct,
          req.body.expire
        )
        await destroy(req, res, app, options)
      } catch (error) {
        app.log.error(error)
      }
    }
  })

  app.route({
    url: '/',
    method: 'GET',
    handler: async (req, res) => {
      try {
        await res.send('OK')
      } catch (error) {
        app.log.error(error)
      }
    }
  })
}

export default server
