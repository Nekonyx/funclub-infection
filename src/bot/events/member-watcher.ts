import { GuildMember, PartialGuildMember } from 'discord.js'
import { ArgsOf, Discord, On } from 'discordx'

import { CitizenStatus, MASK_ICON } from '../../constants'
import { Server } from '../../db'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'

/**
 * Следит за участниками сервера
 */
@Discord()
export class MemberWatcher {
  private readonly citizenService = new CitizenService()
  private readonly serverService = new ServerService()

  /**
   * При заходе на сервер,
   * внести участника в список граждан
   */
  @On({
    event: 'guildMemberAdd'
  })
  public async onGuildMemberAdd([member]: ArgsOf<'guildMemberAdd'>) {
    const server = await this.getServerOfMember(member)

    await this.citizenService.getOrCreateOne({
      userId: member.id,
      serverId: server.id,
      creationParams: {
        userId: member.id,
        serverId: server.id
      }
    })
  }

  /**
   * При выходе с сервера,
   * пометить гражданина как мёртвого
   */
  @On({
    event: 'guildMemberRemove'
  })
  public async onGuildMemberRemove([member]: ArgsOf<'guildMemberRemove'>) {
    const server = await this.getServerOfMember(member)

    const citizen = await this.citizenService.getOne({
      userId: member.id,
      serverId: server.id
    })

    if (!citizen) {
      throw new Error('Citizen not found')
    }

    await this.citizenService.updateStatus(citizen, CitizenStatus.Dead)
  }

  /**
   * При обновлении данных участника, проверить наличие маски.
   */
  @On({
    event: 'guildMemberUpdate'
  })
  public async onGuildMemberUpdate([prev, next]: ArgsOf<'guildMemberUpdate'>) {
    const isMaskChanged =
      prev.displayName.includes(MASK_ICON) !==
      next.displayName.includes(MASK_ICON)

    if (!isMaskChanged) {
      return
    }

    const server = await this.getServerOfMember(next)
    const citizen = await this.citizenService.getOne({
      userId: next.id,
      serverId: server.id
    })

    if (!citizen) {
      throw new Error('Citizen not found')
    }

    await this.citizenService.updateImmuneStatus(
      citizen,
      next.displayName.includes(MASK_ICON)
    )
  }

  private async getServerOfMember(
    member: GuildMember | PartialGuildMember
  ): Promise<Server> {
    const server = await this.serverService.getOne({
      guildId: member.guild.id
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    return server
  }
}
