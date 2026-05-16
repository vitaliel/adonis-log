import { useForm } from '@inertiajs/react'
import { type PageProps, type SocialLink } from '~/types'

interface UserEditData {
  id: number
  username: string
  bio: string | null
  socialLinks: SocialLink[]
}

interface UserEditProps extends PageProps {
  user: UserEditData
}

interface FormSocialLink {
  type: string
  url: string
}

export default function UserEdit({ user }: UserEditProps) {
  const form = useForm<{ bio: string; social_links: FormSocialLink[] }>({
    bio: user.bio ?? '',
    social_links: user.socialLinks.map((l) => ({ type: l.type, url: l.url })),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.put(`/users/${user.username}`)
  }

  function addLink() {
    form.setData('social_links', [...form.data.social_links, { type: '', url: '' }])
  }

  function removeLink(index: number) {
    form.setData(
      'social_links',
      form.data.social_links.filter((_, i) => i !== index)
    )
  }

  function updateLink(index: number, field: 'type' | 'url', value: string) {
    const updated = form.data.social_links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    )
    form.setData('social_links', updated)
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h1 className="mb-4">Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="bio" className="form-label">
              Bio <span className="text-muted">(optional)</span>
            </label>
            <textarea
              id="bio"
              className={`form-control ${form.errors.bio ? 'is-invalid' : ''}`}
              rows={4}
              value={form.data.bio}
              onChange={(e) => form.setData('bio', e.target.value)}
            />
            {form.errors.bio && <div className="invalid-feedback">{form.errors.bio}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Social Links</label>
            {form.data.social_links.map((link, index) => (
              <div key={index} className="row g-2 mb-2 align-items-start">
                <div className="col-4">
                  <input
                    type="text"
                    placeholder="Type (e.g. GitHub)"
                    className={`form-control ${(form.errors as Record<string, string>)[`social_links.${index}.type`] ? 'is-invalid' : ''}`}
                    value={link.type}
                    onChange={(e) => updateLink(index, 'type', e.target.value)}
                  />
                  {(form.errors as Record<string, string>)[`social_links.${index}.type`] && (
                    <div className="invalid-feedback">
                      {(form.errors as Record<string, string>)[`social_links.${index}.type`]}
                    </div>
                  )}
                </div>
                <div className="col-6">
                  <input
                    type="text"
                    placeholder="https://..."
                    className={`form-control ${(form.errors as Record<string, string>)[`social_links.${index}.url`] ? 'is-invalid' : ''}`}
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                  />
                  {(form.errors as Record<string, string>)[`social_links.${index}.url`] && (
                    <div className="invalid-feedback">
                      {(form.errors as Record<string, string>)[`social_links.${index}.url`]}
                    </div>
                  )}
                </div>
                <div className="col-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeLink(index)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addLink}>
              + Add Social Link
            </button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={form.processing}>
            {form.processing ? 'Saving…' : 'Save Profile'}
          </button>
          <a href={`/users/${user.username}`} className="btn btn-secondary ms-2">
            Cancel
          </a>
        </form>
      </div>
    </div>
  )
}
