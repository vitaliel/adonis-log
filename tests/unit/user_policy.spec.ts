import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Story 3.2 | UserPolicy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('edit returns true when user is editing their own profile', async ({ assert }) => {
    const user = await User.create({
      username: 'selfowner',
      email: 'selfowner@example.com',
      password: await hash.make('secret'),
    })

    const policy = new UserPolicy()
    assert.isTrue(policy.edit(user, user))
  })

  test('edit returns false when user tries to edit another profile', async ({ assert }) => {
    const owner = await User.create({
      username: 'profileowner',
      email: 'profileowner@example.com',
      password: await hash.make('secret'),
    })
    const other = await User.create({
      username: 'intruder',
      email: 'intruder@example.com',
      password: await hash.make('secret'),
    })

    const policy = new UserPolicy()
    assert.isFalse(policy.edit(other, owner))
  })
})
