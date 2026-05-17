import { useForm } from '@inertiajs/react'
import type { PageProps } from '~/types'

interface PostCreateProps extends PageProps {}

export default function PostCreate(_props: PostCreateProps) {
  const form = useForm({
    title: '',
    body: '',
    tags: '',
  })

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    const uniqueTags = [...new Set(dataToTags(form.data.tags))]

    form.transform((data) => ({
      title: data.title,
      body: data.body,
      tags: uniqueTags,
    }))
    form.post('/posts')
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h1 className="mb-4">Create Post</h1>
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
            {form.processing ? 'Publishing…' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  )
}

function dataToTags(tagsInput: string): string[] {
  return tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}
