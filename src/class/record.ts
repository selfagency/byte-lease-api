class Record {
  secret: string
  target?: string
  passphrase?: string
  salt?: string
  selfDestruct: boolean

  constructor(
    secret: string,
    target: string | undefined,
    passphrase: string | undefined,
    salt: string,
    selfDestruct: boolean = true
  ) {
    this.secret = secret
    this.target = target
    this.passphrase = passphrase
    this.salt = salt
    this.selfDestruct = selfDestruct
  }
}

export default Record
