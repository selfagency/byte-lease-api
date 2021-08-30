import { expiry } from '../../../../src/app/lib'

describe('lib/expiry', () => {
  test('ttl string', () => {
    const expires = expiry('6h')
    expect(expires).toBe(6 * 60 * 60)
  })

  test('ttl number', () => {
    const expires = expiry(6 * 60 * 60)
    expect(expires).toBe(21600)
  })

  test('ttl undefined', () => {
    const expires = expiry(undefined)
    expect(expires).toBe(86400)
  })

  test('ttl > 48h', () => {
    const expires = expiry('1w')
    expect(expires).toBe(172800)
  })
})
