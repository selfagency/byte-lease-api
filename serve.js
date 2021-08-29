// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: {
    level: process.env.environment === 'production' ? 'info' : 'debug'
  }
})

// Declare a route
fastify.register(require('./api/app'))

// Run the server!
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
