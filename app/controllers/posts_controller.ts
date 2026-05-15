import Post from '#models/post'
import Tag from '#models/tag'
import { createPostValidator } from '#validators/posts/create_post_validator'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class PostsController {
  async create({ inertia }: HttpContext) {
    return inertia.render('posts/PostCreate' as never, {} as any)
  }

  async store({ request, response, auth }: HttpContext) {
    const { title, body, tags } = await request.validateUsing(createPostValidator)
    const uniqueTagNamesBySlug = new Map<string, string>()

    for (const tagName of tags ?? []) {
      const slug = tagName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      if (slug.length > 0 && !uniqueTagNamesBySlug.has(slug)) {
        uniqueTagNamesBySlug.set(slug, tagName)
      }
    }

    const post = await db.transaction(async (trx) => {
      const createdPost = await Post.create({ userId: auth.user!.id, title, body }, { client: trx })

      if (uniqueTagNamesBySlug.size > 0) {
        const tagModels = await Promise.all(
          Array.from(uniqueTagNamesBySlug.entries()).map(([slug, name]) =>
            Tag.firstOrCreate({ slug }, { name, slug }, { client: trx })
          )
        )
        const tagIds = [...new Set(tagModels.map((tagModel) => tagModel.id))]
        await createdPost.related('tags').attach(tagIds, trx)
      }

      return createdPost
    })

    return response.redirect(`/posts/${post.id}`)
  }

  async index({ request, inertia }: HttpContext) {
    const page = Math.max(1, Number.parseInt(String(request.input('page', 1)), 10) || 1)
    const posts = await Post.query()
      .preload('author')
      .preload('tags')
      .orderBy('created_at', 'desc')
      .paginate(page, 10)

    const serialized = posts.all().map((post) => ({
      id: post.id,
      title: post.title,
      author_username: post.author.username,
      created_at: post.createdAt.toFormat('MMM d, yyyy'),
      tags: post.tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
      like_count: 0,
    }))

    return inertia.render(
      'posts/PostIndex' as never,
      {
        posts: serialized,
        meta: posts.getMeta(),
      } as any
    )
  }

  async show({ params, inertia }: HttpContext) {
    const post = await Post.query()
      .where('id', params.id)
      .preload('author')
      .preload('tags')
      .firstOrFail()

    return inertia.render(
      'posts/PostShow' as never,
      {
        post: {
          id: post.id,
          title: post.title,
          body: post.body,
          author_username: post.author.username,
          created_at: post.createdAt.toFormat('MMM d, yyyy'),
          tags: post.tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
          like_count: 0,
        },
        like_count: 0,
        comments: [],
      } as any
    )
  }
}
