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
    return
  }
}
