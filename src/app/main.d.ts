declare module 'fastify' {
  interface FastifyInstance {
    mailer: {
      sendMail: Function
    }
  }
}

interface Params {
  id: string
}

interface Query {
  access_token: string
}

export { Params, Query }
