import * as Sentry from '@sentry/node'
import { VercelRequest, VercelResponse } from '@vercel/node'
import Fastify, { FastifyInstance } from 'fastify'
import FastifySentry from 'fastify-sentry'
import app from './app'

const server: FastifyInstance = Fastify({
  logger: true
})

if (process.env.SENTRY_DSN) {
  server.register(FastifySentry, {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.ENVIRONMENT,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
    tracesSampleRate: process.env.ENVIRONMENT === 'development' ? 1.0 : 0.0125
  })
}

server.register(app)

export default async (req: VercelRequest, res: VercelResponse) => {
  await server.ready()
  server.server.emit('request', req, res)
}
