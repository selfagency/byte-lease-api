import { aesGcm256, sharedSecretGenerator } from 'ecc-crypto-helper'
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

export { generateSalt, encryptSecret, decryptSecret }
