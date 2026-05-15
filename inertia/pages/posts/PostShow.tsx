import { TagBadge } from '~/components/TagBadge'
import { type PageProps, type PostDetail } from '~/types'

type CommentType = {
  id: number
  body: string
  author_username: string
  created_at: string
}

interface PostShowProps extends PageProps {
  post: PostDetail
  comments?: CommentType[]
  like_count?: number
}

export default function PostShow({ post, comments = [], like_count = 0 }: PostShowProps) {
  return (
    <article>
      <h1 className="mb-2">{post.title}</h1>
      <p className="text-muted small">
        By {post.author_username} | {post.created_at} | Like count: {like_count}
      </p>

      <div className="mb-3">
        {post.tags.map((tag) => (
          <TagBadge key={tag.slug} tag={tag} />
        ))}
      </div>

      <div className="mb-4" style={{ whiteSpace: 'pre-wrap' }}>
        {post.body}
      </div>

      <section className="mt-4">
        <h4>Comments ({comments.length})</h4>
      </section>
    </article>
  )
}
