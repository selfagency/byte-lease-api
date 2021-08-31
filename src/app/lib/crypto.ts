import { generate } from 'generate-passphrase'
import saltHash from 'password-salt-and-hash'
import StringCrypto from 'string-crypto'
import Credentials from '../class/credentials'
import { logger } from '../services'

const { encryptString, decryptString } = new StringCrypto()

const generatePassphrase = (): Credentials | Error => {
  try {
    const passphrase = generate({ numbers: false })
    const encrypted = saltHash.generateSaltHash(passphrase)
    const credentials = new Credentials(passphrase, encrypted.password, encrypted.salt)
    return credentials
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

const verifyPassphrase = (passphrase: string, hashed: string, salt: string): boolean | Error => {
  try {
    return saltHash.verifySaltHash(salt, hashed, passphrase)
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

const encryptSecret = (secret: string, passphrase: string): string | Error => {
  try {
    const encrypted = encryptString(secret, passphrase)
    return encrypted
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

const decryptSecret = (secret: string, passphrase: string): string | Error => {
  try {
    const decrypted = decryptString(secret, passphrase)
    return decrypted
  } catch (error) {
    logger.error(<Error>error)
    throw error
  }
}

const crypto = { generatePassphrase, verifyPassphrase, encryptSecret, decryptSecret }

export default crypto
