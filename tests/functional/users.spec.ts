import User from '#models/user'
import UserSocialLink from '#models/user_social_link'
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

  test('PUT /users/:username as that user with valid bio and social links → 302 redirect, profile updated', async ({
    client,
  }) => {
    const user = await User.create({
      username: 'bioupdater',
      email: 'bioupdater@example.com',
      password: 'password123',
    })
    await UserSocialLink.create({
      userId: user.id,
      type: 'Twitter',
      url: 'https://twitter.com/old-link',
    })
    const response = await client
      .put(`/users/${user.username}`)
      .form({
        'bio': 'Updated bio content',
        'social_links[0][type]': 'GitHub',
        'social_links[0][url]': 'https://github.com/bioupdater',
      })
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)

    await user.refresh()
    if (user.bio !== 'Updated bio content') {
      throw new Error(`Expected bio to be updated, got: ${user.bio}`)
    }
    await user.load('socialLinks')
    if (user.socialLinks.length !== 1) {
      throw new Error(`Expected one social link, got ${user.socialLinks.length}`)
    }
    if (
      user.socialLinks[0].type !== 'GitHub' ||
      user.socialLinks[0].url !== 'https://github.com/bioupdater'
    ) {
      throw new Error('Expected social links to be replaced with submitted value')
    }
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

  test('GET /users/:username/edit as another authenticated user → redirect', async ({ client }) => {
    const owner = await User.create({
      username: 'editowner',
      email: 'editowner@example.com',
      password: 'password123',
    })
    const attacker = await User.create({
      username: 'editattacker',
      email: 'editattacker@example.com',
      password: 'password123',
    })

    const response = await client
      .get(`/users/${owner.username}/edit`)
      .loginAs(attacker)
      .redirects(0)
    response.assertStatus(302)

    const location = response.header('location') ?? ''
    const path = new URL(location, 'http://localhost').pathname
    if (path !== '/') {
      throw new Error(`Expected redirect to /, got: ${location}`)
    }
  })
})
