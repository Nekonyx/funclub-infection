import { stripIndent } from 'common-tags'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  PermissionsBitField
} from 'discord.js'
import { ButtonComponent, Discord, Slash } from 'discordx'

import { CitizenStatus, Color, VIRUS_NAME } from '../../constants'
import { Citizen } from '../../db'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'

const startButtonId = 'start-epidemic'

@Discord()
export class EpidemyCommand {
  private readonly serverService = new ServerService()
  private readonly citizenService = new CitizenService()

  @Slash({
    name: 'эпидемия',
    description: 'Большинство граждан мгновенно заразятся вирусом',
    defaultMemberPermissions: [PermissionsBitField.Flags.Administrator]
  })
  public async startEpidemy(command: CommandInteraction) {
    const server = await this.serverService.getOne({
      guildId: command.guildId!
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    if (server.isEpidemic) {
      return command.reply({
        ephemeral: true,
        content: 'Эпидемия уже началась!'
      })
    }

    await command.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Это действие необратимо!')
          .setColor(Color.Red)
          .setDescription(
            'Вы уверены что хотите начать эпидемию? Большинство граждан мгновенно заразятся вирусом!'
          )
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder()
            .setCustomId(startButtonId)
            .setStyle(ButtonStyle.Danger)
            .setLabel('Да, начать эпидемию')
            .setEmoji('💀')
        ])
      ]
    })
  }

  @ButtonComponent({
    id: startButtonId
  })
  public async onStartEpidemy(interaction: ButtonInteraction) {
    const member = await interaction.guild?.members.fetch(interaction.user.id)

    // prettier-ignore
    if (!member || !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return
    }

    await interaction.deferReply()

    const server = await this.serverService.getOne({
      guildId: interaction.guildId!
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    if (server.isEpidemic) {
      return interaction.followUp({
        content: 'Эпидемия уже началась!'
      })
    }

    await this.serverService.update({
      id: server.id,
      data: {
        isEpidemic: true
      }
    })

    const citizens = await this.citizenService.getList({
      serverId: server.id
    })

    // Перемешиваем граждан и берём 1%
    const shuffledCitizens: Citizen[] = citizens.sort(() => Math.random() - 0.5)
    const citizensToInfect: Citizen[] = shuffledCitizens.slice(
      0,
      Math.floor(citizens.length * 0.01)
    )

    // Такое бывает только во время теста, когда на сервере людей меньше 100
    // поэтому докидываем случайного одного
    if (citizensToInfect.length === 0) {
      citizensToInfect.push(shuffledCitizens[0])
    }

    await Promise.all(
      citizensToInfect.map((citizen) => {
        if (citizen.status === CitizenStatus.Healthy) {
          return this.citizenService.markInfected(citizen, false)
        }
      })
    )

    // prettier-ignore
    await interaction.followUp({
      embeds: [
        new EmbedBuilder({
          title: 'Конец близок',
          color: Color.Red,
          description: stripIndent`
            Нулевой пациент скончался, и с его смертью биологическое оружие **${VIRUS_NAME}** начало распространяться по всему миру.
            Первые **${citizensToInfect.length.toLocaleString('ru')}** граждан уже заразились вирусом.
          `
        })
      ]
    })
  }
}
