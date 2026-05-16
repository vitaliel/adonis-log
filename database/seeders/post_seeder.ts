import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Post from '#models/post'
import Tag from '#models/tag'

export default class PostSeeder extends BaseSeeder {
  async run() {
    const alice = await User.findBy('email', 'alice@example.com')
    const bob = await User.findBy('email', 'bob@example.com')

    const tsTag = await Tag.findBy('slug', 'typescript')
    const jsTag = await Tag.findBy('slug', 'javascript')
    const webTag = await Tag.findBy('slug', 'web-development')
    const tutorialTag = await Tag.findBy('slug', 'tutorial')
    const ossTag = await Tag.findBy('slug', 'open-source')
    const backendTag = await Tag.findBy('slug', 'backend')
    if (!alice || !bob || !tsTag || !jsTag || !webTag || !tutorialTag || !ossTag || !backendTag) {
      console.info('[PostSeeder] Skipping: required users/tags were not found')
      return
    }

    const post1 = await Post.firstOrCreate(
      { title: 'Getting Started with AdonisJS and TypeScript' },
      {
        userId: alice.id,
        body: 'AdonisJS is a batteries-included Node.js framework that pairs beautifully with TypeScript. In this post, we explore how to scaffold a new project, configure strict type checking, and leverage the Lucid ORM to build robust APIs with confidence. Whether you are migrating from Express or starting fresh, AdonisJS provides a structured, opinionated foundation that eliminates boilerplate and lets you focus on business logic.',
      }
    )
    await post1.related('tags').sync([tsTag.id, webTag.id, tutorialTag.id], false)

    const post2 = await Post.firstOrCreate(
      { title: 'Why I Switched from REST to Inertia.js' },
      {
        userId: alice.id,
        body: 'Building SPAs with a traditional REST API introduces a lot of ceremony: serialisation contracts, client-side routing, loading states, and error boundaries. Inertia.js cuts through that complexity by treating your server-side framework as the router while React handles rendering. The result is a monolith that feels like an SPA — without the full API layer.',
      }
    )
    await post2.related('tags').sync([jsTag.id, webTag.id], false)

    const post3 = await Post.firstOrCreate(
      { title: 'Deep Dive into AdonisJS Lucid ORM' },
      {
        userId: bob.id,
        body: 'Lucid is the official ORM for AdonisJS. Under the hood it uses Knex as the query builder, adds an Active Record pattern on top, and ships with migrations, seeders, and factory utilities. This post covers relationships, eager loading strategies, query scopes, and the new v6 schema-driven approach for keeping your TypeScript types in sync with your database schema.',
      }
    )
    await post3.related('tags').sync([tsTag.id, backendTag.id, tutorialTag.id], false)

    const post4 = await Post.firstOrCreate(
      { title: "Contributing to Open Source: A Beginner's Guide" },
      {
        userId: bob.id,
        body: 'Open source contribution can feel intimidating at first. Where do you start? How do you pick an issue? What do maintainers really expect from a first PR? This guide walks through finding approachable repositories, understanding issue labels, writing a good commit message, and navigating code review as a newcomer.',
      }
    )
    await post4.related('tags').sync([ossTag.id, tutorialTag.id], false)

    const post5 = await Post.firstOrCreate(
      { title: 'Optimising Database Queries in Node.js Applications' },
      {
        userId: bob.id,
        body: 'Slow database queries are one of the most common performance bottlenecks in web applications. This post examines N+1 query problems, when to use eager loading vs lazy loading, how to interpret query execution plans, and practical techniques for indexing and query caching in a Knex/Lucid environment.',
      }
    )
    await post5.related('tags').sync([backendTag.id, jsTag.id], false)

    const post6 = await Post.firstOrCreate(
      { title: 'Building Type-Safe React Forms with Inertia' },
      {
        userId: alice.id,
        body: "Form handling in React tends to accumulate boilerplate quickly. Inertia's useForm hook solves the common cases elegantly: field binding, validation error display, submit loading state, and form reset. Combined with server-side validation from AdonisJS VineJS, you get end-to-end type safety with very little glue code.",
      }
    )
    await post6.related('tags').sync([tsTag.id, webTag.id, tutorialTag.id], false)
  }
}
