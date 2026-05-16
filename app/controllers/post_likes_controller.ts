import type { HttpContext } from '@adonisjs/core/http'
import PostLike from '#models/post_like'

export default class PostLikesController {
  async store({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const postId = Number(params.postId)
    await PostLike.firstOrCreate({ postId, userId: user.id })
    return response.redirect().back()
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const postId = Number(params.postId)
    await PostLike.query().where('postId', postId).where('userId', user.id).delete()
    return response.redirect().back()
  }
}
