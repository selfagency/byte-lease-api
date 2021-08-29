import { logger } from '../../lib'
import db from './'

const get = async (id: string): Promise<string | Error> => {
  try {
    const res = (await db.get(id)) as string
    return JSON.parse(res)
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

export default get
