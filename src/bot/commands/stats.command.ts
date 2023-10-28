import { stripIndent } from 'common-tags'
import { CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash } from 'discordx'

import { Color, MASK_ICON, VIRUS_NAME } from '../../constants'
import { Citizen } from '../../db'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'
import { toDiscordTime } from '../utils/discord-time'

type TotalStats = {
  totalCitizen: number
  infectTotal: number
  infectPerDay: number
  deathTotal: number
  deathPerDay: number
  recoverTotal: number
  recoverPerDay: number
}

/**
 * Formats a given date into a string in the format "DD-MM-YYYY".
 * @param date The date to format.
 * @returns The formatted date string.
 */
function formatDate(date: Date): string {
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
}

@Discord()
export class StatsCommand {
  private readonly serverService = new ServerService()
  private readonly citizenService = new CitizenService()

  @Slash({
    name: 'статистика-вируса',
    description: `Показывает статистику распространения вируса ${VIRUS_NAME} по миру`
  })
  public async stats(interaction: CommandInteraction) {
    await interaction.deferReply()

    const citizens = await this.citizenService.getList()
    const {
      totalCitizen,
      infectTotal,
      infectPerDay,
      deathTotal,
      deathPerDay,
      recoverTotal,
      recoverPerDay
    } = this.getTotalStats(citizens)

    // prettier-ignore
    const embed = new EmbedBuilder()
      .setTitle(`Случаи заболевания ${VIRUS_NAME} по миру:`)
      .setColor(Color.Yellow)
      .setFooter({
        text: `${MASK_ICON} Надевайте маски и будьте здоровы!`
      })
      .setDescription(stripIndent`
        **Обновлено:** ${toDiscordTime(new Date())}
        **Всего популяции:** ${totalCitizen.toLocaleString('ru')}
        - **Заболевания ☣️**
          - **Всего случаев заболевания:** ${infectTotal.toLocaleString('ru')}
          - **Новые заболевания за сутки:** +${infectPerDay.toLocaleString('ru')}
        - **Смерти ☠️**
          - **Всего смертей:** ${deathTotal.toLocaleString('ru')}
          - **Новые смерти за сутки:** +${deathPerDay.toLocaleString('ru')}
        - **Выздоровления ❤️‍🩹**
          - **Всего выздоровело:** ${recoverTotal.toLocaleString('ru')}
          - **Новые выздоровления за сутки:** +${recoverPerDay.toLocaleString('ru')}

        **Статистика по странам:**
      `)

    await interaction.followUp({
      embeds: [embed]
    })
  }

  private getTotalStats(citizens: Citizen[]): TotalStats {
    const date = formatDate(new Date())

    return {
      // Всего популяции
      totalCitizen: citizens.length,
      // Заболевания
      infectTotal: citizens.filter((c) => c.isInfected).length,
      infectPerDay: citizens.filter(
        (c) =>
          c.isInfected &&
          c.infectionDate &&
          formatDate(c.infectionDate) === date
      ).length,
      // Смерти
      deathTotal: citizens.filter((c) => c.isDead).length,
      deathPerDay: citizens.filter(
        (c) => c.isDead && c.deathDate && formatDate(c.deathDate) === date
      ).length,
      // Выздоровления
      recoverTotal: citizens.filter((c) => c.isRecovered).length,
      recoverPerDay: citizens.filter(
        (c) =>
          c.isRecovered && c.recoveryDate && formatDate(c.recoveryDate) === date
      ).length
    }
  }
}
