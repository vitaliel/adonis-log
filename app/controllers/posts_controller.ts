import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ request, inertia }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
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
