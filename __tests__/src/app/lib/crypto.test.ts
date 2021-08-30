import { Credentials } from '../../../../src/app/class'
import { crypto } from '../../../../src/app/lib'
const { generatePassphrase } = crypto

describe('generatePassphrase', () => {
  const validate = result => result instanceof Credentials

  test('Generate passphrase', async () => {
    let result: any = await generatePassphrase()
    expect(validate(result)).toBeTruthy()
  })
})
