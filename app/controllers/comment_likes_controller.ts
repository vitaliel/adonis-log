import type { HttpContext } from '@adonisjs/core/http'
import CommentLike from '#models/comment_like'
import Comment from '#models/comment'

export default class CommentLikesController {
  async store({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const postId = Number(params.postId)
    const commentId = Number(params.commentId)
    const comment = await Comment.query()
      .where('id', commentId)
      .where('postId', postId)
      .firstOrFail()

    await CommentLike.firstOrCreate({ commentId: comment.id, userId: user.id })
    return response.redirect().back()
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const postId = Number(params.postId)
    const commentId = Number(params.commentId)
    const comment = await Comment.query()
      .where('id', commentId)
      .where('postId', postId)
      .firstOrFail()

    await CommentLike.query().where('commentId', comment.id).where('userId', user.id).delete()
    return response.redirect().back()
  }
}
