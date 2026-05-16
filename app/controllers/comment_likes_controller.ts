import type { HttpContext } from '@adonisjs/core/http'
import CommentLike from '#models/comment_like'

export default class CommentLikesController {
  async store({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await CommentLike.firstOrCreate({ commentId: Number(params.commentId), userId: user.id })
    return response.redirect().back()
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const like = await CommentLike.query()
      .where('commentId', params.commentId)
      .where('userId', user.id)
      .first()
    await like?.delete()
    return response.redirect().back()
  }
}
