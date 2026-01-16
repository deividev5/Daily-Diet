import knex from 'knex'
import { env } from './env/index.ts'
import type { Knex } from 'knex'

// Configuração do Knex para SQLite
export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knexConfig = knex(config)
