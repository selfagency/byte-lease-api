import ms from 'ms'
import { logger } from '../../services'
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
