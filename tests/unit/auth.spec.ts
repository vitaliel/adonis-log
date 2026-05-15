import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { registerValidator } from '#validators/auth/register_validator'

test.group('Register Validator', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('accepts valid registration data', async ({ assert }) => {
    const validated = await registerValidator.validate({
      username: 'validuser',
      email: 'valid@example.com',
      password: 'password123',
    })

    assert.equal(validated.username, 'validuser')
    assert.equal(validated.email, 'valid@example.com')
    assert.equal(validated.password, 'password123')
  })

  test('rejects username shorter than 3 characters', async ({ assert }) => {
    await assert.rejects(
      () =>
        registerValidator.validate({
          username: 'ab',
          email: 'valid@example.com',
          password: 'password123',
        }),
      /validation failure/i
    )
  })

  test('rejects invalid email format', async ({ assert }) => {
    await assert.rejects(
      () =>
        registerValidator.validate({
          username: 'validuser',
          email: 'not-an-email',
          password: 'password123',
        }),
      /validation failure/i
    )
  })

  test('rejects password shorter than 8 characters', async ({ assert }) => {
    await assert.rejects(
      () =>
        registerValidator.validate({
          username: 'validuser',
          email: 'valid@example.com',
          password: 'short',
        }),
      /validation failure/i
    )
  })

  test('rejects duplicate email', async ({ assert }) => {
    await User.create({
      username: 'existing',
      email: 'taken@example.com',
      password: 'password123',
    })

    await assert.rejects(
      () =>
        registerValidator.validate({
          username: 'newuser',
          email: 'taken@example.com',
          password: 'password123',
        }),
      /validation failure/i
    )
  })

  test('rejects duplicate username', async ({ assert }) => {
    await User.create({
      username: 'takenuser',
      email: 'other@example.com',
      password: 'password123',
    })

    await assert.rejects(
      () =>
        registerValidator.validate({
          username: 'takenuser',
          email: 'unique@example.com',
          password: 'password123',
        }),
      /validation failure/i
    )
  })
})

test.group('User Model - Password Hashing', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('hashes password on create (never stores plain text)', async ({ assert }) => {
    const user = await User.create({
      username: 'hashtest',
      email: 'hash@example.com',
      password: 'plainpassword',
    })

    assert.notEqual(user.password, 'plainpassword')
    assert.isAbove(user.password.length, 20)
  })

  test('can verify correct password after hashing', async ({ assert }) => {
    await User.create({
      username: 'verifytest',
      email: 'verify@example.com',
      password: 'mysecretpass',
    })

    const found = await User.verifyCredentials('verify@example.com', 'mysecretpass')
    assert.equal(found.email, 'verify@example.com')
  })

  test('rejects wrong password via verifyCredentials', async ({ assert }) => {
    await User.create({
      username: 'wrongpass',
      email: 'wrongpass@example.com',
      password: 'correctpassword',
    })

    await assert.rejects(() => User.verifyCredentials('wrongpass@example.com', 'wrongpassword'))
  })
})
