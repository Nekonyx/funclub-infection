import EventEmitter from 'events'
import TypedEmitter, { EventMap } from 'typed-emitter'

/**
 * Creates a new event emitter instance with the specified event map type.
 * @returns A new TypedEmitter instance with the specified event map type.
 */
export function createEventEmitter<T extends EventMap>(): TypedEmitter<T> {
  return new EventEmitter({ captureRejections: true }) as TypedEmitter<T>
}
