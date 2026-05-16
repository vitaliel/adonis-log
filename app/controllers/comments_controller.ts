import Post from '#models/post'
import Comment from '#models/comment'
import CommentPolicy from '#policies/comment_policy'
import { createCommentValidator } from '#validators/comments/create_comment_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  async store({ params, request, response, auth }: HttpContext) {
    const post = await Post.findOrFail(params.postId)
    const { body } = await request.validateUsing(createCommentValidator)
    await Comment.create({ postId: post.id, userId: auth.user!.id, body })
    return response.redirect(`/posts/${post.id}`)
  }

  async destroy({ params, response, bouncer }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    if (comment.postId !== Number(params.postId)) {
      return response.notFound()
    }
    await bouncer.with(CommentPolicy).authorize('delete', comment)
    await comment.delete()
    return response.redirect(`/posts/${comment.postId}`)
  }
}
