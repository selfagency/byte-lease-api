import { db, logger } from '../lib'

const set = async (id, record, expire): Promise<string | Error> => {
  try {
    const { secret, target, passphrase, salt, selfDestruct } = record
    const res = await db.set(
      id,
      JSON.stringify({
        secret,
        target,
        passphrase,
        salt,
        selfDestruct
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
