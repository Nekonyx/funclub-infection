import 'dotenv/config'

import { CronJob } from 'cron'
import { resolve } from 'path'

import { importx } from '@discordx/importer'

import { bot } from './bot'
import { dataSource } from './db'
import { Jobs } from './jobs'

run()
  .then(() => {
    console.log('ready')
  })
  .catch((error) => {
    console.error('fatal:', error)
    process.exit(1)
  })

async function run() {
  console.log('importing commands and events...')
  await importx(
    resolve(__dirname, './bot/commands/**/*.command.{ts,js}'),
    resolve(__dirname, './bot/events/**/*.{ts,js}')
  )

  console.log('initializing database...')
  await dataSource.initialize()

  console.log('logging in...')
  await bot.login(process.env.DISCORD_TOKEN!)

  console.log('initializing application commands...')
  await bot.initApplicationCommands()

  console.log('initializing jobs...')
  const jobs = new Jobs()
  jobs.init()
}

process.on('uncaughtException', (error) => {
  console.error('uncaught exception:', error)
})

process.on('unhandledRejection', (error) => {
  console.error('unhandled rejection:', error)
})
