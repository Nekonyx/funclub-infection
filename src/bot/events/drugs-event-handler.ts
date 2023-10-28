import { EmbedBuilder } from 'discord.js'
import { Discord } from 'discordx'

import { Color, VIRUS_NAME } from '../../constants'
import { Server } from '../../db'
import { drugsEvents } from '../../events/drugs'
import { ServerService } from '../../services/server.service'
import { bot } from '../bot'

@Discord()
export class DrugsEventHandlers {
  private readonly serverService = new ServerService()

  public constructor() {
    this.onRefill = this.onRefill.bind(this)

    drugsEvents.on('refill', this.onRefill)
  }

  private async onRefill(server: Server) {
    const guild = await bot.guilds.fetch(server.guildId)
    const channel = await guild.channels.fetch(server.quarantineChannelId!)

    if (!channel?.isTextBased()) {
      throw new Error('Channel not found or not text based')
    }

    await channel.send({
      content: `<@&${server.nurseRoleId}>`,
      embeds: [
        new EmbedBuilder({
          title: 'Пополнение инвентаря',
          color: Color.Blue,
          description: `Поступил препарат от ${VIRUS_NAME}. В инвентаре теперь их ${server.drugsCount} шт.`
        })
      ]
    })
  }
}
