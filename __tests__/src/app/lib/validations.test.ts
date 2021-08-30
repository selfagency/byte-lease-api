import { validations } from '../../../../src/app/lib'

describe('lib/validations', () => {
  test('create (good)', () => {
    const result = validations('create', {
      secret: 'secret',
      target: 'email@address.tld',
      selfDestruct: true,
      expire: '3d'
    })

    expect(result).toEqual({
      expire: 172800,
      id: undefined,
      passphrase: false,
      secret: 'secret',
      selfDestruct: true,
      target: 'email@address.tld'
    })
  })

  test('create (bad)', () => {
    expect(() => validations('create', {})).toThrow(new Error('Secret is required'))
  })

  test('update (good)', () => {
    const result = validations('update', {})
    expect(result).toEqual({})
  })

  test('update (bad)', () => {
    const result = validations('update', {})
    expect(result).toEqual({})
  })

  test('destroy (good)', () => {
    const result = validations('destroy', { id: 'a1b2c3d4e5', passphrase: 'fire-on-the-mountain' })
    expect(result).toEqual({ id: 'a1b2c3d4e5', passphrase: 'fire-on-the-mountain' })
  })

  test('destroy (bad 1)', () => {
    expect(() => validations('destroy', { id: 'a1b2c3d4e5' })).toThrow(
      new Error('Passphrase is required (Secrets without passphrases cannot be manually deleted)')
    )
  })

  test('destroy (bad 2)', () => {
    expect(() => validations('destroy', {})).toThrow(new Error('Key is required'))
  })

  test('read (good)', () => {
    const result = validations('read', { id: 'a1b2c3d4e5', passphrase: 'fire-on-the-mountain' })
    expect(result).toEqual({ id: 'a1b2c3d4e5', passphrase: 'fire-on-the-mountain' })
  })

  test('read (bad)', () => {
    expect(() => validations('read', { passphrase: 'fire-on-the-mountain' })).toThrow(new Error('Key is required'))
  })
})
