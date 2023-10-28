import { stripIndent } from 'common-tags'
import { CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash } from 'discordx'
import { In } from 'typeorm'

import {
  CitizenStatus,
  Color,
  Country,
  CountryFlag,
  CountryName,
  MASK_ICON,
  VIRUS_NAME
} from '../../constants'
import { Citizen } from '../../db'
import { CitizenVaccinationService } from '../../services/citizen-vaccination.service'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'
import { toDiscordTime } from '../utils'

type TotalStats = {
  totalCitizen: number
  infectTotal: number
  infectPerDay: number
  deathTotal: number
  deathPerDay: number
  recoverTotal: number
  recoverPerDay: number
}

type CountryStats = {
  total: number
  infected: number
  deaths: number
  recovered: number
}

@Discord()
export class VirusCommand {
  private readonly serverService = new ServerService()
  private readonly citizenService = new CitizenService()
  private readonly citizenVacinationService = new CitizenVaccinationService()

  @Slash({
    name: 'о-вирусе',
    description: 'Возвращает информацию о вирусе'
  })
  public async aboutVirus(command: CommandInteraction) {
    const server = await this.serverService.getOne({
      guildId: command.guildId!
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    // prettier-ignore
    const embed = new EmbedBuilder()
      .setTitle('Статус эпидемии')
      .setColor(Color.Green)
      .setFields([{
        name: 'Текущее состояние',
        value: '🟢 Стабильное'
      }])
      .setDescription(stripIndent`
        **${VIRUS_NAME}** — оболочечный одноцепочный РНК-вирус. Создан в лаборатории Ханты-Мансийской биотехнологической компании "Jaba Biotics" в 2019 году и в качестве биологического оружия.

        Впервые выявлен в ноябре 2023 года и вызывает одноимённое опасное инфекционное заболевание.
      `)

    if (server.isEpidemic) {
      // prettier-ignore
      embed
        .setColor(Color.Red)
        .setFields([{
          name: 'Текущее состояние',
          value: '🔴 Эпидемия'
        }])
    }

    await command.reply({
      embeds: [embed]
    })
  }

  @Slash({
    name: 'статистика',
    description: `Показывает статистику распространения вируса ${VIRUS_NAME} по миру`
  })
  public async stats(interaction: CommandInteraction) {
    await interaction.deferReply()

    const server = await this.serverService.getOne({
      guildId: interaction.guildId!
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    const citizens = await this.citizenService.getList({
      serverId: server.id
    })

    const vaccinations = await this.citizenVacinationService.getList({
      conditions: {
        citizenId: In(citizens.map((c) => c.id))
      }
    })

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
        **Всего вакцин использовано:** ${vaccinations.length.toLocaleString('ru')}
        - **Заболевания ☣️**
          - Всего случаев заболевания: ${infectTotal.toLocaleString('ru')}
          - Новые заболевания за сутки: +${infectPerDay.toLocaleString('ru')}
        - **Смерти ☠️**
          - Всего смертей: ${deathTotal.toLocaleString('ru')}
          - Новые смерти за сутки: +${deathPerDay.toLocaleString('ru')}
        - **Выздоровления ❤️‍🩹**
          - Всего выздоровело: ${recoverTotal.toLocaleString('ru')}
          - Новые выздоровления за сутки: +${recoverPerDay.toLocaleString('ru')}

        **Статистика по странам:**
      `)

    const byCountry = new Map<Country, CountryStats>()

    for (const citizen of citizens) {
      const data = byCountry.get(citizen.country) ?? {
        total: 0,
        infected: 0,
        deaths: 0,
        recovered: 0
      }

      if (citizen.status === CitizenStatus.Infected) {
        data.infected++
      }

      if (citizen.status === CitizenStatus.Dead) {
        data.deaths++
      }

      if (citizen.status === CitizenStatus.Recovered) {
        data.recovered++
      }

      data.total++

      if (!byCountry.has(citizen.country)) {
        byCountry.set(citizen.country, data)
      }
    }

    for (const [country, stats] of byCountry) {
      embed.addFields({
        name: `${CountryFlag[country]} ${CountryName[country]}`,
        // prettier-ignore
        value: `Всего: ${stats.total.toLocaleString('ru')} | Заболевших: ${stats.infected.toLocaleString('ru')} | Смертей: ${stats.deaths.toLocaleString('ru')} | Выздоровело: ${stats.recovered.toLocaleString('ru')}`
      })
    }

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
      infectTotal: citizens.filter((c) => c.status === CitizenStatus.Infected)
        .length,
      infectPerDay: citizens.filter(
        (c) =>
          c.status === CitizenStatus.Infected &&
          formatDate(c.infectionDate!) === date
      ).length,
      // Смерти
      deathTotal: citizens.filter((c) => c.status === CitizenStatus.Dead)
        .length,
      deathPerDay: citizens.filter(
        (c) =>
          c.status === CitizenStatus.Dead && formatDate(c.deathDate!) === date
      ).length,
      // Выздоровления
      recoverTotal: citizens.filter((c) => c.status === CitizenStatus.Recovered)
        .length,
      recoverPerDay: citizens.filter(
        (c) =>
          c.status === CitizenStatus.Recovered &&
          formatDate(c.recoveryDate!) === date
      ).length
    }
  }
}

/**
 * Formats a given date into a string in the format "DD-MM-YYYY".
 * @param date The date to format.
 * @returns The formatted date string.
 */
function formatDate(date: Date): string {
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
}
