import { stripIndent } from 'common-tags'
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'

import { CitizenStatus, Color } from '../../constants'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'

@Discord()
export class CureCommand {
  private readonly citizenService = new CitizenService()
  private readonly serverService = new ServerService()

  @Slash({
    name: 'излечить',
    description: 'Попробовать излечить от болезни гражданина'
  })
  public async cure(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: 'гражданин',
      description: 'Гражданин, которого нужно излечить',
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
        content: 'Вы не имеете права лечить граждан',
        ephemeral: true
      })
    }

    if (target.user.bot) {
      return interaction.reply({
        content: 'Вы не можете вылечить бота',
        ephemeral: true
      })
    }

    if (server.drugsCount < 1) {
      return interaction.reply({
        content: 'У вас закончились лекарства',
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

    if (citizen.status === CitizenStatus.Dead) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Излечение',
            color: Color.Yellow,
            description: `Гражданин ${target} покоится с миром 🪦`
          })
        ]
      })
    }

    if (citizen.status === CitizenStatus.Recovered) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Излечение',
            color: Color.Yellow,
            description: `Гражданин ${target} уже излечен`
          })
        ]
      })
    }

    if (citizen.status !== CitizenStatus.Infected) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Излечение',
            color: Color.Yellow,
            description: `Гражданин ${target} не нуждается в лечении`
          })
        ]
      })
    }

    await this.serverService.update({
      id: server.id,
      data: {
        drugsCount: server.drugsCount - 1
      }
    })

    await this.citizenService.markRecovered(citizen, false)

    await interaction.followUp({
      content: target.toString(),
      embeds: [
        new EmbedBuilder({
          title: 'Излечение',
          color: Color.Blue,
          description: stripIndent`
            Гражданин ${target} был излечен сотрудником ${interaction.user}.
            Теперь он не опасен для общества и может наслаждаться своей жизнью.
          `
        })
      ]
    })
  }

  @Slash({
    name: 'изолировать',
    description: 'Изолировать больного гражданина'
  })
  public async isolate(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: 'гражданин',
      description: 'Гражданин, которого нужно изолировать',
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
        content: 'Вы не имеете права изолировать граждан',
        ephemeral: true
      })
    }

    if (target.user.bot) {
      return interaction.reply({
        content: 'Вы не можете изолировать бота',
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

    // Уже изолирован
    if (target.roles.cache.has(server.quarantineRoleId!)) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Карантин',
            color: Color.Yellow,
            description: 'Гражданин уже находится в изоляции от общества'
          })
        ]
      })
    }

    // Умер или есть иммунитет
    if (
      citizen.vaccinations.length >= 2 ||
      citizen.status === CitizenStatus.Dead ||
      citizen.status === CitizenStatus.Recovered
    ) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Карантин',
            color: Color.Yellow,
            description:
              citizen.status === CitizenStatus.Dead
                ? 'Этому гражданину уже ничем не поможешь 🪦'
                : 'Гражданин имеет иммунитет к вирусу, изоляция не требуется'
          })
        ]
      })
    }

    // Переводим в карантин
    await target.roles.add(server.quarantineRoleId!)

    const quarantine = await interaction.guild!.channels.fetch(
      server.quarantineChannelId!
    )

    if (!quarantine?.isTextBased()) {
      return
    }

    await interaction.followUp({
      content: target.toString(),
      embeds: [
        new EmbedBuilder({
          title: 'Карантин',
          color: Color.Yellow,
          description: `Вы были изолированы от общества сотрудником ${interaction.user}. Наслаждайтесь своим пребыванием в карантине.`
        })
      ]
    })
  }

  @Slash({
    name: 'выпустить',
    description: 'Выпустить гражданина из изоляции'
  })
  public async release(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: 'гражданин',
      description: 'Гражданин, которого нужно изолировать',
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
        content: 'Вы не имеете права изолировать граждан',
        ephemeral: true
      })
    }

    if (target.user.bot) {
      return interaction.reply({
        content: 'Вы не можете изолировать бота',
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

    // Уже изолирован
    if (!target.roles.cache.has(server.quarantineRoleId!)) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Карантин',
            color: Color.Yellow,
            description:
              'Гражданин не изолирован от общества, выпускать не нужно'
          })
        ]
      })
    }

    // Баг? Выпускаем из карантина
    // Выходим из карантина
    if (
      citizen.status === CitizenStatus.Dead ||
      citizen.status === CitizenStatus.Recovered
    ) {
      return target.roles.remove(server.quarantineRoleId!)
    }

    // Инфицирован
    if (citizen.status === CitizenStatus.Infected) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Карантин',
            color: Color.Yellow,
            description:
              'Гражданин всё ещё является носителем вируса, выпускать запрещено.'
          })
        ]
      })
    }

    // Не до конца вакцинирован
    if (citizen.vaccinations.length > 0 && citizen.vaccinations.length < 2) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder({
            title: 'Карантин',
            color: Color.Yellow,
            description:
              'Гражданин всё ещё не получил второй компонент вакцины, выпускать запрещено.'
          })
        ]
      })
    }

    // Выходим из карантина
    await target.roles.remove(server.quarantineRoleId!)

    return interaction.followUp({
      content: target.toString(),
      embeds: [
        new EmbedBuilder({
          title: 'Карантин',
          color: Color.Yellow,
          description: `Вы были выпущены из карантина сотрудником ${interaction.user}. Наслаждайтесь своей свободой соблюдая меры предосторожности.`
        })
      ]
    })
  }
}
