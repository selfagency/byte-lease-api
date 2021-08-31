import Redis from 'ioredis'
import del from './del'
import get from './get'
import set from './set'
import ttl from './ttl'

const url = process.env.REDIS_URL || 'redis://127.0.0.1'
const tls = process.env.REDIS_TLS || false

const db = new Redis(
  url,
  tls
    ? {
        tls: {
          rejectUnauthorized: false
        }
      }
    : undefined
)

process.on('SIGTERM', () => {
  db.disconnect()
})

export default db

export { del, get, set, ttl }
