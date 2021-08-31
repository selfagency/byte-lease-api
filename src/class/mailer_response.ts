class MailerResponse {
  status: string
  message: string
  response: string

  constructor(status: string, message: string, response: string) {
    this.status = status
    this.message = message
    this.response = response
  }
}

export default MailerResponse
