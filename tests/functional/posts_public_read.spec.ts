import User from '#models/user'
import Post from '#models/post'
import Tag from '#models/tag'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Story 2.1 | Public posts read', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('posts query preloads author and tags', async ({ assert }) => {
    const user = await User.create({
      username: 'author_1',
      email: 'author_1@example.com',
      password: await hash.make('password123'),
    })

    const tag = await Tag.create({ name: 'Announcements', slug: 'announcements' })

    const firstPost = await Post.create({
      userId: user.id,
      title: 'First post',
      body: 'Body for first post',
    })
    await firstPost.related('tags').attach([tag.id])

    const posts = await Post.query()
      .preload('author')
      .preload('tags')
      .orderBy('created_at', 'desc')
      .paginate(1, 10)
    const fetchedPost = posts.all()[0]

    assert.equal(posts.all().length, 1)
    assert.equal(fetchedPost.author.username, 'author_1')
    assert.equal(fetchedPost.tags[0].slug, 'announcements')
  })

  test('tag relation query returns only posts with selected tag', async ({ assert }) => {
    const user = await User.create({
      username: 'author_2',
      email: 'author_2@example.com',
      password: await hash.make('password123'),
    })

    const engineering = await Tag.create({ name: 'Engineering', slug: 'engineering' })
    const randomTag = await Tag.create({ name: 'Random', slug: 'random' })

    const postWithEngineering = await Post.create({
      userId: user.id,
      title: 'Second post',
      body: 'Body for second post',
    })
    await postWithEngineering.related('tags').attach([engineering.id])

    const postWithRandom = await Post.create({
      userId: user.id,
      title: 'Third post',
      body: 'Body for third post',
    })
    await postWithRandom.related('tags').attach([randomTag.id])

    const filtered = await engineering
      .related('posts')
      .query()
      .preload('author')
      .preload('tags')
      .orderBy('created_at', 'desc')
      .paginate(1, 10)

    assert.equal(filtered.all().length, 1)
    assert.equal(filtered.all()[0].title, 'Second post')
    assert.equal(filtered.all()[0].author.username, 'author_2')
  })
})
