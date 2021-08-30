import { isEmail } from '../../../../src/app/lib'

describe('lib/is_email', () => {
  test('valid email address', () => {
    const result = isEmail('name@address.tdl')
    expect(result).toBe(true)
  })

  test('invalid email address', () => {
    const result = isEmail('name+address.tdl')
    expect(result).toBe(false)
  })

  test('ip address', () => {
    const result = isEmail('1.1.1.1')
    expect(result).toBe(false)
  })
})
