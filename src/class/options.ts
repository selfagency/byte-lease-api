class Options {
  id?: string
  secret?: string
  passphrase?: string | boolean
  target?: string
  selfDestruct?: boolean | string
  expire?: string | number

  constructor(
    id: string | undefined,
    secret: string | undefined,
    passphrase: string | boolean | undefined,
    target: string | undefined,
    selfDestruct: boolean | string | undefined,
    expire: string | number | undefined
  ) {
    this.id = id
    this.secret = secret
    this.passphrase = passphrase
    this.target = target
    this.selfDestruct = selfDestruct
    this.expire = expire
  }
}

export default Options
