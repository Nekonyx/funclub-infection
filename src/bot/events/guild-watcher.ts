import { ArgsOf, Discord, On } from 'discordx'

import { ServerService } from '../../services/server.service'

/**
 * Следит за серверами
 */
@Discord()
export class GuildWatcher {
  private readonly serverService = new ServerService()

  /**
   * При создании сервера или захода на него
   */
  @On({
    event: 'guildCreate'
  })
  public async onGuildCreate([guild]: ArgsOf<'guildCreate'>) {
    await this.serverService.getOrCreateOne({
      guildId: guild.id,
      creationParams: {
        guildId: guild.id
      }
    })
  }
}
