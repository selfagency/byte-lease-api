import pino from 'pino'

const logger = pino({
  level: process.env.ENVIRONMENT === 'production' ? 'info' : 'debug',
  prettyPrint: process.env.ENVIRONMENT !== 'production'
})

export default logger
