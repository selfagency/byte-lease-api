import { RequestGenericInterface } from 'fastify'
import Options from './options'

interface ApiRequest extends RequestGenericInterface {
  Body: Options
  id: string
  ips: string[]
}

export default ApiRequest
