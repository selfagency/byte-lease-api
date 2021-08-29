import { Record } from '../../class'
import { logger } from '../../lib'
import db from './'

const set = async (id: string, record: Record, expire: number): Promise<string | Error> => {
  try {
    const { secret, target, passphrase, salt, selfDestruct } = record
    const res = (await db.set(
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
    )) as string
    return res
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

export default set
