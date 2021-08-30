import { uid } from 'uid/secure'
import { Record } from '../../../../src/app/class'
import { del, get, set, ttl } from '../../../../src/app/services/db'

describe('services/db', () => {
  const key = uid(32)
  const value = new Record('test', undefined, undefined, uid(32), false)

  test('set', async () => {
    const response = await set(key, value, 120)
    expect(response).toEqual('OK')
  })

  test('get', async () => {
    expect(await get(key)).toEqual(value)
  })

  test('ttl', async () => {
    expect(await ttl(key)).toMatch(/\d+\w/)
  })

  test('del', async () => {
    await del(key)
    const result = await get(key)
    expect(result).toBe(null)
  })
})
