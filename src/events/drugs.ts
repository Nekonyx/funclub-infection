import { Server } from '../db'
import { createEventEmitter } from '../utils'

type DrugsEvents = {
  refill(server: Server): void
}

export const drugsEvents = createEventEmitter<DrugsEvents>()
