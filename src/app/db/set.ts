import db from '../share/db'
import logger from '../share/logger'

const set = async (id, record, expire): Promise<string | Error> => {
  try {
    const { secret, target, passphrase, autodestruct } = record
    const res = await db.set(
      id,
      JSON.stringify({
        secret,
        target,
        passphrase,
        autodestruct
      }),
      'EX',
      expire
    )
    return res
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

export default set
