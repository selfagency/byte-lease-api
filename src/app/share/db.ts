import Redis from 'ioredis'

const db = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  }
})

export default db
