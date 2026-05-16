import Post from '#models/post'
import PostPolicy from '#policies/post_policy'
import Tag from '#models/tag'
import { createPostValidator } from '#validators/posts/create_post_validator'
import { updatePostValidator } from '#validators/posts/update_post_validator'
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

  async show({ params, inertia, bouncer, auth }: HttpContext) {
    const post = await Post.query()
      .where('id', params.id)
      .preload('author')
      .preload('tags')
      .preload('comments', (q) => q.preload('author').orderBy('created_at', 'asc'))
      .firstOrFail()

    const canEdit = auth.user ? await bouncer.with(PostPolicy).allows('edit', post) : false

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
        can_edit: canEdit,
        like_count: 0,
        is_authenticated: !!auth.user,
        comments: post.comments.map((c) => ({
          id: c.id,
          body: c.body,
          author_username: c.author.username,
          created_at: c.createdAt.toFormat('MMM d, yyyy'),
          is_own: auth.user ? c.userId === auth.user.id : false,
        })),
      } as any
    )
  }

  async edit({ params, inertia, bouncer }: HttpContext) {
    const post = await Post.query().where('id', params.id).preload('tags').firstOrFail()
    await bouncer.with(PostPolicy).authorize('edit', post)
    return inertia.render(
      'posts/PostEdit' as never,
      {
        post: {
          id: post.id,
          title: post.title,
          body: post.body,
          tags: post.tags.map((t) => t.name).join(', '),
        },
      } as any
    )
  }

  async update({ params, request, response, session, bouncer }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    await bouncer.with(PostPolicy).authorize('edit', post)

    const { title, body, tags } = await request.validateUsing(updatePostValidator)
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

    await db.transaction(async (trx) => {
      post.useTransaction(trx)
      post.title = title
      post.body = body
      await post.save()

      if (uniqueTagNamesBySlug.size > 0) {
        const tagEntries = Array.from(uniqueTagNamesBySlug.entries()).map(([slug, name]) => ({
          slug,
          name,
        }))
        await trx.table('tags').insert(tagEntries).onConflict('slug').ignore()

        const tagsToSync = await Tag.query({ client: trx })
          .whereIn(
            'slug',
            tagEntries.map((entry) => entry.slug)
          )
          .select('id')

        await post.related('tags').sync(tagsToSync.map((tag) => tag.id))
      } else {
        await post.related('tags').sync([])
      }
    })

    session.flash('success', 'Post updated successfully.')
    return response.redirect().toRoute('posts.show', { id: post.id })
  }

  async destroy({ params, response, session, bouncer }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    await bouncer.with(PostPolicy).authorize('delete', post)
    await post.delete()
    session.flash('success', 'Post deleted successfully.')
    return response.redirect().toRoute('posts.index')
  }
}
