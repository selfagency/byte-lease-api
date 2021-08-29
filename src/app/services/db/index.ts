import Redis from 'ioredis'
import del from './del'
import get from './get'
import set from './set'
import ttl from './ttl'

const db = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  }
})

export default db

export { del, get, set, ttl }
