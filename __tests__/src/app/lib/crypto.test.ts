import { Credentials } from '../../../../src/app/class'
import { crypto } from '../../../../src/app/lib'
const { generatePassphrase, verifyPassphrase, encryptSecret, decryptSecret } = crypto

describe('lib/crypto', () => {
  const passphrase = 'keep-on-trucking-on'

  test('generatePassphrase', () => {
    const validate = result => result instanceof Credentials && result.passphrase.length > 0
    const result: any = generatePassphrase()
    expect(validate(result)).toBe(true)
  })

  test('verifyPassphrase', () => {
    const passphrase = generatePassphrase
    if (passphrase instanceof Credentials) {
      const result = verifyPassphrase(passphrase.passphrase, passphrase.hashed, passphrase.salt)
      expect(result).toBe(true)
    }
  })

  test('encryptSecret', () => {
    const result = encryptSecret('Hello, world.', passphrase)
    expect(typeof result === 'string' && result.length > 0).toBe(true)
  })

  test('decryptSecret', () => {
    const secret = encryptSecret('Hello, world.', passphrase)
    if (!(secret instanceof Error)) {
      const result = decryptSecret(secret, passphrase)
      expect(result).toBe('Hello, world.')
    }
  })
})
