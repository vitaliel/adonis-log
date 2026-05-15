import { useForm } from '@inertiajs/react'
import type { PageProps } from '~/types'

interface PostEditProps extends PageProps {
  post: { id: number; title: string; body: string; tags: string }
}

export default function PostEdit({ post }: PostEditProps) {
  const form = useForm({
    title: post.title,
    body: post.body,
    tags: post.tags,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const tagList = form.data.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    form.transform((data) => ({ ...data, tags: tagList }))
    form.put(`/posts/${post.id}`)
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h1 className="mb-4">Edit Post</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              id="title"
              type="text"
              className={`form-control ${form.errors.title ? 'is-invalid' : ''}`}
              value={form.data.title}
              onChange={(e) => form.setData('title', e.target.value)}
            />
            {form.errors.title && <div className="invalid-feedback">{form.errors.title}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="body" className="form-label">
              Body
            </label>
            <textarea
              id="body"
              className={`form-control ${form.errors.body ? 'is-invalid' : ''}`}
              rows={8}
              value={form.data.body}
              onChange={(e) => form.setData('body', e.target.value)}
            />
            {form.errors.body && <div className="invalid-feedback">{form.errors.body}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="tags" className="form-label">
              Tags <span className="text-muted">(comma-separated, optional)</span>
            </label>
            <input
              id="tags"
              type="text"
              className="form-control"
              placeholder="e.g. adonisjs, react, typescript"
              value={form.data.tags}
              onChange={(e) => form.setData('tags', e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={form.processing}>
            {form.processing ? 'Saving…' : 'Save Changes'}
          </button>
          <a href={`/posts/${post.id}`} className="btn btn-secondary ms-2">
            Cancel
          </a>
        </form>
      </div>
    </div>
  )
}
