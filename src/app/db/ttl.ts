import db from '../share/db'
import logger from '../share/logger'

const ttl = async (id: string): Promise<string | Error> => {
  try {
    const res = await db.ttl(id)
    return res
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

export default ttl
