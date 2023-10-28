import { Country, CountryList } from '../constants'

/**
 * Returns a random number between the specified minimum and maximum values.
 * @param min - The minimum value of the range (inclusive).
 * @param max - The maximum value of the range (exclusive).
 * @returns A random number between the minimum and maximum values.
 */
export function getRandomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Returns a random integer between the specified minimum and maximum values (inclusive).
 * @param min The minimum value of the range (inclusive).
 * @param max The maximum value of the range (inclusive).
 * @returns A random integer between the specified minimum and maximum values (inclusive).
 */
export function getRandomInteger(min: number, max: number): number {
  return ~~getRandomNumber(min, max)
}

/**
 * Returns a random item from the given list.
 * @param list The list to select a random item from.
 * @returns A random item from the list.
 */
export function getRandomItem<T>(list: T[]): T {
  return list[getRandomInteger(0, list.length)]
}

/**
 * Returns a random country from the list of countries.
 *
 * @returns {Country} A random country.
 */
export function getRandomCountry(): Country {
  return getRandomItem(CountryList)
}
