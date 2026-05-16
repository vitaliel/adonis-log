import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'
import UserSocialLink from '#models/user_social_link'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  @hasMany(() => Post, { foreignKey: 'userId' })
  declare posts: HasMany<typeof Post>

  @hasMany(() => UserSocialLink, { foreignKey: 'userId' })
  declare socialLinks: HasMany<typeof UserSocialLink>

  get initials() {
    const name = this.username || this.email
    return name.slice(0, 2).toUpperCase()
  }
}
