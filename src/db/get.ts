import db from '../share/db'
import logger from '../share/logger'

const get = async (id: string): Promise<string | Error> => {
  try {
    const res = await db.get(id)
    return res
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

export default get
