import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'

import { CitizenStatus, Color, CountryFlag, CountryName } from '../../constants'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'

@Discord()
export class CitizenCommand {
  private readonly serverService = new ServerService()
  private readonly citizenService = new CitizenService()

  @Slash({
    name: 'состояние',
    description: 'Получить информацию о состоянии гражданина'
  })
  public async me(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: 'гражданин',
      description: 'Гражданин, о котором нужно получить информацию'
    })
    target: GuildMember,
    interaction: CommandInteraction
  ) {
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
      serverId: server.id
    })

    if (!citizen) {
      throw new Error('Citizen not found')
    }

    const isQuarantined = target.roles.cache.has(
      process.env.QUARANTINED_ROLE_ID!
    )

    // prettier-ignore
    const embed = new EmbedBuilder()
      .setTitle(`Состояние гражданина ${target.displayName}`)
      .setThumbnail(target.user.displayAvatarURL())
      .setColor(Color.Blue)
      .setFields([{
        name: 'Возраст 🧓',
        value: citizen.age.toString(),
        inline: true
      }, {
        name: 'Страна 🌍',
        value: `${CountryFlag[citizen.country]} ${CountryName[citizen.country]}`,
        inline: true
      }, {
        name: 'Статус 📝',
        value: citizen.status,
        inline: true
      }])

    await interaction.followUp({
      embeds: [embed]
    })
  }
}
