import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Post from '#models/post'
import Comment from '#models/comment'
import PostLike from '#models/post_like'
import CommentLike from '#models/comment_like'

export default class LikeSeeder extends BaseSeeder {
  async run() {
    // Sub-seeders may be invoked directly by `node ace db:seed`; skip gracefully when
    // dependencies created by UserSeeder/PostSeeder/CommentSeeder are not yet present.
    const alice = await User.findBy('email', 'alice@example.com')
    const bob = await User.findBy('email', 'bob@example.com')
    if (!alice || !bob) return

    const post1 = await Post.query()
      .where('title', 'Getting Started with AdonisJS and TypeScript')
      .where('userId', alice.id)
      .first()
    const post2 = await Post.query()
      .where('title', 'Why I Switched from REST to Inertia.js')
      .where('userId', alice.id)
      .first()
    const post3 = await Post.query()
      .where('title', 'Deep Dive into AdonisJS Lucid ORM')
      .where('userId', bob.id)
      .first()
    const post4 = await Post.query()
      .where('title', "Contributing to Open Source: A Beginner's Guide")
      .where('userId', bob.id)
      .first()
    const post5 = await Post.query()
      .where('title', 'Optimising Database Queries in Node.js Applications')
      .where('userId', bob.id)
      .first()
    if (!post1 || !post2 || !post3 || !post4 || !post5) {
      console.info('[LikeSeeder] Skipping: required posts were not found')
      return
    }

    // Post likes
    await PostLike.firstOrCreate({ postId: post1.id, userId: bob.id })
    await PostLike.firstOrCreate({ postId: post2.id, userId: bob.id })
    await PostLike.firstOrCreate({ postId: post3.id, userId: alice.id })
    await PostLike.firstOrCreate({ postId: post4.id, userId: alice.id })
    await PostLike.firstOrCreate({ postId: post5.id, userId: alice.id })

    // Comment likes
    const post1Comments = await Comment.query().where('postId', post1.id)
    const post2Comments = await Comment.query().where('postId', post2.id)
    const post3Comments = await Comment.query().where('postId', post3.id)

    for (const comment of post1Comments) {
      if (comment.userId !== bob.id) {
        await CommentLike.firstOrCreate({ commentId: comment.id, userId: bob.id })
      }
      if (comment.userId !== alice.id) {
        await CommentLike.firstOrCreate({ commentId: comment.id, userId: alice.id })
      }
    }

    for (const comment of post2Comments) {
      if (comment.userId !== alice.id) {
        await CommentLike.firstOrCreate({ commentId: comment.id, userId: alice.id })
      }
    }

    for (const comment of post3Comments) {
      if (comment.userId !== bob.id) {
        await CommentLike.firstOrCreate({ commentId: comment.id, userId: bob.id })
      }
    }
  }
}
