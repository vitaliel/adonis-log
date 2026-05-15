import Tag from '#models/tag'
import type { HttpContext } from '@adonisjs/core/http'

export default class TagsController {
  async show({ params, request, inertia }: HttpContext) {
    const tag = await Tag.findByOrFail('slug', params.slug)
    const page = Number(request.input('page', 1)) || 1

    const posts = await tag
      .related('posts')
      .query()
      .preload('author')
      .preload('tags')
      .orderBy('created_at', 'desc')
      .paginate(page, 10)

    const serialized = posts.all().map((post) => ({
      id: post.id,
      title: post.title,
      author_username: post.author.username,
      created_at: post.createdAt.toFormat('MMM d, yyyy'),
      tags: post.tags.map((relatedTag) => ({ name: relatedTag.name, slug: relatedTag.slug })),
      like_count: 0,
    }))

    return inertia.render(
      'posts/PostIndex' as never,
      {
        posts: serialized,
        meta: posts.getMeta(),
        active_tag: tag.name,
      } as any
    )
  }
}
