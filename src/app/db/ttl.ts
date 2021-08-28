import ms from 'ms'
import db from '../share/db'
import logger from '../share/logger'

const ttl = async (id: string): Promise<string | Error> => {
  try {
    const res = await db.ttl(id)
    return ms(res * 1000)
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

export default ttl
