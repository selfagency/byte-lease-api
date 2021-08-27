import { aesGcm256, common, password, sharedSecretGenerator } from 'ecc-crypto-helper'
import niceware from 'niceware-eff'
import logger from './logger'

const generateSalt = async (): Promise<string | Error> => {
  try {
    const salt = await sharedSecretGenerator.generateSharedSecret(8)

    return salt
  } catch (error) {
    logger.error(error)

    throw error
  }
}

const encryptSecret = async (secret: string, passphrase: string): Promise<string | Error> => {
  try {
    const encrypted = await aesGcm256.encrypt(secret, passphrase)

    return encrypted
  } catch (error) {
    logger.error(error)

    throw error
  }
}

const decryptSecret = async (secret: string, passphrase: string): Promise<string | Error> => {
  try {
    const decrypted = await aesGcm256.decrypt(secret, passphrase)

    return decrypted
  } catch (error) {
    logger.error(error)

    throw error
  }
}

class Passphrase {
  passphrase: string
  hashed: string
  salt: string

  constructor(passphrase: string, hashed: string, salt: string) {
    this.passphrase = passphrase
    this.hashed = hashed
    this.salt = salt
  }

  public static async generatePassphrase(): Promise<Passphrase | Error> {
    try {
      let salt = (await generateSalt()) || (await common.random())
      const passphrase = (await niceware.generatePassphrase(8)).join('-')
      const hashed = password.hash(salt + passphrase).toString('hex')
      salt = await encryptSecret(salt, passphrase)

      return new Passphrase(passphrase, salt, hashed)
    } catch (error) {
      logger.error(error)

      throw error
    }
  }

  public static async verifyPassphrase(passphrase: string, salt: string, hashed: string): Promise<boolean | Error> {
    try {
      const decryptedSalt = await decryptSecret(salt, passphrase)
      const isMatch = await password.match(decryptedSalt + passphrase, hashed)

      return isMatch
    } catch (error) {
      logger.error(error)

      throw error
    }
  }
}

export { Passphrase, generateSalt, encryptSecret, decryptSecret }
