class ReadResponse {
  secret: string
  selfDestruct: boolean
  expires: string

  constructor(secret: string, selfDestruct: boolean, expires: string) {
    this.secret = secret
    this.selfDestruct = selfDestruct
    this.expires = expires
  }
}

export default ReadResponse
