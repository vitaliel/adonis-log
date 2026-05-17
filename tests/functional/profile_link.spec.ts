import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Navbar | profile link', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /users/:username/edit authenticated as owner → 200 profile edit page', async ({
    client,
  }) => {
    const user = await User.create({
      username: 'profilelink',
      email: 'profilelink@example.com',
      password: 'password123',
    })
    const response = await client.get(`/users/${user.username}/edit`).loginAs(user)
    response.assertStatus(200)
  })

  test('GET /users/:username/edit unauthenticated → 302 redirect to /login', async ({ client }) => {
    const user = await User.create({
      username: 'profilelinkguest',
      email: 'profilelinkguest@example.com',
      password: 'password123',
    })
    const response = await client.get(`/users/${user.username}/edit`).redirects(0)
    response.assertStatus(302)
    const location = response.header('location') ?? ''
    const path = new URL(location, 'http://localhost').pathname
    if (path !== '/login') {
      throw new Error(`Expected redirect to /login, got: ${location}`)
    }
  })

  test('GET /users/:username/edit as another authenticated user → 302 redirect', async ({
    client,
  }) => {
    const owner = await User.create({
      username: 'profilelinkowner',
      email: 'profilelinkowner@example.com',
      password: 'password123',
    })
    const other = await User.create({
      username: 'profilelinkother',
      email: 'profilelinkother@example.com',
      password: 'password123',
    })
    const response = await client
      .get(`/users/${owner.username}/edit`)
      .loginAs(other)
      .redirects(0)
    response.assertStatus(302)
  })
})
