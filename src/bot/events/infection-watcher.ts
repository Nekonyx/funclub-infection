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
    if (message.author.bot) {
      return
    }

    if (!COUGH_MESSAGE.includes(message.content.toLowerCase())) {
      return
    }

    const server = await this.serverService.getOne({
      guildId: message.guildId!
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    if (message.channelId === server.quarantineChannelId) {
      return
    }

    const attackerCitizen = await this.citizenService.getOne({
      serverId: server.id,
      userId: message.author.id
    })

    if (!attackerCitizen) {
      throw new Error('Attacker citizen not found')
    }

    const victim = await this.getVictimMember(message.channel as TextChannel)

    if (!victim || victim.user.bot) {
      return
    }

    // Цель в карантине
    if (victim.roles.cache.has(server.quarantineRoleId!)) {
      return
    }

    const victimCitizen = await this.citizenService.getOne({
      serverId: server.id,
      userId: victim.id
    })

    if (!victimCitizen) {
      throw new Error('Victim citizen not found')
    }

    if (attackerCitizen.status !== CitizenStatus.Infected) {
      return
    }

    if (
      victimCitizen.isImmune ||
      victimCitizen.status === CitizenStatus.Dead ||
      victimCitizen.status === CitizenStatus.Infected ||
      victimCitizen.status === CitizenStatus.Recovered
    ) {
      return
    }

    console.log('pull the devil trigger')
    await this.citizenService.markInfected(victimCitizen, true)
  }

  @On({
    event: 'messageCreate'
  })
  public async onBdsmMessage([message]: ArgsOf<'messageCreate'>) {
    if (message.author.bot) {
      return
    }

    if (!message.content.includes('bdsmtest.org')) {
      return
    }

    const server = await this.serverService.getOne({
      guildId: message.guildId!
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    const citizen = await this.citizenService.getOne({
      serverId: server.id,
      userId: message.author.id
    })

    if (!citizen) {
      throw new Error('Citizen not found')
    }

    if (citizen.status !== CitizenStatus.Healthy) {
      return
    }

    await this.citizenService.markInfected(citizen, true)
  }

  private async getVictimMember(
    channel: TextChannel
  ): Promise<GuildMember | null> {
    const messages = await channel.messages.fetch({
      limit: 2
    })

    const message = messages
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .first()

    if (!message) {
      return null
    }

    return message.member
  }
}
