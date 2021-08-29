import { db, logger } from '../lib'

const del = async (id: string): Promise<string | Error> => {
  try {
    const res = await db.del(id)
    return res
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

export default del
