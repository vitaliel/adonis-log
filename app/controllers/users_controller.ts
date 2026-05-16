import User from '#models/user'
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async show({ params, request, inertia }: HttpContext) {
    const user = await User.query()
      .where('username', params.username)
      .preload('socialLinks')
      .firstOrFail()

    const page = Math.max(1, Number.parseInt(String(request.input('page', 1)), 10) || 1)
    const posts = await Post.query()
      .where('userId', user.id)
      .preload('tags')
      .orderBy('created_at', 'desc')
      .paginate(page, 10)

    return inertia.render(
      'users/UserProfile' as never,
      {
        user: {
          id: user.id,
          username: user.username,
          bio: user.bio,
          socialLinks: user.socialLinks.map((link) => ({
            id: link.id,
            type: link.type,
            url: link.url,
          })),
        },
        posts: posts.all().map((post) => ({
          id: post.id,
          title: post.title,
          author_username: user.username,
          created_at: post.createdAt.toFormat('MMM d, yyyy'),
          tags: post.tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
          like_count: 0,
        })),
        meta: posts.getMeta(),
      } as any
    )
  }
}
