import User from '#models/user'
import Tag from './tag.js'
import Comment from './comment.js'
import PostLike from './post_like.js'
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare body: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare author: BelongsTo<typeof User>

  @manyToMany(() => Tag, {
    pivotTable: 'post_tags',
    localKey: 'id',
    pivotForeignKey: 'post_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>

  @hasMany(() => Comment, { foreignKey: 'postId' })
  declare comments: HasMany<typeof Comment>

  @hasMany(() => PostLike, { foreignKey: 'postId' })
  declare postLikes: HasMany<typeof PostLike>
}
