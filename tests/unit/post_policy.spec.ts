import User from '#models/user'
import Post from '#models/post'
import Tag from '#models/tag'
import PostPolicy from '#policies/post_policy'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Story 2.3 | PostPolicy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('edit returns true when user owns the post', async ({ assert }) => {
    const user = await User.create({
      username: 'owner',
      email: 'owner@example.com',
      password: await hash.make('secret'),
    })
    const post = await Post.create({ userId: user.id, title: 'My Post', body: 'Body' })

    const policy = new PostPolicy()
    assert.isTrue(policy.edit(user, post))
  })

  test('edit returns false when user does not own the post', async ({ assert }) => {
    const owner = await User.create({
      username: 'owner2',
      email: 'owner2@example.com',
      password: await hash.make('secret'),
    })
    const other = await User.create({
      username: 'other2',
      email: 'other2@example.com',
      password: await hash.make('secret'),
    })
    const post = await Post.create({ userId: owner.id, title: 'Their Post', body: 'Body' })

    const policy = new PostPolicy()
    assert.isFalse(policy.edit(other, post))
  })

  test('delete returns true when user owns the post', async ({ assert }) => {
    const user = await User.create({
      username: 'delowner',
      email: 'delowner@example.com',
      password: await hash.make('secret'),
    })
    const post = await Post.create({ userId: user.id, title: 'Delete Me', body: 'Body' })

    const policy = new PostPolicy()
    assert.isTrue(policy.delete(user, post))
  })

  test('delete returns false when user does not own the post', async ({ assert }) => {
    const owner = await User.create({
      username: 'delowner2',
      email: 'delowner2@example.com',
      password: await hash.make('secret'),
    })
    const other = await User.create({
      username: 'delother2',
      email: 'delother2@example.com',
      password: await hash.make('secret'),
    })
    const post = await Post.create({ userId: owner.id, title: 'Not Mine', body: 'Body' })

    const policy = new PostPolicy()
    assert.isFalse(policy.delete(other, post))
  })
})

test.group('Story 2.3 | Tag sync on update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('sync replaces tags on update (removes old, adds new)', async ({ assert }) => {
    const user = await User.create({
      username: 'tagger',
      email: 'tagger@example.com',
      password: await hash.make('secret'),
    })
    const post = await Post.create({ userId: user.id, title: 'Tagged Post', body: 'Body' })

    const oldTag = await Tag.firstOrCreate(
      { slug: 'old-tag' },
      { name: 'Old Tag', slug: 'old-tag' }
    )
    await post.related('tags').attach([oldTag.id])

    // Simulate the sync operation done in update controller
    const newTag = await Tag.firstOrCreate(
      { slug: 'new-tag' },
      { name: 'New Tag', slug: 'new-tag' }
    )
    await post.related('tags').sync([newTag.id])

    await post.load('tags')
    const tagSlugs = post.tags.map((t) => t.slug)
    assert.notInclude(tagSlugs, 'old-tag')
    assert.include(tagSlugs, 'new-tag')
  })

  test('sync with empty array removes all tags', async ({ assert }) => {
    const user = await User.create({
      username: 'tagger2',
      email: 'tagger2@example.com',
      password: await hash.make('secret'),
    })
    const post = await Post.create({ userId: user.id, title: 'Tagged Post 2', body: 'Body' })

    const tag = await Tag.firstOrCreate({ slug: 'rm-tag' }, { name: 'Remove Tag', slug: 'rm-tag' })
    await post.related('tags').attach([tag.id])

    await post.related('tags').sync([])
    await post.load('tags')

    assert.equal(post.tags.length, 0)
  })
})
