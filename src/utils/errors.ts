import { randomUUID } from 'crypto'

/**
 * Captures an error and logs it to the console with a unique incident ID.
 * @param error - The error to capture.
 * @param data - Optional additional data to include with the error.
 * @returns The unique incident ID associated with the captured error.
 */
export function captureError(error: unknown, data?: object): string {
  const incidentId = randomUUID()

  console.error('error captured', {
    incidentId,
    error,
    data
  })

  return incidentId
}
