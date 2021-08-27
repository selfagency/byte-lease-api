class Options {
  key?: string
  passphrase?: string | boolean
  target?: string
  autodestruct?: boolean
  expire?: string

  constructor(
    key: string | undefined,
    passphrase: string | boolean | undefined,
    target: string | undefined,
    autodestruct: boolean | undefined,
    expire: string | undefined
  ) {
    this.key = key
    this.passphrase = passphrase
    this.target = target
    this.autodestruct = autodestruct
    this.expire = expire
  }
}

export default Options
