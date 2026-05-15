import Post from './post.js'
import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Post, {
    pivotTable: 'post_tags',
    localKey: 'id',
    pivotForeignKey: 'tag_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'post_id',
  })
  declare posts: ManyToMany<typeof Post>
}
