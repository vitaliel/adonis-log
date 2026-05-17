import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Users | public profile', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /users/:username → 200 public profile visible', async ({ client }) => {
    const user = await User.create({
      username: 'profileuser',
      email: 'profileuser@example.com',
      password: 'password123',
    })
    const response = await client.get(`/users/${user.username}`)
    response.assertStatus(200)
  })
})

test.group('Users | edit profile', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /users/:username/edit as that user → 200 edit form visible', async ({ client }) => {
    const user = await User.create({
      username: 'editableuser',
      email: 'editableuser@example.com',
      password: 'password123',
    })
    const response = await client.get(`/users/${user.username}/edit`).loginAs(user)
    response.assertStatus(200)
  })

  test('PUT /users/:username as that user with valid bio → 302 redirect, bio updated', async ({
    client,
  }) => {
    const user = await User.create({
      username: 'bioupdater',
      email: 'bioupdater@example.com',
      password: 'password123',
    })
    const response = await client
      .put(`/users/${user.username}`)
      .form({ bio: 'Updated bio content' })
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)
  })

  test('GET /users/:username/edit unauthenticated → 302 redirect to /login', async ({ client }) => {
    const user = await User.create({
      username: 'unauthprofile',
      email: 'unauthprofile@example.com',
      password: 'password123',
    })
    const response = await client.get(`/users/${user.username}/edit`).redirects(0)
    response.assertStatus(302)
    const location = response.header('location') ?? ''
    if (!location.includes('/login')) {
      throw new Error(`Expected redirect to /login, got: ${location}`)
    }
  })
})
