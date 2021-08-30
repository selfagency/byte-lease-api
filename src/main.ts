#!/bin/env node
import { VercelRequest, VercelResponse } from '@vercel/node'
import Fastify, { FastifyInstance } from 'fastify'
import FastifySentry from 'fastify-sentry'
import app from './app'

const fastify: FastifyInstance = Fastify({
  logger: {
    level: process.env.environment === 'production' ? 'info' : 'debug'
  }
})

if (process.env.SENTRY_DSN) {
  fastify.register(FastifySentry, {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.ENVIRONMENT,
    tracesSampleRate: process.env.ENVIRONMENT === 'development' ? 1.0 : 0.0125
  })
}

fastify.register(app)

if (require.main === module) {
  fastify.listen(3000, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  })
}

export default async (req: VercelRequest, res: VercelResponse) => {
  await fastify.ready()
  fastify.server.emit('request', req, res)
}
