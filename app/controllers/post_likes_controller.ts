import type { HttpContext } from '@adonisjs/core/http'
import PostLike from '#models/post_like'

export default class PostLikesController {
  async store({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await PostLike.firstOrCreate({ postId: Number(params.postId), userId: user.id })
    return response.redirect().back()
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const like = await PostLike.query()
      .where('postId', params.postId)
      .where('userId', user.id)
      .first()
    await like?.delete()
    return response.redirect().back()
  }
}
