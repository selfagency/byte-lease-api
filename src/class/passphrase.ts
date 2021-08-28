import { common, password } from 'ecc-crypto-helper'
import niceware from 'niceware-eff'
import { decryptSecret, encryptSecret, generateSalt } from '../share/crypto'
import logger from '../share/logger'

class Passphrase {
  passphrase: string
  hashed: string
  salt: string

  constructor(passphrase: string, hashed: string, salt: string) {
    this.passphrase = passphrase
    this.hashed = hashed
    this.salt = salt
  }

  public static async generate(): Promise<Passphrase | Error> {
    try {
      let salt = (await generateSalt()) || (await common.random())
      const passphrase = (await niceware.generatePassphrase(8)).join('-')
      const hashed = password.hash(salt + passphrase).toString('hex')
      salt = await encryptSecret(salt, passphrase)
      return new Passphrase(passphrase, salt, hashed)
    } catch (error) {
      logger.error(<Error>error)
      throw error
    }
  }

  public static async verify(passphrase: string, salt: string, hashed: string): Promise<boolean | Error> {
    try {
      const decryptedSalt = await decryptSecret(salt, passphrase)
      const isMatch = await password.match(decryptedSalt + passphrase, hashed)
      return isMatch
    } catch (error) {
      logger.error(<Error>error)
      throw error
    }
  }
}

export default Passphrase
