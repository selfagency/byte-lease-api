class Record {
  secret: string
  target?: string
  passphrase?: string
  salt?: string
  autodestruct: boolean

  constructor(
    secret: string,
    target: string | undefined,
    passphrase: string | undefined,
    salt: string | undefined,
    autodestruct: boolean = true
  ) {
    this.secret = secret
    this.target = target
    this.passphrase = passphrase
    this.salt = salt
    this.autodestruct = autodestruct
  }
}

export default Record
