class ReadResponse {
  secret: string
  autodestruct: boolean
  expires: string

  constructor(secret: string, autodestruct: boolean, expires: string) {
    this.secret = secret
    this.autodestruct = autodestruct
    this.expires = expires
  }
}

export default ReadResponse
