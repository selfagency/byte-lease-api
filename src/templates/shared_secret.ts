const sharedSecret = (id: string) => {
  return `
            Click the link below to view the secret:\n
            <${process.env.SITE_URL}/${id}>\n\n

            Share you own secrets at <${process.env.SITE_URL}>\n\n

            --
            Report abuse <${process.env.SUPPORT_EMAIL}>  |  Privacy policy <${process.env.PRIVACY_POLICY}>\n\n
          `
}

export default sharedSecret
