class Credentials {
  passphrase: string
  hashed: string
  salt: string

  constructor(passphrase: string, hashed: string, salt: string) {
    this.passphrase = passphrase
    this.hashed = hashed
    this.salt = salt
  }
}

export default Credentials
