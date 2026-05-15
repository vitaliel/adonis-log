import type Post from '#models/post'
import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PostPolicy extends BasePolicy {
  edit(user: User, post: Post): AuthorizerResponse {
    return post.userId === user.id
  }

  delete(user: User, post: Post): AuthorizerResponse {
    return post.userId === user.id
  }
}
