import { IntentsBitField } from 'discord.js'
import { Client } from 'discordx'

import { CitizenService } from '../services/citizen.service'
import { ServerService } from '../services/server.service'
import { captureError } from '../utils'
import { createErrorEmbed } from './helpers'

export const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent
  ]
})

// Заполняем список серверов и граждан
bot.once('ready', async () => {
  const serverService = new ServerService()
  const citizenService = new CitizenService()

  const guilds = await bot.guilds.fetch()

  // Сервера
  console.log('populating servers...')
  const servers = await Promise.all(
    guilds.map((guild) =>
      serverService.getOrCreateOne({
        guildId: guild.id,
        creationParams: {
          guildId: guild.id
        }
      })
    )
  )

  // Граждане
  console.log('populating citizens...')
  if (servers.length > 0) {
    await Promise.all(
      servers.flatMap(async (server) => {
        const guild = await bot.guilds.fetch(server.guildId)
        const members =
          guild.members.cache.size === guild.memberCount
            ? guild.members.cache
            : await guild.members.fetch()

        console.log(`guild ${guild.name} has ${members.size} members`)
        return members.map((member) =>
          citizenService.getOrCreateOne({
            userId: member.id,
            serverId: server.id,
            creationParams: {
              userId: member.id,
              serverId: server.id
            }
          })
        )
      })
    )
  }

  console.log('done!')
})

// Выполнение интеракции с обработкой ошибок
bot.on('interactionCreate', async (interaction) => {
  if (!interaction.inGuild()) {
    return
  }

  try {
    await bot.executeInteraction(interaction)
  } catch (error) {
    const incidentId = captureError(error)

    if (!interaction.isRepliable()) {
      return
    }

    const embed = createErrorEmbed(
      incidentId,
      undefined,
      error instanceof Error ? error : undefined
    )

    if (interaction.replied) {
      await interaction.followUp({
        embeds: [embed]
      })
    } else {
      await interaction.reply({
        ephemeral: true,
        embeds: [embed]
      })
    }
  }
})
