import { CronJob } from 'cron'
import { Between, Raw } from 'typeorm'

import { bot } from './bot'
import { CitizenStatus, DEATH_TIME, QUARANTIME_TIME } from './constants'
import { drugsEvents } from './events/drugs'
import { CitizenService } from './services/citizen.service'
import { ServerService } from './services/server.service'
import { captureError } from './utils'

export class Jobs {
  private readonly serverService = new ServerService()
  private readonly citizenService = new CitizenService()
  private readonly jobs: CronJob[] = []

  public constructor() {
    this.onDrugsRefill = this.onDrugsRefill.bind(this)
    this.onDeadline = this.onDeadline.bind(this)

    this.jobs.push(
      new CronJob('* * * * *', this.onDrugsRefill, null, null, 'Europe/Moscow'),
      new CronJob('* * * * *', this.onDeadline, null, null, 'Europe/Moscow')
    )
  }

  public init() {
    for (const job of this.jobs) {
      job.start()
    }
  }

  private async onDrugsRefill() {
    console.log('refilling drugs...')
    const servers = await this.serverService.getList()

    for (const server of servers) {
      try {
        server.drugsCount += 1
        console.log(`- server ${server.id} now has ${server.drugsCount}`)

        await this.serverService.update({
          id: server.id,
          data: {
            drugsCount: server.drugsCount
          }
        })

        drugsEvents.emit('refill', server)
      } catch (error) {
        captureError(error, {
          server
        })
      }
    }

    console.log('refilling drugs done')
  }

  private async onDeadline() {
    console.log('running deadline...')
    const servers = await this.serverService.getList()

    for (const server of servers) {
      try {
        const guild = await bot.guilds.fetch(server.guildId)
        const citizens = await this.citizenService.getList({
          serverId: server.id,
          status: CitizenStatus.Infected,
          opts: {
            relations: {
              vaccinations: true
            }
          }
        })

        for (const citizen of citizens) {
          const member = guild.members.cache.get(citizen.userId)

          if (!member) {
            continue
          }

          const isQuarantined = member.roles.cache.has(server.quarantineRoleId!)
          const deadline = isQuarantined ? QUARANTIME_TIME : DEATH_TIME

          // Есть ещё время для жизни
          if (Date.now() < citizen.infectionDate!.getTime() + deadline) {
            continue
          }

          // Если вакцинирован, то выживает, если нет, то убиваем
          if (citizen.vaccinations.length >= 2) {
            this.citizenService.markRecovered(citizen, true)
          } else {
            this.citizenService.markDead(citizen, true)
          }
        }
      } catch (error) {
        captureError(error, {
          server
        })
      }
    }

    console.log('running deadline done')
  }
}
