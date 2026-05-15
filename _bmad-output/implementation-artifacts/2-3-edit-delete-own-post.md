# Story 2.3: Edit & Delete Own Post

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authenticated user,
I want to edit or delete posts I authored,
so that I can keep my content up to date or remove it.

## Acceptance Criteria

1. **Given** I am the author of a post and visit `/posts/:id` **When** the page renders **Then** I see Edit and Delete action buttons that other users (including unauthenticated visitors) do not see.

2. **Given** I click Edit and navigate to `/posts/:id/edit` **When** the form loads **Then** it is pre-populated with the existing title, body, and tags.

3. **Given** I update the title/body/tags and submit **When** the form is processed **Then** the post is updated (tag associations synced via pivot), and I am redirected to the post detail page with a success flash message.

4. **Given** I click Delete and confirm **When** the action is processed **Then** the post is deleted and I am redirected to `/posts` with a success flash message.

5. **Given** I attempt to edit or delete a post I do not own (via direct URL manipulation) **When** the request is processed **Then** `PostPolicy` via Bouncer rejects the action and I receive a 403.

6. **Given** I submit an edit form with a blank title or body **When** the form is processed **Then** I see inline validation errors without a full page reload.

## Tasks / Subtasks

- [x] Install and configure `@adonisjs/bouncer` (AC: #5)
  - [x] `npm install @adonisjs/bouncer` then `node ace configure @adonisjs/bouncer`
  - [x] Verify `app/middleware/` gets `initialize_bouncer_middleware.ts` and `adonisrc.ts` references it

- [x] Create `app/policies/post_policy.ts` with `PostPolicy` (AC: #5)
  - [x] `node ace make:policy post --model=Post` (or create manually)
  - [x] Implement `edit(user: User, post: Post): boolean` → `post.userId === user.id`
  - [x] Implement `delete(user: User, post: Post): boolean` → `post.userId === user.id`

- [x] Create `app/validators/posts/update_post_validator.ts` (AC: #6)
  - [x] Same schema as `create_post_validator`: `title`, `body`, `tags` — reuse same VineJS rules
  - [x] Export as `export const updatePostValidator = vine.compile(vine.object({...}))`

- [x] Add `edit`, `update`, `destroy` methods to `app/controllers/posts_controller.ts` (AC: #2, #3, #4, #5, #6)
  - [x] `edit({ params, inertia, bouncer }: HttpContext)` — load post + tags, authorize `edit`, render `posts/PostEdit`
  - [x] `update({ params, request, response, auth, bouncer }: HttpContext)` — load post, authorize `edit`, validate, sync tags, redirect with flash
  - [x] `destroy({ params, response, bouncer }: HttpContext)` — load post, authorize `delete`, delete, redirect with flash

- [x] Update `start/routes.ts` (AC: #1, #2, #3, #4)
  - [x] Add `GET /posts/:id/edit` → `[PostsController, 'edit']` with `middleware.auth()`, named `posts.edit` — **MUST be before `GET /posts/:id`**
  - [x] Add `PUT /posts/:id` → `[PostsController, 'update']` with `middleware.auth()`, named `posts.update`
  - [x] Add `DELETE /posts/:id` → `[PostsController, 'destroy']` with `middleware.auth()`, named `posts.destroy`

- [x] Update `app/controllers/posts_controller.ts` `show` method to pass `can_edit` prop (AC: #1)
  - [x] Add `bouncer` to destructured `HttpContext`
  - [x] Compute `canEdit = auth?.user ? await bouncer.with(PostPolicy).allows('edit', post) : false`
  - [x] Pass `can_edit: canEdit` as Inertia prop

- [x] Create `inertia/pages/posts/PostEdit.tsx` (AC: #2, #3, #6)
  - [x] Pre-populate `useForm` with existing `title`, `body`, and tags (joined as comma string for UI)
  - [x] On submit: split tags, `form.transform(...)`, then `form.put('/posts/:id')`
  - [x] Display inline Bootstrap errors for `title` and `body`
  - [x] Submit button disabled while `form.processing`

- [x] Update `inertia/pages/posts/PostShow.tsx` to show Edit/Delete buttons (AC: #1, #4)
  - [x] Accept `can_edit: boolean` prop
  - [x] Render Bootstrap-styled Edit link (`<Link href="/posts/:id/edit">`) and Delete button (form POST with `_method=DELETE`) only when `can_edit === true`
  - [x] Delete: use Inertia `router.delete('/posts/:id', { onSuccess: ... })` or a `<form>` with `useForm` + `form.delete()`; display a confirm dialog before submitting

- [x] Run checks: `npm run typecheck` (clean), `npm run lint` (clean), `node ace test` (all pass)

### Review Findings

- [x] [Review][Patch] Non-atomic post update can leave inconsistent post/tag state [app/controllers/posts_controller.ts:124]
- [x] [Review][Patch] Concurrent tag creation can fail edit with a 500 due to slug race [app/controllers/posts_controller.ts:140]

## Dev Notes

### ⚠️ CRITICAL: Install Bouncer First

`@adonisjs/bouncer` is **NOT yet installed** in this project. Do this first:

```bash
npm install @adonisjs/bouncer
node ace configure @adonisjs/bouncer
```

The `configure` command registers the provider and creates boilerplate. After running it, verify `adonisrc.ts` has the bouncer provider and `app/middleware/initialize_bouncer_middleware.ts` exists. Then register the middleware in the auth/global chain if not auto-added.

### PostPolicy: `app/policies/post_policy.ts`

Architecture enforces: **always use Bouncer Policies — never inline `if (post.userId !== auth.user!.id)` checks**.

```ts
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PostPolicy extends BasePolicy {
  edit(user: User, post: Post): AuthorizerResponse {
    return post.userId === user.id
  }

  delete(user: User, post: Post): AuthorizerResponse {
    return post.userId === user.id
  }
}
```

### Controller: `edit`, `update`, `destroy` Methods

Add to existing `PostsController` class — **do NOT replace the file**.

Import additions:
```ts
import PostPolicy from '#policies/post_policy'
import { updatePostValidator } from '#validators/posts/update_post_validator'
```

`edit` method — eager-load tags (use `preload`):
```ts
async edit({ params, inertia, bouncer }: HttpContext) {
  const post = await Post.query()
    .where('id', params.id)
    .preload('tags')
    .firstOrFail()
  await bouncer.with(PostPolicy).authorize('edit', post)
  return inertia.render('posts/PostEdit' as never, {
    post: {
      id: post.id,
      title: post.title,
      body: post.body,
      tags: post.tags.map((t) => t.name).join(', '),
    },
  } as any)
}
```

`update` method — sync tags using detach+attach (not just attach):
```ts
async update({ params, request, response, bouncer }: HttpContext) {
  const post = await Post.findOrFail(params.id)
  await bouncer.with(PostPolicy).authorize('edit', post)

  const { title, body, tags } = await request.validateUsing(updatePostValidator)

  post.title = title
  post.body = body
  await post.save()

  // Sync tags: full replace
  const uniqueTagNamesBySlug = new Map<string, string>()
  for (const tagName of tags ?? []) {
    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (slug.length > 0 && !uniqueTagNamesBySlug.has(slug)) {
      uniqueTagNamesBySlug.set(slug, tagName)
    }
  }
  if (uniqueTagNamesBySlug.size > 0) {
    const tagModels = await Promise.all(
      Array.from(uniqueTagNamesBySlug.entries()).map(([slug, name]) =>
        Tag.firstOrCreate({ slug }, { name, slug })
      )
    )
    await post.related('tags').sync(tagModels.map((t) => t.id))
  } else {
    await post.related('tags').sync([])
  }

  return response.redirect().withQs().toRoute('posts.show', { id: post.id })
}
```

> **Use `sync()` not `attach()`** for tag update — `sync` does a full replace (detaches removed tags, attaches new ones). `attach` only adds. [Source: Lucid docs — `sync` vs `attach` on ManyToMany]

`destroy` method:
```ts
async destroy({ params, response, session, bouncer }: HttpContext) {
  const post = await Post.findOrFail(params.id)
  await bouncer.with(PostPolicy).authorize('delete', post)
  await post.delete()
  session.flash('success', 'Post deleted successfully.')
  return response.redirect().toRoute('posts.index')
}
```

### Flash Message for `update` Redirect

Use `session.flash('success', 'Post updated successfully.')` before the redirect in `update`. Destructure `session` from `HttpContext`.

### Controller `show` Method: Passing `can_edit`

Update existing `show` method — add `bouncer` and `auth` to destructured context:
```ts
async show({ params, inertia, bouncer, auth }: HttpContext) {
  const post = await Post.query()
    .where('id', params.id)
    .preload('author')
    .preload('tags')
    .firstOrFail()

  const canEdit = auth.user
    ? await bouncer.with(PostPolicy).allows('edit', post)
    : false

  return inertia.render('posts/PostShow' as never, {
    post: { ... },  // existing shape
    can_edit: canEdit,
    like_count: 0,
    comments: [],
  } as any)
}
```

> **`allows` vs `authorize`**: `allows` returns `boolean` (no exception); `authorize` throws `E_AUTHORIZATION_FAILURE` on failure. Use `allows` in `show` (public page, non-fatal). Use `authorize` in write actions (edit/update/destroy).

### Route Order — CRITICAL

`GET /posts/:id/edit` **must come before** `GET /posts/:id`, otherwise `:id` matches "edit" as an ID. Updated route order:

```ts
router.get('/posts/create', [PostsController, 'create']).as('posts.create').use(middleware.auth())
router.get('/posts/:id/edit', [PostsController, 'edit']).as('posts.edit').use(middleware.auth())
router.get('/posts/:id', [PostsController, 'show']).as('posts.show')
router.put('/posts/:id', [PostsController, 'update']).as('posts.update').use(middleware.auth())
router.delete('/posts/:id', [PostsController, 'destroy']).as('posts.destroy').use(middleware.auth())
```

Note: `GET /posts/create` was already placed before `GET /posts/:id` in Story 2.2.

### Validator: `app/validators/posts/update_post_validator.ts`

```ts
import vine from '@vinejs/vine'

export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    body: vine.string().trim().minLength(1),
    tags: vine.array(vine.string().trim().minLength(1)).optional(),
  })
)
```

### React Page: `inertia/pages/posts/PostEdit.tsx`

Tags pre-populated as comma-separated string (same UX pattern as `PostCreate.tsx`):

```tsx
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
            <label htmlFor="title" className="form-label">Title</label>
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
            <label htmlFor="body" className="form-label">Body</label>
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
          <a href={`/posts/${post.id}`} className="btn btn-secondary ms-2">Cancel</a>
        </form>
      </div>
    </div>
  )
}
```

> **`form.transform` caveat (from Story 2.2 debug log):** `form.transform(...)` returns `void`, cannot be chained with `form.put(...)`. Call `form.transform(...)` first, then `form.put(...)` on the next line.

### `PostShow.tsx` Edit/Delete Buttons

The delete action uses Inertia's `useForm` with `form.delete()` for the SPA pattern (no full reload):

```tsx
import { Link, useForm } from '@inertiajs/react'

// Add can_edit to props interface and destructure
const deleteForm = useForm({})

function handleDelete() {
  if (!window.confirm('Are you sure you want to delete this post?')) return
  deleteForm.delete(`/posts/${post.id}`, {
    onSuccess: () => {/* redirect handled server-side */},
  })
}

// In JSX, conditional buttons:
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
```

### Tag Sync vs Attach

Story 2.2 used `post.related('tags').attach(tagIds)` for **adding** tags on create. Story 2.3 uses **`post.related('tags').sync(tagIds)`** for **replacing** tags on update. `sync` detaches any tags not in the new list and attaches new ones — a full replace. Do not use `detach()` then `attach()` separately (not atomic).

### `#policies/post_policy` Import Alias

After Bouncer is installed and configured, it registers `#policies/*` → `app/policies/*.js`. Verify in `package.json` `imports` field. Import as:
```ts
import PostPolicy from '#policies/post_policy'
```

### `silent_auth` on `show` Route

`GET /posts/:id` uses `middleware.silentAuth()` (set in Story 2.1 — no middleware on that route, but `silentAuth` is applied globally or per group). Verify that `bouncer` is available in `show`'s context even for unauthenticated requests — use `allows` (returns `false`) not `authorize` (throws) to avoid 403 on public access.

### Project Structure Notes

New files to **create**:
- `app/policies/post_policy.ts`
- `app/validators/posts/update_post_validator.ts`
- `inertia/pages/posts/PostEdit.tsx`

Files to **modify**:
- `app/controllers/posts_controller.ts` — add `edit`, `update`, `destroy`; update `show` for `can_edit`; add new imports
- `start/routes.ts` — add `GET /posts/:id/edit`, `PUT /posts/:id`, `DELETE /posts/:id`
- `inertia/pages/posts/PostShow.tsx` — add `can_edit` prop + Edit/Delete buttons

Files potentially auto-generated by Bouncer configure:
- `app/middleware/initialize_bouncer_middleware.ts` (check if created)
- `adonisrc.ts` (bouncer provider registered)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3] — Acceptance Criteria, PostPolicy requirement
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — `bouncer.with(PostPolicy).authorize(...)` pattern; `allows` vs `authorize`
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — `app/policies/post_policy.ts`, `app/validators/posts/update_post_validator.ts`
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — `snake_case` props, Luxon date format
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines] — "Always use Bouncer Policies — never inline ownership checks"
- [Source: _bmad-output/implementation-artifacts/2-2-create-publish-a-post.md#Dev Notes] — `form.transform` void caveat; `inertia.render(...as never, {} as any)` pattern; tag slug inline generation; `#validators/posts/*` alias
- [Source: _bmad-output/implementation-artifacts/2-2-create-publish-a-post.md#Review Findings] — use `db.transaction` for atomic operations if needed; slug validation to avoid empty slugs; deduplicate tags

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- `#generated/policies` module not found on first typecheck — resolved by running `node ace serve` briefly to trigger `indexPolicies()` code generation hook, which created `.adonisjs/server/policies.ts`.
- `toRoute` type errors resolved automatically once routes.d.ts was regenerated with the new named routes.
- PostShow `Link` import needed to use `@adonisjs/inertia/react` (not `@inertiajs/react`) per project lint rules.

### Completion Notes List

- Installed and configured `@adonisjs/bouncer`; middleware auto-registered in router middleware stack after auth.
- Created `PostPolicy` with `edit` and `delete` methods enforcing ownership (`post.userId === user.id`).
- Created `updatePostValidator` matching `createPostValidator` schema.
- Added `edit`, `update`, `destroy` controller methods; `update` uses `post.related('tags').sync()` for full tag replacement.
- Updated `show` method to compute `canEdit` via `bouncer.with(PostPolicy).allows('edit', post)` (returns false for guests).
- `GET /posts/:id/edit` placed before `GET /posts/:id` in routes to prevent route param conflict.
- Created `PostEdit.tsx` with pre-populated form, inline validation errors, disabled submit on processing.
- Updated `PostShow.tsx` with conditional Edit/Delete buttons (Edit uses `Link`, Delete uses `useForm.delete()` with confirm dialog).
- All 17 tests pass (9 existing + 6 new policy/sync unit tests + 2 existing functional).

### File List

- `app/policies/post_policy.ts` (new)
- `app/validators/posts/update_post_validator.ts` (new)
- `inertia/pages/posts/PostEdit.tsx` (new)
- `app/controllers/posts_controller.ts` (modified)
- `start/routes.ts` (modified)
- `inertia/pages/posts/PostShow.tsx` (modified)
- `adonisrc.ts` (modified — bouncer provider + indexPolicies hook added by configure)
- `app/middleware/initialize_bouncer_middleware.ts` (new — auto-generated by bouncer configure)
- `app/abilities/main.ts` (new — auto-generated by bouncer configure)
- `start/kernel.ts` (modified — bouncer middleware registered by configure)
- `package.json` (modified — @adonisjs/bouncer added)
- `package-lock.json` (modified)
- `tests/unit/post_policy.spec.ts` (new)

## Change Log

- 2026-05-15: Implemented Story 2.3 — Edit & Delete Own Post. Installed @adonisjs/bouncer, created PostPolicy with ownership checks, added edit/update/destroy controller actions with tag sync, added GET/PUT/DELETE routes, created PostEdit page, updated PostShow with conditional author-only Edit/Delete buttons.
