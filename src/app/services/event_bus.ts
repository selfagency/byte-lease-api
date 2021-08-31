import mitt, { Emitter } from 'mitt'
// import { logger } from './'

type Events = {
  closeMailer: undefined
}

const eventBus: Emitter<Events> = mitt<Events>()

export default eventBus
