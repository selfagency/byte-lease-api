class Options {
  id?: string
  secret?: string
  passphrase?: string | boolean
  target?: string
  autodestruct?: boolean
  expire?: string

  constructor(
    id: string | undefined,
    secret: string | undefined,
    passphrase: string | boolean | undefined,
    target: string | undefined,
    autodestruct: boolean | undefined,
    expire: string | undefined
  ) {
    this.id = id
    this.secret = secret
    this.passphrase = passphrase
    this.target = target
    this.autodestruct = autodestruct
    this.expire = expire
  }
}

export default Options
