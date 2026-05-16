import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  edit(authUser: User, profile: User): AuthorizerResponse {
    return profile.id === authUser.id
  }
}
