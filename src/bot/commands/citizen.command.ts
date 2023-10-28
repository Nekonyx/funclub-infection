import { stripIndent } from 'common-tags'
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'

import {
  CitizenStatus,
  Color,
  CountryFlag,
  CountryName,
  DEATH_TIME,
  QUARANTIME_TIME
} from '../../constants'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'
import { toDiscordTime } from '../utils'

@Discord()
export class CitizenCommand {
  private readonly serverService = new ServerService()
  private readonly citizenService = new CitizenService()

  @Slash({
    name: 'состояние',
    description: 'Получить информацию о состоянии гражданина'
  })
  public async status(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: 'гражданин',
      description: 'Гражданин, о котором нужно получить информацию'
    })
    target: GuildMember,
    interaction: CommandInteraction
  ) {
    if (target?.user.bot) {
      return interaction.reply({
        content: 'Бот, увы, не гражданин',
        ephemeral: true
      })
    }

    await interaction.deferReply()

    const server = await this.serverService.getOne({
      guildId: interaction.guildId!
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    target = target || interaction.member

    const citizen = await this.citizenService.getOne({
      userId: target.id,
      serverId: server.id,
      opts: {
        relations: {
          vaccinations: true
        }
      }
    })

    if (!citizen) {
      throw new Error('Citizen not found')
    }

    const isQuarantined = target.roles.cache.has(server.quarantineRoleId!)

    const status: string[] = [formatCitizenStatus(citizen.status)]

    if (isQuarantined) {
      status.push('На карантине 🚧')
    }

    if (citizen.isImmune) {
      if (citizen.vaccinations.length >= 2) {
        status.push('Вакцинирован 💉')
      } else {
        status.push('Носит маску 😷')
      }
    }

    // prettier-ignore
    const embed = new EmbedBuilder()
      .setTitle(`Состояние гражданина ${target.displayName}`)
      .setThumbnail(target.user.displayAvatarURL())
      .setColor(Color.Blue)
      .setImage('https://nekodev.one/432x1.png')
      .setFields([{
        name: 'Возраст',
        value: citizen.age.toString(),
        inline: true
      }, {
        name: 'Страна',
        value: `${CountryFlag[citizen.country]} ${CountryName[citizen.country]}`,
        inline: true
      }, {
        name: 'Состояние',
        value: status.length > 1 ? `- ${status.join('\n- ')}` : status.join('')
      }])

    switch (citizen.status) {
      case CitizenStatus.Infected: {
        embed.addFields({
          name: 'Дата заражения ☣️',
          value: toDiscordTime(citizen.infectionDate!)
        })

        const deadTime = isQuarantined ? QUARANTIME_TIME : DEATH_TIME

        embed.addFields({
          name: 'Смерть без лечения наступит ⏳',
          value: toDiscordTime(
            new Date(citizen.infectionDate!.getTime() + deadTime),
            'R'
          )
        })
        break
      }

      case CitizenStatus.Recovered: {
        embed.addFields({
          name: 'Дата выздоровления 🏥',
          value: toDiscordTime(citizen.recoveryDate!)
        })
        break
      }

      case CitizenStatus.Dead: {
        embed.addFields({
          name: 'Дата смерти ⚰️',
          value: toDiscordTime(citizen.deathDate!)
        })

        break
      }
    }

    await interaction.followUp({
      embeds: [embed]
    })
  }
}

function formatCitizenStatus(status: CitizenStatus): string {
  switch (status) {
    case CitizenStatus.Healthy:
      return 'Здоров ❤️'

    case CitizenStatus.Infected:
      return 'Инфицирован ☣️'

    case CitizenStatus.Recovered:
      return 'Выздоровел 🏥'

    case CitizenStatus.Dead:
      return 'Мёртв 💀'

    default:
      return 'Неизвестно'
  }
}
