import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_social_links'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('type').notNullable()
      table.string('url').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
