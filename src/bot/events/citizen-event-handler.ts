import { stripIndent } from 'common-tags'
import { EmbedBuilder, Guild } from 'discord.js'
import { Discord } from 'discordx'

import { Color } from '../../constants'
import { Citizen, Server } from '../../db'
import { citizenEvents } from '../../events/citizen'
import { CitizenService } from '../../services/citizen.service'
import { ServerService } from '../../services/server.service'
import { bot } from '../bot'

@Discord()
export class CitizenEventsHandler {
  private readonly serverService = new ServerService()
  private readonly citizenService = new CitizenService()

  public constructor() {
    this.onInfected = this.onInfected.bind(this)
    this.onRecovered = this.onRecovered.bind(this)
    this.onDied = this.onDied.bind(this)

    citizenEvents.on('infected', this.onInfected)
    citizenEvents.on('recovered', this.onRecovered)
    citizenEvents.on('died', this.onDied)
  }

  /** Выдать плашку при инфицировании и уведомить */
  private async onInfected(citizen: Citizen, notify: boolean) {
    const server = await this.serverService.getOne({
      id: citizen.serverId
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    const guild = await bot.guilds.fetch(server.guildId)

    const member = await guild.members.fetch(citizen.userId)

    await Promise.all([
      member.roles.remove(server.deadRoleId!),
      member.roles.add(server.infectedRoleId!)
    ])

    if (notify) {
      await this.sendNotification(
        server,
        guild,
        citizen,
        new EmbedBuilder({
          title: 'Вы заражены',
          color: Color.Red,
          description: `Скорее попросите <@&${server.nurseRoleId}> изолировать вас в карантине или излечить, иначе вы умрёте!`
        })
      )
    }
  }

  /** Выдать плашку при излечении и уведомить */
  private async onRecovered(citizen: Citizen, notify: boolean) {
    const server = await this.serverService.getOne({
      id: citizen.serverId
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    const guild = await bot.guilds.fetch(server.guildId)

    const member = await guild.members.fetch(citizen.userId)

    await member.roles.remove([server.deadRoleId!, server.infectedRoleId!])

    if (notify) {
      await this.sendNotification(
        server,
        guild,
        citizen,
        new EmbedBuilder({
          title: 'Вы излечены',
          color: Color.Blue,
          description:
            'Теперь вы можете спокойно жить в обществе, но не забывайте соблюдать меры предосторожности!'
        })
      )
    }
  }

  /** Выдать плашку при смерти и уведомить */
  private async onDied(citizen: Citizen, notify: boolean) {
    const server = await this.serverService.getOne({
      id: citizen.serverId
    })

    if (!server || !server.isActive) {
      throw new Error('Server not found or inactive')
    }

    const guild = await bot.guilds.fetch(server.guildId)

    const member = await guild.members.fetch(citizen.userId)

    await Promise.all([
      member.roles.remove([server.infectedRoleId!, server.quarantineRoleId!]),
      member.roles.add(server.deadRoleId!)
    ])

    if (notify) {
      await this.sendNotification(
        server,
        guild,
        citizen,
        new EmbedBuilder({
          title: 'Покойтесь с миром',
          color: 0x000000,
          description: 'Вы не изолировались и не приступили к лечению вовремя.'
        })
      )
    }
  }

  private async sendNotification(
    server: Server,
    guild: Guild,
    citizen: Citizen,
    embed: EmbedBuilder
  ): Promise<void> {
    const channel = await guild.channels.fetch(server.quarantineChannelId!)

    if (!channel || !channel?.isTextBased()) {
      throw new Error(`Channel not found or not text-based`)
    }

    channel.send({
      content: `<@${citizen.userId}>`,
      embeds: [embed]
    })
  }
}
