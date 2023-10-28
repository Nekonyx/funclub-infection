import { Citizen } from '../db'
import { createEventEmitter } from '../utils'

type CitizenEvents = {
  infected(citizen: Citizen, notify: boolean): void
  recovered(citizen: Citizen, notify: boolean): void
  died(citizen: Citizen, notify: boolean): void
}

export const citizenEvents = createEventEmitter<CitizenEvents>()
