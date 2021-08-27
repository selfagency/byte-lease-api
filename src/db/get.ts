import db from '../share/db'
import logger from '../share/logger'

const get = async (key: string): Promise<string | Error> => {
  try {
    const res = await db.get(key)

    return res
  } catch (error) {
    logger.error(error)
    throw error
  }
}

export default get
