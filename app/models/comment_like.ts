import User from '#models/user'
import Comment from '#models/comment'
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class CommentLike extends BaseModel {
  static table = 'comment_likes'

  @column()
  declare commentId: number

  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Comment, { foreignKey: 'commentId' })
  declare comment: BelongsTo<typeof Comment>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
