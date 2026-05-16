import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comment_likes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('comment_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('comments')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.unique(['comment_id', 'user_id'])
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
