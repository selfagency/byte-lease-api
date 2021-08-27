class Record {
  value: string
  target?: string
  passphrase?: string
  salt?: string
  autodestruct: boolean

  constructor(
    value: string,
    target: string | undefined,
    passphrase: string | undefined,
    salt: string | undefined,
    autodestruct: boolean = true
  ) {
    this.value = value
    this.target = target
    this.passphrase = passphrase
    this.salt = salt
    this.autodestruct = autodestruct
  }
}

export default Record
