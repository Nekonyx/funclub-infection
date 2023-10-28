import { resolve } from 'path'
import { DataSource } from 'typeorm'

export const dataSource = new DataSource({
  type: 'sqlite',
  database: resolve(process.cwd(), './data/sqlite.db'),
  entities: [resolve(__dirname, './entities/**/*.entity.{ts,js}')],
  migrations: [resolve(__dirname, './migrations/**/*.{ts,js}')]
})
