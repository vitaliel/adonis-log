import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Post from '#models/post'
import Comment from '#models/comment'

export default class CommentSeeder extends BaseSeeder {
  async run() {
    // Sub-seeders may be invoked directly by `node ace db:seed`; skip gracefully when
    // dependencies created by UserSeeder/PostSeeder are not yet present (MainSeeder
    // will call this seeder in the correct order).
    const alice = await User.findBy('email', 'alice@example.com')
    const bob = await User.findBy('email', 'bob@example.com')
    if (!alice || !bob) return

    const post1 = await Post.query()
      .where('title', 'Getting Started with AdonisJS and TypeScript')
      .where('userId', alice.id)
      .first()
    const post2 = await Post.query()
      .where('title', 'Why I Switched from REST to Inertia.js')
      .where('userId', alice.id)
      .first()
    const post3 = await Post.query()
      .where('title', 'Deep Dive into AdonisJS Lucid ORM')
      .where('userId', bob.id)
      .first()
    const post5 = await Post.query()
      .where('title', 'Optimising Database Queries in Node.js Applications')
      .where('userId', bob.id)
      .first()
    if (!post1 || !post2 || !post3 || !post5) {
      console.info('[CommentSeeder] Skipping: required posts were not found')
      return
    }

    await Comment.firstOrCreate(
      {
        postId: post1.id,
        userId: bob.id,
        body: 'Great intro! The section on strict type checking saved me hours of debugging on my last project.',
      },
      {}
    )

    await Comment.firstOrCreate(
      {
        postId: post1.id,
        userId: alice.id,
        body: 'Thanks! I also recommend reading the official AdonisJS docs on validators — they pair really well with what is covered here.',
      },
      {}
    )

    await Comment.firstOrCreate(
      {
        postId: post2.id,
        userId: bob.id,
        body: 'Inertia really is a game changer for teams that already know Laravel or AdonisJS. No more maintaining two separate codebases.',
      },
      {}
    )

    await Comment.firstOrCreate(
      {
        postId: post3.id,
        userId: alice.id,
        body: 'The schema-driven approach in v6 is brilliant. Having TypeScript types auto-generated from the actual DB schema eliminates a whole class of runtime errors.',
      },
      {}
    )

    await Comment.firstOrCreate(
      {
        postId: post5.id,
        userId: alice.id,
        body: 'The N+1 section is gold. I had exactly this problem last week and your explanation of preload() cleared it up immediately.',
      },
      {}
    )
  }
}
