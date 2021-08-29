const sharedSecret = (id: string) => {
  return `
            Click the link below to view the secret:\n
            <https://${process.env.SITE_URL}/${id}>\n\n

            Share you own secrets at <https://${process.env.SITE_URL}>\n\n

            --
            Report abuse ${process.env.SUPPORT_EMAIL}\n\n
          `
}

export default sharedSecret
