import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.uuid('session_id').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })

  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.text('description').notNullable()
    table.boolean('is_on_diet').notNullable()
    table.dateTime('date_time').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
    table.uuid('user_id').notNullable().references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
  await knex.schema.dropTable('users')
}
