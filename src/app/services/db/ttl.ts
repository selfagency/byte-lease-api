import ms from 'ms'
import { logger } from '../../lib'
import db from './'

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
