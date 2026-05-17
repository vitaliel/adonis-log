import { Link } from '@adonisjs/inertia/react'
import { Pagination } from '~/components/Pagination'
import { TagBadge } from '~/components/TagBadge'
import { type PageProps, type PaginationMeta, type PostSummary } from '~/types'

interface PostIndexProps extends PageProps {
  posts: PostSummary[]
  meta: PaginationMeta
  active_tag?: string
}

export default function PostIndex({ posts, meta, active_tag, auth }: PostIndexProps) {
  return (
    <div>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">{active_tag ? `Posts tagged: ${active_tag}` : 'All Posts'}</h1>
        {auth?.user && (
          <Link href="/posts/create" className="btn btn-primary">
            New Post
          </Link>
        )}
      </div>

      {posts.length === 0 && <p className="text-muted">No posts yet.</p>}

      {posts.map((post) => (
        <article key={post.id} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title mb-1">
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h5>

            <p className="card-text text-muted small mb-2">
              By{' '}
              <Link
                href={`/users/${encodeURIComponent(post.author_username)}`}
                aria-label={`View ${post.author_username}'s profile`}
              >
                {post.author_username}
              </Link>{' '}
              | {post.created_at} | Like count: {post.like_count}
            </p>

            <div>
              {post.tags.map((tag) => (
                <TagBadge key={tag.slug} tag={tag} />
              ))}
            </div>
          </div>
        </article>
      ))}

      <Pagination meta={meta} />
    </div>
  )
}
