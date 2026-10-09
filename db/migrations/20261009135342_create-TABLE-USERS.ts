import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.uuid('session_id').after('id').index()
    table.text('name').notNullable()
    table.text('email').notNullable().unique()
    table.text('password').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })

  await knex.schema.createTable('food', (table) => {
    table.uuid('id').primary()

    table.uuid('user_id').notNullable()
    table.foreign('user_id').references('id').inTable('users')

    table.text('name').notNullable()
    table.text('description').notNullable()
    table.enum('diet',['s', 'n'])
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('food')
  await knex.schema.dropTable('users')
}

