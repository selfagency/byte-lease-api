import { logger } from '../../services'
import db from './'

const del = async (id: string): Promise<boolean | Error> => {
  try {
    const res = (await db.del(id)) === 1
    return res
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

export default del
