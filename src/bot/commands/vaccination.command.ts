import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'

import { CitizenStatus, Color, VACCINATION_TIME } from '../../constants'
import { CitizenVaccinationService } from '../../services/citizen-vaccination.service'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'
import { getVaccinationCertificate } from '../helpers'
import { toDiscordTime } from '../utils'

@Discord()
export class VaccinationCommand {
  private readonly serverService = new ServerService()
  private readonly citizenService = new CitizenService()
  private readonly citizenVaccinationService = new CitizenVaccinationService()

  @Slash({
    name: 'вакцинировать',
    description: 'Вакцинировать гражданина'
  })
  public async vaccinate(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: 'гражданин',
      description: 'Гражданин, которого нужно вакцинировать',
      required: true
    })
    target: GuildMember,
    interaction: CommandInteraction
  ) {
    const caller = await interaction.guild!.members.fetch(interaction.user.id)

    if (!caller) {
      return
    }

    const server = await this.serverService.getOne({
      guildId: interaction.guildId!
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    if (!caller.roles.cache.has(server.nurseRoleId!)) {
      return interaction.reply({
        content: 'Вы не имеете права вакцинировать граждан',
        ephemeral: true
      })
    }

    if (target.user.bot) {
      return interaction.reply({
        content: 'Вы не можете вакцинировать бота',
        ephemeral: true
      })
    }

    await interaction.deferReply()

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

    // Не в карантине
    if (!target.roles.cache.has(server.quarantineRoleId!)) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Вакцинация',
            color: Color.Yellow,
            description: 'По протоколу гражданин должен находиться в изоляции'
          })
        ]
      })
    }

    // Смотрим на время
    // Если между датой вакцинацией прошло меньше 1 дня
    for (const vaccination of citizen.vaccinations) {
      if (Date.now() - vaccination.createdAt.getTime() < VACCINATION_TIME) {
        const next = new Date(
          vaccination.createdAt.getTime() + VACCINATION_TIME
        )

        // prettier-ignore
        return interaction.followUp({
          embeds: [
            new EmbedBuilder({
              title: 'Вакцинация',
              color: Color.Yellow,
              description: `Гражданин уже получил вакцину сегодня. Приходите ${toDiscordTime(next, 'R')}`
            })
          ]
        })
      }
    }

    // В зависимости от количества вакцинаций
    switch (citizen.vaccinations.length) {
      // Вакцинации нет
      case 0: {
        await this.citizenVaccinationService.create({
          citizenId: citizen.id
        })

        return interaction.followUp({
          embeds: [
            new EmbedBuilder({
              title: 'Вакцинация',
              color: Color.Blue,
              description:
                'Гражданин получил первый компонент вакцины. Приходите за вторым компонентом завтра!'
            })
          ]
        })
      }

      // Есть первый компонент
      case 1: {
        await Promise.all([
          this.citizenVaccinationService.create({
            citizenId: citizen.id
          }),
          this.citizenService.updateImmuneStatus(citizen, true)
        ])

        return interaction.followUp({
          embeds: [
            new EmbedBuilder({
              title: 'Вакцинация',
              color: Color.Blue,
              description:
                'Гражданин получил второй компонент вакцины. Приходите за справкой завтра!'
            })
          ]
        })
      }

      // Есть второй или другие компоненты
      default: {
        return interaction.followUp({
          embeds: [
            new EmbedBuilder({
              title: 'Вакцинация',
              color: Color.Yellow,
              description: 'Гражданин уже получил все компоненты вакцины!'
            })
          ]
        })
      }
    }
  }

  @Slash({
    name: 'выдать-справку',
    description: 'Выдать справку о вакцинации'
  })
  public async giveCertificate(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: 'гражданин',
      description: 'Гражданин, которому нужно выдать справку',
      required: true
    })
    target: GuildMember,
    interaction: CommandInteraction
  ) {
    const caller = await interaction.guild?.members.fetch(interaction.user.id)

    if (!caller) {
      return
    }

    const server = await this.serverService.getOne({
      guildId: interaction.guildId!
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    if (!caller.roles.cache.has(server.nurseRoleId!)) {
      return interaction.reply({
        content: 'Вы не имеете права выдавать справки гражданам',
        ephemeral: true
      })
    }

    if (target.user.bot) {
      return interaction.reply({
        content: 'Вы не можете выдать справку боту',
        ephemeral: true
      })
    }

    await interaction.deferReply()

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

    if (citizen.vaccinations.length !== 2) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Вакцинация',
            color: Color.Yellow,
            description: 'Гражданин не получил все компоненты вакцины'
          })
        ]
      })
    }

    const image = await getVaccinationCertificate({
      id: citizen.id,
      isDead: citizen.status === CitizenStatus.Dead,
      username: target.displayName,
      avatarUrl: target.displayAvatarURL({
        extension: 'png',
        size: 4096
      })
    })

    const file = new AttachmentBuilder(image, {
      name: 'certificate.png'
    })

    await interaction.followUp({
      embeds: [
        new EmbedBuilder({
          title: 'Вакцинация',
          color: Color.Blue,
          description: 'Справка успешно выдана!'
        }).setImage('attachment://certificate.png')
      ],
      files: [file]
    })
  }
}
