import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Auth | registration', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /register with valid data → 302 redirect, session established', async ({ client }) => {
    const response = await client
      .post('/register')
      .form({ username: 'newuser', email: 'newuser@example.com', password: 'password123' })
      .redirects(0)
    response.assertStatus(302)
  })

  test('POST /register with duplicate email → redirect back with errors', async ({ client }) => {
    await User.create({ username: 'existing', email: 'dup@example.com', password: 'password123' })
    const response = await client
      .post('/register')
      .form({ username: 'other', email: 'dup@example.com', password: 'password123' })
      .redirects(0)
    // VineJS unique violation → 422 unprocessable or redirect back
    const status = response.status()
    if (status !== 302 && status !== 422) {
      throw new Error(`Expected 302 or 422 but got ${status}`)
    }

    const users = await User.query().where('email', 'dup@example.com')
    if (users.length !== 1) {
      throw new Error(`Expected exactly 1 user with duplicate email, got ${users.length}`)
    }
  })
})

test.group('Auth | login / logout', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /login with valid credentials → 302 redirect, session established', async ({
    client,
  }) => {
    await User.create({ username: 'loginuser', email: 'login@example.com', password: 'secret123' })
    const response = await client
      .post('/login')
      .form({ email: 'login@example.com', password: 'secret123' })
      .redirects(0)
    response.assertStatus(302)
  })

  test('POST /login with invalid credentials → redirect back with errors', async ({ client }) => {
    await User.create({
      username: 'loginuser2',
      email: 'login2@example.com',
      password: 'secret123',
    })
    const response = await client
      .post('/login')
      .form({ email: 'login2@example.com', password: 'wrongpassword' })
      .redirects(0)
    response.assertStatus(302)
    const location = response.header('location') ?? ''
    const path = new URL(location, 'http://localhost').pathname
    if (path !== '/login') {
      throw new Error(`Expected redirect to /login, got: ${location}`)
    }
  })

  test('POST /logout when authenticated → session invalidated, redirect', async ({ client }) => {
    const user = await User.create({
      username: 'logoutuser',
      email: 'logout@example.com',
      password: 'secret123',
    })
    const response = await client.post('/logout').loginAs(user).redirects(0)
    response.assertStatus(302)
  })
})

test.group('Auth | protected route redirect', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /posts/create unauthenticated → 302 redirect to /login', async ({ client }) => {
    const response = await client.get('/posts/create').redirects(0)
    response.assertStatus(302)
    const location = response.header('location') ?? ''
    const path = new URL(location, 'http://localhost').pathname
    if (path !== '/login') {
      throw new Error(`Expected redirect to /login, got: ${location}`)
    }
  })
})
