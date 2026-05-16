import { Link } from '@adonisjs/inertia/react'
import { Pagination } from '~/components/Pagination'
import { TagBadge } from '~/components/TagBadge'
import { type PageProps, type PaginationMeta, type PostSummary } from '~/types'

interface SocialLink {
  id: number
  type: string
  url: string
}

interface UserProfileData {
  id: number
  username: string
  bio: string | null
  socialLinks: SocialLink[]
}

interface UserProfileProps extends PageProps {
  user: UserProfileData
  posts: PostSummary[]
  meta: PaginationMeta
}

export default function UserProfile({ user, posts, meta }: UserProfileProps) {
  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1">{user.username}</h1>

        {user.bio && <p className="text-muted">{user.bio}</p>}

        {user.socialLinks.length > 0 && (
          <div className="mb-2">
            {user.socialLinks.map((link) => {
              const safeHref = /^(https?:)\/\//i.test(link.url) ? link.url : '#'

              return (
                <a
                  key={link.id}
                  href={safeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary me-2 mb-1"
                >
                  {link.type}
                </a>
              )
            })}
          </div>
        )}
      </div>

      <h2 className="h5 mb-3">Posts by {user.username}</h2>

      {posts.length === 0 && <p className="text-muted">No posts yet.</p>}

      {posts.map((post) => (
        <article key={post.id} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title mb-1">
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h5>
            <p className="card-text text-muted small mb-2">
              By {post.author_username} | {post.created_at} | Like count: {post.like_count}
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
