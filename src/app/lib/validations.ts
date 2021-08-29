import is from '@sindresorhus/is'
import { Options } from '../class'
import { tryParse } from './'

const validations = async (operation: string, options: any): Promise<Options> => {
  const id = is.string(options.id) && options.id.length ? options.id : false
  const secret = is.string(options.secret) && options.secret.length ? options.secret : false
  const passphrase = is.boolean(options.passphrase)
    ? Boolean(options.passphrase)
    : is.string(options.passphrase) && options.passphrase.length
    ? options.passphrase
    : false
  const target = is.string(options.target) && options.target.length ? options.target : false
  const selfDestruct = is.boolean(options.selfDestruct) ? Boolean(options.selfDestruct) : false
  const expire =
    (is.string(options.expire) && options.expire.length) || is.number(options.expire)
      ? tryParse(options.expire)
        ? parseInt(options.expire)
        : options.expire
      : false

  switch (operation) {
    case 'create':
      if (!secret) throw new Error('Secret is required')
      return new Options(undefined, secret, passphrase, target, selfDestruct, expire)
    case 'update':
      return new Options(undefined, undefined, undefined, undefined, undefined, undefined)
    case 'destroy':
      if (!id) throw new Error('Key is required')
      if (!passphrase)
        throw new Error('Passphrase is required (Secrets without passphrases cannot be manually deleted)')
      return new Options(id, undefined, passphrase, undefined, undefined, undefined)
    case 'read':
    default:
      if (!id) throw new Error('Key is required')
      return new Options(id, undefined, passphrase, undefined, undefined, undefined)
  }
}

export default validations
