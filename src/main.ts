import Sentry from '@sentry/node'
import { VercelRequest, VercelResponse } from '@vercel/node'
import Fastify, { FastifyInstance } from 'fastify'
import FastifySentry from 'fastify-sentry'
import app from './app'

const fastify: FastifyInstance = Fastify({
  logger: true
})

if (process.env.SENTRY_DSN) {
  fastify.register(FastifySentry, {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.ENVIRONMENT,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
    tracesSampleRate: process.env.ENVIRONMENT === 'development' ? 1.0 : 0.0125
  })
}

fastify.register(app)

export default async (req: VercelRequest, res: VercelResponse) => {
  await fastify.ready()
  fastify.server.emit('request', req, res)
}
