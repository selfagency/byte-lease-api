import Fastify from 'fastify'

const app = Fastify({
  logger: true
})

app.register(import('./entry/server'))

export default async (req, res) => {
  await app.ready()
  app.server.emit('request', req, res)
}
