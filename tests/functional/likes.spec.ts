import User from '#models/user'
import Post from '#models/post'
import Comment from '#models/comment'
import PostLike from '#models/post_like'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Likes | post likes', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /posts/:postId/likes authenticated → 302 redirect, like created', async ({
    client,
  }) => {
    const user = await User.create({
      username: 'liker',
      email: 'liker@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'Post', body: 'Body' })
    const response = await client.post(`/posts/${post.id}/likes`).loginAs(user).redirects(0)
    response.assertStatus(302)
  })

  test('DELETE /posts/:postId/likes authenticated (toggle off) → 302 redirect, like removed', async ({
    client,
  }) => {
    const user = await User.create({
      username: 'unliker',
      email: 'unliker@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'Post', body: 'Body' })
    await PostLike.create({ postId: post.id, userId: user.id })
    const response = await client.delete(`/posts/${post.id}/likes`).loginAs(user).redirects(0)
    response.assertStatus(302)
  })

  test('POST /posts/:postId/likes unauthenticated → 302 redirect to /login', async ({ client }) => {
    const user = await User.create({
      username: 'postowner',
      email: 'postowner@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'Post', body: 'Body' })
    const response = await client.post(`/posts/${post.id}/likes`).redirects(0)
    response.assertStatus(302)
    const location = response.header('location') ?? ''
    if (!location.includes('/login')) {
      throw new Error(`Expected redirect to /login, got: ${location}`)
    }
  })
})

test.group('Likes | comment likes', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /posts/:postId/comments/:commentId/likes authenticated → 302 redirect', async ({
    client,
  }) => {
    const user = await User.create({
      username: 'commentliker',
      email: 'commentliker@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'Post', body: 'Body' })
    const comment = await Comment.create({ userId: user.id, postId: post.id, body: 'Nice!' })
    const response = await client
      .post(`/posts/${post.id}/comments/${comment.id}/likes`)
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)
  })
})
