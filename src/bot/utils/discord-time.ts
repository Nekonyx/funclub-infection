/**
 * Преобразует дату и время в строку, которую можно использовать в сообщении Discord
 *
 * @example
 * toDiscordTime(date, 'd') // -> '04.03.2022'
 * toDiscordTime(date, 'D') // -> '4 марта 2022 г.'
 * toDiscordTime(date, 't') // -> '7:26'
 * toDiscordTime(date, 'T') // -> '7:26:00'
 * toDiscordTime(date) // -> '4 марта 2022 г., 7:26'
 * toDiscordTime(date, 'f') // -> '4 марта 2022 г., 7:26'
 * toDiscordTime(date, 'F') // -> 'пятница, 4 марта 2022 г., 7:26'
 * toDiscordTime(date, 'R') // -> '5 минут назад'
 *
 */
export function toDiscordTime(
  date: Date,
  format?: 'd' | 'D' | 't' | 'T' | 'f' | 'F' | 'R'
) {
  let result = '<t:'

  result += (date.getTime() / 1000).toFixed(0)
  result += format ? `:${format}` : ''
  result += '>'

  return result
}
