import {
  ApplicationCommandOptionType,
  ChannelType,
  CommandInteraction,
  PermissionsBitField,
  Role,
  TextChannel
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'

import { ServerService } from '../../services/server.service'

@Discord()
export class SetupCommand {
  private readonly serverService = new ServerService()

  @Slash({
    name: 'setup',
    description: 'Настроить бота и активировать его на сервере',
    defaultMemberPermissions: [PermissionsBitField.Flags.Administrator]
  })
  public async setup(
    @SlashOption({
      type: ApplicationCommandOptionType.Role,
      name: 'infected',
      description: 'Роль инфицированного',
      required: true
    })
    infectedRole: Role,
    @SlashOption({
      type: ApplicationCommandOptionType.Role,
      name: 'quarantined',
      description: 'Роль изолированного',
      required: true
    })
    quarantineRole: Role,
    @SlashOption({
      type: ApplicationCommandOptionType.Role,
      name: 'nurse',
      description: 'Роль врача',
      required: true
    })
    nurseRole: Role,
    @SlashOption({
      type: ApplicationCommandOptionType.Role,
      name: 'dead',
      description: 'Роль умершего',
      required: true
    })
    deadRole: Role,
    @SlashOption({
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
      name: 'quarantine',
      description: 'Канал карантина',
      required: true
    })
    quarantineChannel: TextChannel,
    interaction: CommandInteraction
  ) {
    const server = await this.serverService.getOne({
      guildId: interaction.guildId!
    })

    if (!server) {
      throw new Error('Server not found')
    }

    await this.serverService.update({
      id: server.id,
      data: {
        infectedRoleId: infectedRole.id,
        nurseRoleId: nurseRole.id,
        deadRoleId: deadRole.id,
        quarantineRoleId: quarantineRole.id,
        quarantineChannelId: quarantineChannel.id
      }
    })

    await interaction.reply({
      content: 'Настройка завершена'
    })
  }
}
