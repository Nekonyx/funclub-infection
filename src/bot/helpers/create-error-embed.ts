import { EmbedBuilder } from 'discord.js'

import { Color } from '../../constants'

/**
 * Создаёт эмбед с описанием ошибки
 *
 * @param incidentId ID инцидента
 * @param description Описание ошибки
 * @param error Ошибка
 * @returns Эмбед с описанием ошибки
 */
export function createErrorEmbed(
  incidentId: string,
  description?: string,
  error?: Error
): EmbedBuilder {
  description ??= 'Увы, возникла непредвиденная ошибка'
  const embed = new EmbedBuilder()
    .setTitle('Возникла ошибка')
    .setColor(Color.Yellow)
    .setDescription(`${description}:\`\`\`\n${error?.message}\n\`\`\``)
    .addFields({
      name: 'ID инцидента',
      value: `Можете сообщить его поддержке: \`\`\`\n${incidentId}\`\`\``
    })

  return embed
}
