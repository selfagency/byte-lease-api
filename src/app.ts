import * as Sentry from '@sentry/node'
import { VercelRequest, VercelResponse } from '@vercel/node'
import Fastify, { FastifyInstance } from 'fastify'
import FastifySentry from 'fastify-sentry'

const app: FastifyInstance = Fastify({
  logger: true
})

if (process.env.SENTRY_DSN) {
  app.register(FastifySentry, {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.ENVIRONMENT,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
    tracesSampleRate: process.env.ENVIRONMENT === 'development' ? 1.0 : 0.0125
  })
}

app.register(import('./entry/server'))

export default async (req: VercelRequest, res: VercelResponse) => {
  await app.ready()
  app.server.emit('request', req, res)
}
