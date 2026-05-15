import { Link } from '@adonisjs/inertia/react'
import { useForm } from '@inertiajs/react'
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
  can_edit?: boolean
}

export default function PostShow({ post, comments = [], like_count = 0, can_edit = false }: PostShowProps) {
  const deleteForm = useForm({})

  function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    deleteForm.delete(`/posts/${post.id}`)
  }

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

      {can_edit && (
        <div className="mt-3">
          <Link href={`/posts/${post.id}/edit`} className="btn btn-sm btn-outline-secondary me-2">
            Edit
          </Link>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleDelete}
            disabled={deleteForm.processing}
          >
            {deleteForm.processing ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}

      <section className="mt-4">
        <h4>Comments ({comments.length})</h4>
      </section>
    </article>
  )
}
