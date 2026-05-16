import User from '#models/user'
import Post from '#models/post'
import UserSocialLink from '#models/user_social_link'
import UserPolicy from '#policies/user_policy'
import { updateProfileValidator } from '#validators/users/update_profile_validator'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class UsersController {
  async edit({ params, inertia, bouncer, response }: HttpContext) {
    const user = await User.query()
      .where('username', params.username)
      .preload('socialLinks')
      .firstOrFail()

    const canEdit = await bouncer.with(UserPolicy).allows('edit', user)
    if (!canEdit) {
      return response.redirect('/')
    }

    return inertia.render(
      'users/UserEdit' as never,
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
      } as any
    )
  }

  async update({ params, request, response, session, bouncer }: HttpContext) {
    const user = await User.query()
      .where('username', params.username)
      .preload('socialLinks')
      .firstOrFail()

    const canEdit = await bouncer.with(UserPolicy).allows('edit', user)
    if (!canEdit) {
      return response.redirect('/')
    }

    const { bio, social_links: socialLinks } = await request.validateUsing(updateProfileValidator)

    await db.transaction(async (trx) => {
      user.useTransaction(trx)

      if (bio !== undefined) {
        const normalizedBio = bio === null || bio.trim().length === 0 ? null : bio
        user.bio = normalizedBio
        await user.save()
      }

      if (socialLinks !== undefined) {
        await user.related('socialLinks').query().useTransaction(trx).delete()
        if (socialLinks.length > 0) {
          await UserSocialLink.createMany(
            socialLinks.map((link) => ({ userId: user.id, type: link.type, url: link.url })),
            { client: trx }
          )
        }
      }
    })

    session.flash('success', 'Profile updated successfully')
    return response.redirect(`/users/${user.username}`)
  }

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
      .orderBy('id', 'desc')
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
