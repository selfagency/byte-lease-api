import db from '../share/db'
import logger from '../share/logger'

const set = async (key, record, expire): Promise<string | Error> => {
  try {
    const { value, target, passphrase, autodestruct } = record

    const res = await db.set(
      key,
      JSON.stringify({
        value,
        target,
        passphrase,
        autodestruct
      }),
      'EX',
      expire
    )

    return res
  } catch (error) {
    logger.error(error)
    throw error
  }
}

export default set
