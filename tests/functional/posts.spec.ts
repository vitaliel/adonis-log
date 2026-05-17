import User from '#models/user'
import Post from '#models/post'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

function extractInertiaPagePayload(html: string) {
  const pageMatch = html.match(/data-page="([^"]+)"/)
  if (!pageMatch) {
    throw new Error('Expected Inertia data-page payload in response HTML')
  }

  const decoded = pageMatch[1]
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')

  return JSON.parse(decoded)
}

test.group('Posts | public read', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /posts → 200 with post list', async ({ client }) => {
    const response = await client.get('/posts')
    response.assertStatus(200)
  })

  test('GET /posts guest → does not show New Post link', async ({ client, assert }) => {
    const response = await client.get('/posts')
    response.assertStatus(200)
    const page = extractInertiaPagePayload(response.text())
    assert.isNull(page.props.auth.user)
  })

  test('GET /posts authenticated empty list → shows empty state and New Post link', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      username: 'emptylistuser',
      email: 'emptylistuser@example.com',
      password: 'password123',
    })
    await Post.query().delete()

    const response = await client.get('/posts').loginAs(user)
    response.assertStatus(200)
    const page = extractInertiaPagePayload(response.text())
    assert.equal(page.component, 'posts/PostIndex')
    assert.equal(page.props.auth.user.id, user.id)
    assert.equal(page.props.posts.length, 0)
  })

  test('GET /posts/:id → 200 with post detail', async ({ client }) => {
    const user = await User.create({
      username: 'postauthor',
      email: 'postauthor@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'Hello', body: 'World' })
    const response = await client.get(`/posts/${post.id}`)
    response.assertStatus(200)
  })
})

test.group('Posts | authenticated create', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /posts/create authenticated → 200', async ({ client }) => {
    const user = await User.create({
      username: 'creator',
      email: 'creator@example.com',
      password: 'password123',
    })
    const response = await client.get('/posts/create').loginAs(user)
    response.assertStatus(200)
  })

  test('POST /posts unauthenticated → 302 redirect to /login', async ({ client }) => {
    const response = await client.post('/posts').form({ title: 'T', body: 'B' }).redirects(0)
    response.assertStatus(302)
    const location = response.header('location') ?? ''
    if (!location.includes('/login')) {
      throw new Error(`Expected redirect to /login, got: ${location}`)
    }
  })

  test('POST /posts authenticated with valid data → 302 redirect to new post', async ({
    client,
  }) => {
    const user = await User.create({
      username: 'poster',
      email: 'poster@example.com',
      password: 'password123',
    })
    const response = await client
      .post('/posts')
      .form({ title: 'My Post', body: 'Some body content' })
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)
  })
})

test.group('Posts | edit / delete', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('PUT /posts/:id as owner → 302 redirect, post updated', async ({ client }) => {
    const user = await User.create({
      username: 'owner',
      email: 'owner@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'Original', body: 'Body' })
    const response = await client
      .put(`/posts/${post.id}`)
      .form({ title: 'Updated Title', body: 'Updated body' })
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)
  })

  test('PUT /posts/:id as non-owner → redirect back (access denied)', async ({ client }) => {
    const owner = await User.create({
      username: 'theowner',
      email: 'theowner@example.com',
      password: 'password123',
    })
    const attacker = await User.create({
      username: 'attacker',
      email: 'attacker@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: owner.id, title: 'Original', body: 'Body' })
    const response = await client
      .put(`/posts/${post.id}`)
      .form({ title: 'Hacked', body: 'Hacked body' })
      .loginAs(attacker)
      .redirects(0)
    // AdonisJS redirects back for HTML form submissions on authorization failure
    response.assertStatus(302)
    await post.refresh()
    if (post.title !== 'Original' || post.body !== 'Body') {
      throw new Error('Unauthorized update was applied')
    }
  })

  test('DELETE /posts/:id as owner → 302 redirect', async ({ client }) => {
    const user = await User.create({
      username: 'delowner',
      email: 'delowner@example.com',
      password: 'password123',
    })
    const post = await Post.create({ userId: user.id, title: 'To delete', body: 'Body' })
    const response = await client.delete(`/posts/${post.id}`).loginAs(user).redirects(0)
    response.assertStatus(302)
  })
})
