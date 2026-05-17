import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Navbar | profile link', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('profile link href is present in page props when authenticated', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      username: 'navlinkuser',
      email: 'navlinkuser@example.com',
      password: 'password123',
    })
    const response = await client.get('/').loginAs(user)
    response.assertStatus(200)
    assert.include(response.text(), user.username)
  })

  test('profile link is absent when unauthenticated', async ({ client, assert }) => {
    const response = await client.get('/')
    response.assertStatus(200)
    assert.notInclude(response.text(), '/users/')
  })
})
