import { GuildMember, TextChannel } from 'discord.js'
import { ArgsOf, Discord, On } from 'discordx'

import { CitizenStatus, COUGH_MESSAGE } from '../../constants'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'

@Discord()
export class InfectionWatcher {
  private readonly serverService = new ServerService()
  private readonly citizenService = new CitizenService()

  @On({
    event: 'messageCreate'
  })
  public async onCoughMessage([message]: ArgsOf<'messageCreate'>) {
    return
  }

  @On({
    event: 'messageCreate'
  })
  public async onBdsmMessage([message]: ArgsOf<'messageCreate'>) {
    return
  }
}
