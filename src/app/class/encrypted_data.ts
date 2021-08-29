interface EncryptedData {
  encrypted: {
    type: string
    data: Buffer
  }

  iv: {
    type: string
    data: Buffer
  }

  authTag: {
    type: string
    data: Buffer
  }
}

export default EncryptedData
