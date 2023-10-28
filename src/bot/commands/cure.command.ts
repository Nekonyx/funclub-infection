import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'

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
      description: 'Гражданин, которого нужно излечить'
    })
    target: GuildMember,
    interaction: CommandInteraction
  ) {
    //
  }

  @Slash({
    name: 'изолировать',
    description: 'Изолировать больного гражданина'
  })
  public async isolate(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: 'гражданин',
      description: 'Гражданин, которого нужно изолировать'
    })
    target: GuildMember,
    interaction: CommandInteraction
  ) {
    //
  }
}
