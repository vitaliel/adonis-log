import { Link } from '@adonisjs/inertia/react'
import { useForm } from '@inertiajs/react'
import { TagBadge } from '~/components/TagBadge'
import { LikeButton } from '~/components/LikeButton'
import { type PageProps, type PostDetail, type Comment } from '~/types'

interface PostShowProps extends PageProps {
  post: PostDetail & { user_has_liked: boolean }
  comments?: Comment[]
  can_edit?: boolean
  is_authenticated?: boolean
}

export default function PostShow({
  post,
  comments = [],
  can_edit = false,
  is_authenticated = false,
}: PostShowProps) {
  const deletePostForm = useForm({})
  const deleteCommentForm = useForm({})
  const commentForm = useForm({ body: '' })

  function handleDeletePost() {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    deletePostForm.delete(`/posts/${post.id}`)
  }

  function handleDeleteComment(postId: number, commentId: number) {
    if (!window.confirm('Delete this comment?')) return
    deleteCommentForm.delete(`/posts/${postId}/comments/${commentId}`)
  }

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    commentForm.post(`/posts/${post.id}/comments`, {
      onSuccess: () => commentForm.reset(),
    })
  }

  return (
    <article>
      <h1 className="mb-2">{post.title}</h1>
      <p className="text-muted small">
        By {post.author_username} | {post.created_at}
      </p>
      <div className="mb-3">
        <LikeButton
          likeCount={post.like_count}
          userHasLiked={post.user_has_liked}
          likeUrl={`/posts/${post.id}/likes`}
          isAuthenticated={is_authenticated}
        />
      </div>

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
            onClick={handleDeletePost}
            disabled={deletePostForm.processing}
          >
            {deletePostForm.processing ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}

      <section className="mt-5">
        <h4>Comments ({comments.length})</h4>

        {comments.length === 0 && <p className="text-muted">No comments yet.</p>}

        {comments.map((comment) => (
          <div key={comment.id} className="card mb-3">
            <div className="card-body">
              <p className="mb-1">{comment.body}</p>
              <p className="text-muted small mb-0">
                {comment.author_username} · {comment.created_at}
              </p>
              <div className="mt-2 d-flex align-items-center gap-2">
                <LikeButton
                  likeCount={comment.like_count}
                  userHasLiked={comment.user_has_liked}
                  likeUrl={`/posts/${post.id}/comments/${comment.id}/likes`}
                  isAuthenticated={is_authenticated}
                />
                {comment.is_own && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteComment(post.id, comment.id)}
                    disabled={deleteCommentForm.processing}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4">
          {is_authenticated ? (
            <form onSubmit={handleCommentSubmit}>
              <div className="mb-3">
                <label htmlFor="comment-body" className="form-label fw-semibold">
                  Leave a comment
                </label>
                <textarea
                  id="comment-body"
                  className={`form-control ${commentForm.errors.body ? 'is-invalid' : ''}`}
                  rows={3}
                  value={commentForm.data.body}
                  onChange={(e) => commentForm.setData('body', e.target.value)}
                />
                {commentForm.errors.body && (
                  <div className="invalid-feedback">{commentForm.errors.body}</div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={commentForm.processing}
              >
                {commentForm.processing ? 'Posting…' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <p className="text-muted">
              <Link href="/login">Log in</Link> to leave a comment.
            </p>
          )}
        </div>
      </section>
    </article>
  )
}
