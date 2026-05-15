# Story 2.2: Create & Publish a Post

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authenticated user,
I want to create a new post with a title, body, and tags,
so that I can share content with the community.

## Acceptance Criteria

1. **Given** I am logged in and visit `/posts/create` **When** the page loads **Then** I see a form with title, body (textarea), and a tags input field.

2. **Given** I fill in a valid title, body, and optionally add tags (new or existing), and submit **When** the form is processed **Then** my post is saved, any new tags are created (find-or-create by slug), existing tags are associated via the `post_tags` pivot, and I am redirected to the new post's detail page (`/posts/:id`).

3. **Given** I submit the form with a blank title or blank body **When** the form is processed **Then** I see field-level validation errors inline without a full page reload (VineJS + Inertia error surfacing).

4. **Given** I am not logged in and navigate to `/posts/create` **When** the request is processed **Then** I am redirected to `/login`.

5. **Given** I submit a valid form with tags **When** the tags are processed **Then** each tag is find-or-created by its slug (lowercased, slugified) and attached to the post via the `post_tags` pivot — no duplicate tags are created.

## Tasks / Subtasks

- [x] Add `create` and `store` methods to `app/controllers/posts_controller.ts` (AC: #1, #2, #3, #4, #5)
  - [x] `create({ inertia }: HttpContext)` — return `inertia.render('posts/PostCreate' as never, {} as any)`
  - [x] `store({ request, response, auth }: HttpContext)` — validate with `createPostValidator`, create `Post`, find-or-create tags (slugify), attach via `post.related('tags').attach(tagIds)`, redirect to `/posts/${post.id}`

- [x] Create `app/validators/posts/create_post_validator.ts` (AC: #3)
  - [x] `title: vine.string().trim().minLength(1).maxLength(255)`
  - [x] `body: vine.string().trim().minLength(1)`
  - [x] `tags: vine.array(vine.string().trim().minLength(1)).optional()`
  - [x] Export as `export const createPostValidator = vine.compile(vine.object({...}))`

- [x] Create `inertia/pages/posts/PostCreate.tsx` (AC: #1, #2, #3)
  - [x] Import `useForm` from `@inertiajs/react`; import `PageProps` from `~/types`
  - [x] Form state: `useForm({ title: '', body: '', tags: '' })` (tags as comma-separated string in UI, split before submit)
  - [x] Submit handler: split `tags` string on commas, trim each, filter empty, `form.transform(...).post('/posts')`
  - [x] Display `form.errors.title`, `form.errors.body` inline below each field
  - [x] Bootstrap form layout: `form-group`, `form-control`, `is-invalid` + `invalid-feedback` for errors
  - [x] Submit button disabled while `form.processing`

- [x] Update `start/routes.ts` (AC: #1, #2, #4)
  - [x] Add `GET /posts/create` → `[PostsController, 'create']` with `middleware.auth()`, named `posts.create` — **MUST be defined BEFORE `GET /posts/:id`** to avoid `:id` matching "create"
  - [x] Add `POST /posts` → `[PostsController, 'store']` with `middleware.auth()`, named `posts.store`

- [x] Run checks: `npm run typecheck` (clean), `npm run lint` (clean), `node ace test` (all pass)

### Review Findings

- [x] [Review][Patch] Duplicate input tags can trigger duplicate pivot inserts and fail post publish [app/controllers/posts_controller.ts:16]
- [x] [Review][Patch] Symbol-only tags can normalize to empty slug and cause invalid tag creation/failure [app/controllers/posts_controller.ts:19]
- [x] [Review][Patch] Post creation and tag attachment are non-atomic, allowing partial writes on downstream failure [app/controllers/posts_controller.ts:13]

## Dev Notes

### CRITICAL: Migrations and Models Already Exist (Story 2.1)

**DO NOT recreate these** — they were created in Story 2.1 and migrations are already applied:
- `database/migrations/*_create_posts_table.ts` ✅
- `database/migrations/*_create_tags_table.ts` ✅
- `database/migrations/*_create_post_tags_table.ts` ✅
- `app/models/post.ts` ✅
- `app/models/tag.ts` ✅

### Controller: Adding `create` and `store` to Existing `posts_controller.ts`

**DO NOT replace the existing file** — add the two new methods to `PostsController`:

```ts
// Add to existing PostsController class
async create({ inertia }: HttpContext) {
  return inertia.render('posts/PostCreate' as never, {} as any)
}

async store({ request, response, auth }: HttpContext) {
  const { title, body, tags } = await request.validateUsing(createPostValidator)

  const post = await Post.create({ userId: auth.user!.id, title, body })

  if (tags && tags.length > 0) {
    const tagModels = await Promise.all(
      tags.map(async (tagName) => {
        const slug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        return Tag.firstOrCreate({ slug }, { name: tagName, slug })
      })
    )
    await post.related('tags').attach(tagModels.map((t) => t.id))
  }

  return response.redirect(`/posts/${post.id}`)
}
```

**Import additions needed at top of `posts_controller.ts`:**
```ts
import Tag from '#models/tag'
import { createPostValidator } from '#validators/posts/create_post_validator'
```

### Validator: `app/validators/posts/create_post_validator.ts`

Create the `posts/` subdirectory under `app/validators/` (matches the `auth/` subdirectory pattern from Story 1):

```ts
import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    body: vine.string().trim().minLength(1),
    tags: vine.array(vine.string().trim().minLength(1)).optional(),
  })
)
```

### Route Order — CRITICAL

`GET /posts/create` **must come before** `GET /posts/:id`. If `:id` route is defined first, AdonisJS will try to match "create" as an ID parameter. Current route order in `start/routes.ts`:

```ts
// ✅ CORRECT order — create before :id
router.get('/posts/create', [PostsController, 'create']).as('posts.create').use(middleware.auth())
router.get('/posts', [PostsController, 'index']).as('posts.index')
router.get('/posts/:id', [PostsController, 'show']).as('posts.show')
router.post('/posts', [PostsController, 'store']).as('posts.store').use(middleware.auth())
```

### React Page: `inertia/pages/posts/PostCreate.tsx`

Tags are input as a single comma-separated string in the UI for simplicity, then split on submit:

```tsx
import { useForm } from '@inertiajs/react'
import type { PageProps } from '~/types'

interface PostCreateProps extends PageProps {}

export default function PostCreate(_props: PostCreateProps) {
  const form = useForm({
    title: '',
    body: '',
    tags: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const tagList = form.data.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    form.post('/posts', {
      data: { title: form.data.title, body: form.data.body, tags: tagList },
    })
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
```

### Inertia Validation Error Surfacing

VineJS throws `E_VALIDATION_ERROR` on invalid input. The Inertia middleware (`app/middleware/inertia_middleware.ts`) already shares validation errors under `errors` in the shared props — no extra wiring needed. `form.errors` in `useForm` automatically maps to per-field errors returned by VineJS.

### Inertia `render` Pattern

Follow the established pattern from Story 2.1 (workaround for Inertia page type inference):
```ts
return inertia.render('posts/PostCreate' as never, {} as any)
```

### Tag Slug Generation

No external slug library is used in this project. Inline slugification:
```ts
const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
```

`Tag.firstOrCreate({ slug }, { name: tagName, slug })` — Lucid `firstOrCreate` does a SELECT first; if not found, INSERTs. This is the correct idiomatic find-or-create pattern. No separate `findByOrFail` + `create` branching needed.

### Bouncer Policy NOT needed in this Story

`PostPolicy` (for edit/delete authorization) is deferred to Story 2.3. Story 2.2 only needs `middleware.auth()` at the route level — no Bouncer calls in the controller.

### Auth Middleware vs Silent Auth

- `GET /posts/create` and `POST /posts` → `middleware.auth()` (hard auth — unauthenticated users redirected to `/login`)
- `GET /posts` and `GET /posts/:id` → already use `middleware.silentAuth()` (set in Story 2.1)

### `#validators/posts/create_post_validator` Import Alias

AdonisJS path aliases are defined in `package.json` `imports` field. The `#validators/*` alias maps to `app/validators/*.js`. Create the validator at `app/validators/posts/create_post_validator.ts` and import as:
```ts
import { createPostValidator } from '#validators/posts/create_post_validator'
```
Check `package.json` `imports` to confirm the alias — if `#validators/*` maps to `./app/validators/*.js`, the nested `posts/` path resolves automatically.

### Post.create Pattern

```ts
const post = await Post.create({ userId: auth.user!.id, title, body })
```

`auth.user!` is safe here because `middleware.auth()` already guarantees the user is authenticated. `userId` is the `camelCase` model property (Lucid maps to `user_id` column automatically).

### Project Structure Notes

New files to **create**:
- `app/validators/posts/create_post_validator.ts`
- `inertia/pages/posts/PostCreate.tsx`

Files to **modify**:
- `app/controllers/posts_controller.ts` — add `create` and `store` methods + new imports
- `start/routes.ts` — add `GET /posts/create` (before `GET /posts/:id`) and `POST /posts`

Files **untouched**:
- All migration files (already run)
- `app/models/post.ts`, `app/models/tag.ts`
- `app/controllers/tags_controller.ts`
- All auth files, middleware, layout

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2] — Acceptance Criteria, tag find-or-create requirement
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — Tags: inline find-or-create on post form
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — validator file: `create_post_validator.ts`; page: `PostCreate.tsx`
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — auth middleware for write routes; eager load rule
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — VineJS E_VALIDATION_ERROR → Inertia shared errors
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — `app/validators/posts/`, `inertia/pages/posts/`
- [Source: _bmad-output/implementation-artifacts/2-1-post-list-post-detail-public-read.md#Dev Notes] — `inertia.render(...as never, {} as any)` pattern; models already exist; validator compile pattern

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- `form.post('/posts', { data: ... })` is not valid in `@inertiajs/react` — `UseFormSubmitOptions` does not include a `data` property. Used `form.transform(...)` then `form.post('/posts')` instead (transform returns void, cannot chain).

### Completion Notes List

- Added `create` and `store` methods to `PostsController`; added `Tag` and `createPostValidator` imports
- Created `app/validators/posts/create_post_validator.ts` with VineJS schema (title, body, tags optional)
- Created `inertia/pages/posts/PostCreate.tsx` with Bootstrap form, inline validation errors, tags comma-split via `form.transform()`
- Updated `start/routes.ts`: `GET /posts/create` placed before `GET /posts/:id` to prevent route collision; `POST /posts` added; both protected with `middleware.auth()`
- All 11 existing tests pass; typecheck clean; lint clean

### File List

- `app/validators/posts/create_post_validator.ts` (new)
- `inertia/pages/posts/PostCreate.tsx` (new)
- `app/controllers/posts_controller.ts` (modified)
- `start/routes.ts` (modified)

## Change Log

- 2026-05-15: Implemented Story 2.2 — Create & Publish a Post. Added create/store controller methods, VineJS validator, PostCreate React page with Bootstrap form and inline errors, updated routes with correct ordering.
