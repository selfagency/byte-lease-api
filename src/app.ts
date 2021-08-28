import * as Sentry from '@sentry/node'
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import FastifyExpress from 'fastify-express'

const app: FastifyInstance = Fastify({
  logger: true
})

app.register(FastifyExpress)

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
    tracesSampleRate: process.env.ENVIRONMENT === 'development' ? 1.0 : 0.0125
  })
  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
}

app.register(import('./entry/server'))

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler())
}

export default async (req: FastifyRequest, res: FastifyReply) => {
  await app.ready()
  app.server.emit('request', req, res)
}
