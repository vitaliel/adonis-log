import User from '#models/user'
import Post from '#models/post'
import Comment from '#models/comment'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Comments | store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /posts/:postId/comments authenticated with valid body → 302 redirect', async ({
    client,
  }) => {
    const user = await User.create({
      username: 'commenter',
      email: 'commenter@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'Post', body: 'Body' })
    const response = await client
      .post(`/posts/${post.id}/comments`)
      .form({ body: 'Great post!' })
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)
  })

  test('POST /posts/:postId/comments with empty body → redirect back with validation error', async ({
    client,
  }) => {
    const user = await User.create({
      username: 'commenter2',
      email: 'commenter2@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'Post', body: 'Body' })
    const response = await client
      .post(`/posts/${post.id}/comments`)
      .form({ body: '' })
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)
  })
})

test.group('Comments | destroy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('DELETE /posts/:postId/comments/:id as comment owner → 302 redirect', async ({ client }) => {
    const user = await User.create({
      username: 'commentowner',
      email: 'commentowner@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'Post', body: 'Body' })
    const comment = await Comment.create({ userId: user.id, postId: post.id, body: 'My comment' })
    const response = await client
      .delete(`/posts/${post.id}/comments/${comment.id}`)
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)
  })

  test('DELETE /posts/:postId/comments/:id as non-owner → redirect back (access denied)', async ({
    client,
  }) => {
    const owner = await User.create({
      username: 'commentcreator',
      email: 'commentcreator@example.com',
      password: 'password123',
    })
    const attacker = await User.create({
      username: 'commentattacker',
      email: 'commentattacker@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: owner.id, title: 'Post', body: 'Body' })
    const comment = await Comment.create({
      userId: owner.id,
      postId: post.id,
      body: 'Owner comment',
    })
    const response = await client
      .delete(`/posts/${post.id}/comments/${comment.id}`)
      .loginAs(attacker)
      .redirects(0)
    // AdonisJS redirects back for HTML form submissions on authorization failure
    response.assertStatus(302)
    await comment.refresh()
    if (comment.body !== 'Owner comment') {
      throw new Error('Unauthorized comment delete/update side effect detected')
    }
  })
})
