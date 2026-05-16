import User from '#models/user'
import UserSocialLink from '#models/user_social_link'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Story 3.2 | Profile social links replace-all strategy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('replace-all: deleting and re-creating social links persists new set', async ({
    assert,
  }) => {
    const user = await User.create({
      username: 'linkuser',
      email: 'linkuser@example.com',
      password: await hash.make('secret'),
    })

    await UserSocialLink.create({ userId: user.id, type: 'Twitter', url: 'https://twitter.com/x' })

    // Simulate update: delete all, re-create new set
    await user.related('socialLinks').query().delete()
    await UserSocialLink.createMany([
      { userId: user.id, type: 'GitHub', url: 'https://github.com/newuser' },
      { userId: user.id, type: 'LinkedIn', url: 'https://linkedin.com/in/newuser' },
    ])

    await user.load('socialLinks')
    const types = user.socialLinks.map((l) => l.type)

    assert.notInclude(types, 'Twitter')
    assert.include(types, 'GitHub')
    assert.include(types, 'LinkedIn')
    assert.equal(user.socialLinks.length, 2)
  })

  test('replace-all with empty array removes all social links', async ({ assert }) => {
    const user = await User.create({
      username: 'linkuser2',
      email: 'linkuser2@example.com',
      password: await hash.make('secret'),
    })

    await UserSocialLink.create({ userId: user.id, type: 'Twitter', url: 'https://twitter.com/x' })

    await user.related('socialLinks').query().delete()

    await user.load('socialLinks')
    assert.equal(user.socialLinks.length, 0)
  })

  test('bio update persists null when cleared', async ({ assert }) => {
    const user = await User.create({
      username: 'biouser',
      email: 'biouser@example.com',
      password: await hash.make('secret'),
      bio: 'Old bio',
    })

    user.bio = null
    await user.save()

    const refreshed = await User.findOrFail(user.id)
    assert.isNull(refreshed.bio)
  })
})
