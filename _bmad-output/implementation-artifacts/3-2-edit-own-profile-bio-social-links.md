# Story 3.2: Edit Own Profile (Bio & Social Links)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authenticated user,
I want to update my bio and add, update, or remove my social site links,
so that other users can learn about me and find me elsewhere online.

## Acceptance Criteria

1. **Given** I am logged in and visit `/users/:username/edit` for my own profile **When** the page loads **Then** I see a form pre-populated with my current bio and all existing social links (each row has `type` and `url` fields).

2. **Given** I update my bio and submit **When** the form is processed **Then** my bio is saved and I am redirected to my profile page (`/users/:username`) with a success flash message.

3. **Given** I add a social link with a valid type and URL and submit **When** the form is processed **Then** the link is saved to `user_social_links` and is visible on my profile page.

4. **Given** I update or remove an existing social link and submit **When** the form is processed **Then** the changes are persisted correctly (all existing links are replaced with the submitted set).

5. **Given** I submit the form with an invalid URL (or empty type) **When** the form is processed **Then** I see inline field-level validation errors without a full page reload (Inertia error surfacing via shared `errors` prop).

6. **Given** I attempt to navigate to `/users/:other_username/edit` **When** the request is processed **Then** I am redirected to `/` — I cannot edit another user's profile (Bouncer `UserPolicy.edit` returns `false`).

## Tasks / Subtasks

- [ ] Create `app/policies/user_policy.ts` with `UserPolicy` (AC: #6)
  - [ ] Extend `BasePolicy` from `@adonisjs/bouncer`
  - [ ] `edit(authUser: User, profile: User): AuthorizerResponse { return profile.id === authUser.id }`
  - [ ] Follow exact same shape as `app/policies/post_policy.ts`

- [ ] Create `app/validators/users/update_profile_validator.ts` (AC: #5)
  - [ ] `bio`: `vine.string().trim().maxLength(500).nullable().optional()`
  - [ ] `social_links`: `vine.array(vine.object({ type: vine.string().trim().minLength(1).maxLength(50), url: vine.string().trim().url().maxLength(500) })).optional()`
  - [ ] Use `vine.compile(vine.object({...}))` pattern — same as `update_post_validator.ts`

- [ ] Add `edit` and `update` methods to `app/controllers/users_controller.ts` (AC: #1–#6)
  - [ ] `edit({ params, inertia, bouncer }: HttpContext)`:
    - [ ] Find user by username: `User.query().where('username', params.username).preload('socialLinks').firstOrFail()`
    - [ ] `await bouncer.with(UserPolicy).authorize('edit', user)` — throws `E_AUTHORIZATION_FAILURE` → redirect
    - [ ] Return `inertia.render('users/UserEdit' as never, { user: { id, username, bio, socialLinks: [...] } } as any)`
  - [ ] `update({ params, request, response, session, bouncer }: HttpContext)`:
    - [ ] Find user by username: `User.query().where('username', params.username).preload('socialLinks').firstOrFail()`
    - [ ] `await bouncer.with(UserPolicy).authorize('edit', user)` — ownership check
    - [ ] `const { bio, social_links } = await request.validateUsing(updateProfileValidator)`
    - [ ] `user.bio = bio ?? null; await user.save()`
    - [ ] Replace social links: `await user.related('socialLinks').query().delete()` then re-create from `social_links` array
    - [ ] `session.flash('success', 'Profile updated successfully')`
    - [ ] `return response.redirect(`/users/${user.username}`)`

- [ ] Add routes to `start/routes.ts` (AC: #1, #6)
  - [ ] `router.get('/users/:username/edit', [UsersController, 'edit']).as('users.edit').use(middleware.auth())`
  - [ ] `router.put('/users/:username', [UsersController, 'update']).as('users.update').use(middleware.auth())`
  - [ ] Place immediately after `router.get('/users/:username', ...)` line

- [ ] Create `inertia/pages/users/UserEdit.tsx` (AC: #1–#5)
  - [ ] Props: `user: { id: number; username: string; bio: string | null; socialLinks: SocialLink[] }`
  - [ ] Use `useForm` from `@inertiajs/react` — same import as `PostEdit.tsx` (NOT from `@adonisjs/inertia/react`)
  - [ ] Initial form state: `{ bio: user.bio ?? '', social_links: user.socialLinks.map(l => ({ type: l.type, url: l.url })) }`
  - [ ] Dynamic social links: add row button (`+`), remove row button (`×`) per row
  - [ ] `handleSubmit`: `e.preventDefault(); form.put(`/users/${user.username}`)`
  - [ ] Inline validation: `form.errors['social_links.0.url']` pattern for nested errors
  - [ ] Cancel link: `<a href={`/users/${user.username}`}>` using plain anchor (public route)
  - [ ] `import { type PageProps, type SocialLink } from '~/types'` — reuse existing `SocialLink` interface

- [ ] Run checks: `npm run typecheck` (clean), `npm run lint` (clean), `node ace test` (all pass)

## Dev Notes

### UserPolicy: `app/policies/user_policy.ts`

```ts
import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  edit(authUser: User, profile: User): AuthorizerResponse {
    return profile.id === authUser.id
  }
}
```

> **Pattern:** Exact copy of `PostPolicy` shape. Bouncer calls `authorize` which throws `E_AUTHORIZATION_FAILURE` (→ 403/redirect) when `edit()` returns `false`. The `auth` middleware on the route already ensures `authUser` is present.

### Validator: `app/validators/users/update_profile_validator.ts`

```ts
import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    bio: vine.string().trim().maxLength(500).nullable().optional(),
    social_links: vine
      .array(
        vine.object({
          type: vine.string().trim().minLength(1).maxLength(50),
          url: vine.string().trim().url().maxLength(500),
        })
      )
      .optional(),
  })
)
```

> **`nullable().optional()`**: Allows bio to be `null` (user clearing it) or omitted entirely.
> **`snake_case` field name `social_links`**: Matches architecture prop naming convention (snake_case from controller → frontend).

### Controller additions to `app/controllers/users_controller.ts`

Add imports at top:
```ts
import UserPolicy from '#policies/user_policy'
import { updateProfileValidator } from '#validators/users/update_profile_validator'
import UserSocialLink from '#models/user_social_link'
```

Add `edit` method:
```ts
async edit({ params, inertia, bouncer }: HttpContext) {
  const user = await User.query()
    .where('username', params.username)
    .preload('socialLinks')
    .firstOrFail()

  await bouncer.with(UserPolicy).authorize('edit', user)

  return inertia.render('users/UserEdit' as never, {
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
  } as any)
}
```

Add `update` method:
```ts
async update({ params, request, response, session, bouncer }: HttpContext) {
  const user = await User.query()
    .where('username', params.username)
    .preload('socialLinks')
    .firstOrFail()

  await bouncer.with(UserPolicy).authorize('edit', user)

  const { bio, social_links } = await request.validateUsing(updateProfileValidator)

  user.bio = bio ?? null
  await user.save()

  await user.related('socialLinks').query().delete()
  if (social_links && social_links.length > 0) {
    await UserSocialLink.createMany(
      social_links.map((link) => ({ userId: user.id, type: link.type, url: link.url }))
    )
  }

  session.flash('success', 'Profile updated successfully')
  return response.redirect(`/users/${user.username}`)
}
```

> **Replace-all social links strategy:** Delete all existing records then re-create from submitted array. Simpler and correct for this feature scope. Story 4.x does not depend on link IDs being stable.
> **`UserSocialLink.createMany`**: Batch insert — more efficient than individual `create()` calls. Uses same `userId` pattern established in Story 3.1.

### Routes addition in `start/routes.ts`

After the existing `router.get('/users/:username', ...)` line, add:

```ts
router.get('/users/:username/edit', [UsersController, 'edit']).as('users.edit').use(middleware.auth())
router.put('/users/:username', [UsersController, 'update']).as('users.update').use(middleware.auth())
```

> **Route order matters**: AdonisJS matches routes top-to-bottom. `/users/:username/edit` MUST be registered before `/users/:username` (param route) to avoid the `edit` segment being swallowed as a username. Currently `GET /users/:username` is already last — add edit/update after it and they will be checked first since they have more specific paths. Actually, `/users/:username/edit` has a longer path and distinct segment so it is unambiguous — no ordering risk. Still, place them grouped together for readability.

### React Page: `inertia/pages/users/UserEdit.tsx`

```tsx
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
```

> **`useForm` import**: `@inertiajs/react` — NOT `@adonisjs/inertia/react`. `useForm` is Inertia's hook; the `@adonisjs/inertia/react` package only exports `Link` (and re-exports some Inertia internals). `PostEdit.tsx` confirms this pattern.
> **Nested error keys**: VineJS surfaces array errors as `social_links.0.url`, `social_links.1.type` etc. Cast `form.errors` to `Record<string, string>` to access by dynamic key.
> **Cancel link**: Plain `<a href=...>` — this is a navigation to a public route, no Inertia `Link` needed (either works, but `<a>` is simpler).

### Project Structure Notes

New files to **create**:
- `app/policies/user_policy.ts`
- `app/validators/users/update_profile_validator.ts` (create `app/validators/users/` folder — `auth/` and `posts/` already exist)
- `inertia/pages/users/UserEdit.tsx`

Files to **modify**:
- `app/controllers/users_controller.ts` — add `edit` and `update` methods + 3 imports
- `start/routes.ts` — add 2 new routes

Files **not to touch**:
- `app/models/user.ts` — `socialLinks` hasMany already added in Story 3.1
- `app/models/user_social_link.ts` — already exists from Story 3.1
- `inertia/types.ts` — `SocialLink` and `UserProfile` interfaces already exist
- `database/migrations/` — no new migration needed (schema unchanged)

### Key Patterns from Previous Stories

- **`inertia.render('...' as never, {...} as any)`** — established TS cast pattern (Stories 2.2, 2.3, 3.1). Required for Tuyau strict types.
- **`useForm` from `@inertiajs/react`** — used in `PostEdit.tsx`. `form.put(url)` submits PUT.
- **`bouncer.with(Policy).authorize('action', resource)`** — throws `E_AUTHORIZATION_FAILURE` on failure, auto-handled as 403. Pattern confirmed in `posts_controller.ts` lines 104, 120, 166.
- **`session.flash('success', '...')`** — flash message pattern used in `PostsController.update`. Surfaced via `flash.success` in Inertia shared data → toast notification via `sonner`.
- **No `@inertiajs/react` Link** — `Link` from `@adonisjs/inertia/react` for navigation; `useForm` from `@inertiajs/react` for forms.
- **`snake_case` props** — controller passes `social_links` (snake_case) matching architecture mandate. VineJS field name `social_links` matches.
- **Dates pre-formatted in controller** — not applicable here (no date display), but remember for any future timestamp rendering.
- **Bouncer Policies only** — never inline `if (user.id !== auth.user!.id)` checks.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2] — Acceptance Criteria, edit profile requirements
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — `update_profile_validator.ts` path, social_links validator structure
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security] — Bouncer Policies, UserPolicy pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — `users_controller.ts` edit/update, `UserEdit.tsx` page, `user_policy.ts`
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines] — Always use Bouncer Policies, snake_case props, pre-format dates in controller
- [Source: _bmad-output/implementation-artifacts/3-1-public-user-profile-page.md] — UserSocialLink model, socialLinks relation, SocialLink type already in types.ts
- [Source: app/policies/post_policy.ts] — Bouncer Policy shape to replicate for UserPolicy
- [Source: app/controllers/posts_controller.ts] — `bouncer.with(Policy).authorize()` + `session.flash` + `response.redirect` patterns
- [Source: inertia/pages/posts/PostEdit.tsx] — `useForm` from `@inertiajs/react`, `form.put()`, inline error display pattern

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
