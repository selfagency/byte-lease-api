class MailerResponse {
  status: string
  message: string
  info: any
  errors: any

  constructor(status: string, message: string, info: any, errors: any) {
    this.status = status
    this.message = message
    this.info = info
    this.errors = errors
  }
}

export default MailerResponse
