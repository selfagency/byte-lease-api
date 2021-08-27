interface Record {
  value: string
  target: string
  passphrase: string
  salt: string
  autodestruct: boolean
}

interface Options {
  key?: string
  passphrase?: string | boolean
  target?: string
  autodestruct?: boolean
  expire?: string
}

export { Passphrase, Record, Options }
