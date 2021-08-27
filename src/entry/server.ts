import Options from '../classes/options'
import create from '../crud/create'
import destroy from '../crud/destroy'
import read from '../crud/read'
import update from '../crud/update'

const server = app => {
  app.route({
    path: '/:id',
    method: 'GET',
    handler: async (req, res) => {
      try {
        await read(req, res)
      } catch (error) {
        app.logger.error(error)
      }
    }
  })

  app.route({
    path: '/:id/create',
    method: 'POST',
    handler: async (req, res) => {
      try {
        const options = new Options(
          req.body.key,
          req.body.passphrase,
          req.body.target,
          req.body.autodestruct,
          req.body.expire
        )
        await create(req.body.value, options, app, res)
      } catch (error) {
        app.logger.error(error)
      }
    }
  })

  app.route({
    path: '/:id/update',
    method: 'PUT',
    handler: async (req, res) => {
      try {
        await update(req, res)
      } catch (error) {
        app.logger.error(error)
      }
    }
  })

  app.route({
    path: '/:id/destroy',
    method: 'DELETE',
    handler: async (req, res) => {
      try {
        await destroy(req, res)
      } catch (error) {
        app.logger.error(error)
      }
    }
  })

  app.route({
    path: '/',
    method: 'GET',
    handler: async (req, res) => {
      try {
        await res.send('OK')
      } catch (error) {
        app.logger.error(error)
      }
    }
  })
}

export default server
