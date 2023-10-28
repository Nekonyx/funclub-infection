import cluster from 'cluster'
import { Snowyflake } from 'snowyflake'

const instance = new Snowyflake({
  epoch: 1694213370000n,
  processId: BigInt(process.pid % 28),
  workerId: BigInt(cluster?.worker?.id ?? 0)
})

/**
 * Generates a unique snowflake ID.
 * @returns A string representation of the generated snowflake ID.
 */
export function getSnowflake(): string {
  return instance.nextId().toString()
}

/**
 * Validates a given snowflake string.
 * @param snowflake - The snowflake string to validate.
 * @returns Whether the snowflake is valid or not.
 */
export function validateSnowflake(snowflake: string): boolean {
  return (
    !Number.isNaN(snowflake) && Boolean(instance.deconstruct(BigInt(snowflake)))
  )
}
