import db from '../share/db'
import logger from '../share/logger'

const del = async (key: string): Promise<string | Error> => {
  try {
    const res = await db.del(key)

    return res
  } catch (error) {
    logger.error(error)
    throw error
  }
}

export default del
