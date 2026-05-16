# Story 4.1: Comments on Posts

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to read comments on any post and post my own comments when logged in,
so that I can engage in discussion around content.

## Acceptance Criteria

1. **Given** I visit any post detail page at `/posts/:id` **When** the page loads **Then** I see all comments in chronological order, each showing author username, formatted date, and comment body — loaded via Lucid eager loading (no N+1 queries).

2. **Given** I am logged in and submit a non-empty comment on a post **When** the form is processed **Then** my comment is saved and the page reloads (via Inertia redirect) showing my new comment at the end of the list.

3. **Given** I submit an empty comment **When** the form is processed **Then** I see an inline validation error without a full page reload (Inertia `errors` shared prop via VineJS `E_VALIDATION_ERROR`).

4. **Given** I am not logged in **When** I view the comments section **Then** I see existing comments but the comment form is not shown (show a "Log in to comment" prompt instead).

5. **Given** I am not logged in and attempt to POST to the comments endpoint directly **When** the request is processed **Then** I am redirected to `/login` by `auth_middleware`.

6. **Given** I am the author of a comment **When** I view the post detail page **Then** I see a Delete button on my comment that other users do not see.

7. **Given** I click Delete on my own comment **When** the action is processed **Then** the comment is deleted and the page refreshes with the comment removed.

8. **Given** I attempt to delete a comment I do not own (via direct request) **When** the request is processed **Then** `CommentPolicy` via Bouncer rejects the action with a 403.

## Tasks / Subtasks

- [x] Create migration `database/migrations/TIMESTAMP_create_comments_table.ts` (AC: #1, #2)
  - [x] `post_id` integer NOT NULL (FK → `posts.id` on delete cascade)
  - [x] `user_id` integer NOT NULL (FK → `users.id`)
  - [x] `body` text NOT NULL
  - [x] `created_at` / `updated_at` timestamps
  - [x] Run `node ace migration:run`

- [x] Create `app/models/comment.ts` (AC: #1, #2, #6, #7)
  - [x] Extend `BaseModel`; `@column({ isPrimary: true }) declare id: number`
  - [x] `@column() declare postId: number`
  - [x] `@column() declare userId: number`
  - [x] `@column() declare body: string`
  - [x] `@column.dateTime({ autoCreate: true }) declare createdAt: DateTime`
  - [x] `@column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime`
  - [x] `@belongsTo(() => User, { foreignKey: 'userId' }) declare author: BelongsTo<typeof User>`
  - [x] `@belongsTo(() => Post, { foreignKey: 'postId' }) declare post: BelongsTo<typeof Post>`

- [x] Add `hasMany(() => Comment)` to `app/models/post.ts` (AC: #1)
  - [x] Import `Comment` and `HasMany` — add `@hasMany(() => Comment, { foreignKey: 'postId' }) declare comments: HasMany<typeof Comment>`

- [x] Create `app/validators/comments/create_comment_validator.ts` (AC: #3)
  - [x] `body: vine.string().trim().minLength(1).maxLength(5000)` — validates non-empty
  - [x] Use `vine.compile(vine.object({...}))` pattern same as other validators

- [x] Create `app/policies/comment_policy.ts` (AC: #8)
  - [x] Extend `BasePolicy`; `delete(user: User, comment: Comment): AuthorizerResponse { return comment.userId === user.id }`
  - [x] Follow exact same shape as `PostPolicy`

- [x] Create `app/controllers/comments_controller.ts` (AC: #2–#8)
  - [x] `store({ params, request, response, auth }: HttpContext)`:
    - [x] `const post = await Post.findOrFail(params.postId)` — 404 if post not found
    - [x] `const { body } = await request.validateUsing(createCommentValidator)` — VineJS throws `E_VALIDATION_ERROR` on failure → Inertia surfaces inline errors
    - [x] `await Comment.create({ postId: post.id, userId: auth.user!.id, body })`
    - [x] `return response.redirect(`/posts/${post.id}`)`
  - [x] `destroy({ params, response, bouncer }: HttpContext)`:
    - [x] `const comment = await Comment.findOrFail(params.id)`
    - [x] `await bouncer.with(CommentPolicy).authorize('delete', comment)` — 403 on failure
    - [x] `await comment.delete()`
    - [x] `return response.redirect(`/posts/${comment.postId}`)`

- [x] Add routes to `start/routes.ts` (AC: #2, #5, #7, #8)
  - [x] `const CommentsController = () => import('#controllers/comments_controller')`
  - [x] `router.post('/posts/:postId/comments', [CommentsController, 'store']).as('comments.store').use(middleware.auth())`
  - [x] `router.delete('/posts/:postId/comments/:id', [CommentsController, 'destroy']).as('comments.destroy').use(middleware.auth())`
  - [x] Add routes after the existing posts routes block

- [x] Update `app/controllers/posts_controller.ts` show() (AC: #1, #6)
  - [x] Add `Comment` import: `import Comment from '#models/comment'`
  - [x] Add `.preload('comments', (q) => q.preload('author').orderBy('created_at', 'asc'))` to the post query
  - [x] Map comments in the rendered props:
    ```ts
    comments: post.comments.map((c) => ({
      id: c.id,
      body: c.body,
      author_username: c.author.username,
      created_at: c.createdAt.toFormat('MMM d, yyyy'),
      is_own: auth.user ? c.userId === auth.user.id : false,
    }))
    ```
  - [x] Pass `is_authenticated: !!auth.user` in the render props

- [x] Update `inertia/types.ts` — add `Comment` type
  - [x] Add: `export interface Comment { id: number; body: string; author_username: string; created_at: string; is_own: boolean }`
  - [x] Update `PostShowProps` or add to the page component types

- [x] Update `inertia/pages/posts/PostShow.tsx` (AC: #1–#7)
  - [x] Import `Comment` type from `~/types`; import `useForm` from `@inertiajs/react`
  - [x] Add `is_authenticated?: boolean` to props
  - [x] Render full comments section: list each comment (body, author, date, delete button if `c.is_own`)
  - [x] Delete form: `useForm({})` → `form.delete(`/posts/${post.id}/comments/${c.id}`)` with confirm dialog
  - [x] Comment submission form (only if `is_authenticated`): `useForm({ body: '' })` → `form.post(`/posts/${post.id}/comments`)` with inline `form.errors.body` display
  - [x] If not authenticated: show `<p>...</p>` prompt to log in instead of form

- [x] Run checks: `npm run typecheck` (clean), `npm run lint` (clean), `node ace test` (all pass)

## Dev Notes

### Migration: `database/migrations/TIMESTAMP_create_comments_table.ts`

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE')
      table.integer('user_id').notNullable().references('id').inTable('users')
      table.text('body').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

> **`onDelete('CASCADE')`**: Deleting a post automatically removes its comments. Required for data integrity.

### Model: `app/models/comment.ts`

```ts
import User from '#models/user'
import Post from '#models/post'
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare postId: number

  @column()
  declare userId: number

  @column()
  declare body: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare author: BelongsTo<typeof User>

  @belongsTo(() => Post, { foreignKey: 'postId' })
  declare post: BelongsTo<typeof Post>
}
```

### Post model update: `app/models/post.ts`

Add at the top of imports:
```ts
import Comment from '#models/comment'
import type { HasMany } from '@adonisjs/lucid/types/relations'
```

Add relation after `tags`:
```ts
@hasMany(() => Comment, { foreignKey: 'postId' })
declare comments: HasMany<typeof Comment>
```

> **Import cycle note**: `Comment` imports `Post`, `Post` imports `Comment`. AdonisJS Lucid uses lazy relation functions `() => Comment` so this circular reference is safe — no import-time circular dependency.

### Validator: `app/validators/comments/create_comment_validator.ts`

```ts
import vine from '@vinejs/vine'

export const createCommentValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1).maxLength(5000),
  })
)
```

> **`minLength(1)` after `.trim()`**: Prevents whitespace-only comments. VineJS trims first, then validates length.

### Policy: `app/policies/comment_policy.ts`

```ts
import type Comment from '#models/comment'
import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class CommentPolicy extends BasePolicy {
  delete(user: User, comment: Comment): AuthorizerResponse {
    return comment.userId === user.id
  }
}
```

> **Pattern**: Exact copy of `PostPolicy` shape with `delete` (not `edit`).

### Controller: `app/controllers/comments_controller.ts`

```ts
import Post from '#models/post'
import Comment from '#models/comment'
import CommentPolicy from '#policies/comment_policy'
import { createCommentValidator } from '#validators/comments/create_comment_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  async store({ params, request, response, auth }: HttpContext) {
    const post = await Post.findOrFail(params.postId)
    const { body } = await request.validateUsing(createCommentValidator)
    await Comment.create({ postId: post.id, userId: auth.user!.id, body })
    return response.redirect(`/posts/${post.id}`)
  }

  async destroy({ params, response, bouncer }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    await bouncer.with(CommentPolicy).authorize('delete', comment)
    await comment.delete()
    return response.redirect(`/posts/${comment.postId}`)
  }
}
```

> **`auth.user!.id`**: Safe — route has `middleware.auth()` so user is guaranteed non-null.
> **`comment.postId`**: Available directly from the model without an extra DB query for redirect.
> **VineJS error handling**: `E_VALIDATION_ERROR` is automatically caught by the Inertia exception handler → surfaces `errors` in shared Inertia props → React component reads `form.errors.body`.

### PostsController `show()` update

Replace the existing `show()` method body. Add `Comment` import at top of file:
```ts
import Comment from '#models/comment'
```

Update the post query:
```ts
async show({ params, inertia, bouncer, auth }: HttpContext) {
  const post = await Post.query()
    .where('id', params.id)
    .preload('author')
    .preload('tags')
    .preload('comments', (q) => q.preload('author').orderBy('created_at', 'asc'))
    .firstOrFail()

  const canEdit = auth.user ? await bouncer.with(PostPolicy).allows('edit', post) : false

  return inertia.render(
    'posts/PostShow' as never,
    {
      post: {
        id: post.id,
        title: post.title,
        body: post.body,
        author_username: post.author.username,
        created_at: post.createdAt.toFormat('MMM d, yyyy'),
        tags: post.tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
        like_count: 0,
      },
      can_edit: canEdit,
      like_count: 0,
      is_authenticated: !!auth.user,
      comments: post.comments.map((c) => ({
        id: c.id,
        body: c.body,
        author_username: c.author.username,
        created_at: c.createdAt.toFormat('MMM d, yyyy'),
        is_own: auth.user ? c.userId === auth.user.id : false,
      })),
    } as any
  )
}
```

> **`orderBy('created_at', 'asc')`**: Chronological order per AC #1 — oldest first.
> **`is_own`** computed server-side: avoids sending `userId` to the client; React just reads the boolean.
> **`Comment` import not in current `posts_controller.ts`**: No existing Comment model yet — this is a new import. The `Comment` model is created in this story.

### Routes addition in `start/routes.ts`

Add at the top with other controller imports:
```ts
const CommentsController = () => import('#controllers/comments_controller')
```

Add after the existing posts routes (before tags routes):
```ts
router
  .post('/posts/:postId/comments', [CommentsController, 'store'])
  .as('comments.store')
  .use(middleware.auth())

router
  .delete('/posts/:postId/comments/:id', [CommentsController, 'destroy'])
  .as('comments.destroy')
  .use(middleware.auth())
```

### Types update: `inertia/types.ts`

Add after `PostDetail`:
```ts
export interface Comment {
  id: number
  body: string
  author_username: string
  created_at: string
  is_own: boolean
}
```

### React Page: `inertia/pages/posts/PostShow.tsx`

The existing `PostShow.tsx` already has a basic skeleton with `CommentType` defined inline and a placeholder `<section>` for comments. Replace it entirely:

```tsx
import { Link } from '@adonisjs/inertia/react'
import { useForm } from '@inertiajs/react'
import { TagBadge } from '~/components/TagBadge'
import { type PageProps, type PostDetail, type Comment } from '~/types'

interface PostShowProps extends PageProps {
  post: PostDetail
  comments?: Comment[]
  like_count?: number
  can_edit?: boolean
  is_authenticated?: boolean
}

export default function PostShow({
  post,
  comments = [],
  like_count = 0,
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
              {comment.is_own && (
                <button
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={() => handleDeleteComment(post.id, comment.id)}
                  disabled={deleteCommentForm.processing}
                >
                  Delete
                </button>
              )}
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
```

> **`useForm({ body: '' })`**: Inertia's `useForm` from `@inertiajs/react` (NOT `@adonisjs/inertia/react`).
> **`form.post(url, { onSuccess: () => form.reset() })`**: After successful POST (redirect from controller), Inertia's `onSuccess` callback resets the form so textarea is cleared.
> **`deleteCommentForm`** is a separate `useForm({})` — shared across all delete buttons. Only one can be in-flight at a time.
> **Error display**: `commentForm.errors.body` surfaces VineJS `body` field error via Inertia's shared `errors` mechanism — no custom wiring needed.

### Project Structure Notes

New files to **create**:
- `database/migrations/TIMESTAMP_create_comments_table.ts` — use `node ace make:migration create_comments_table`
- `app/models/comment.ts`
- `app/validators/comments/create_comment_validator.ts` (create `app/validators/comments/` folder)
- `app/policies/comment_policy.ts`
- `app/controllers/comments_controller.ts`

Files to **modify**:
- `app/models/post.ts` — add `hasMany(() => Comment)` relation + Comment import
- `app/controllers/posts_controller.ts` — update `show()` to preload comments + add `Comment` import
- `start/routes.ts` — add `CommentsController` import + 2 new routes
- `inertia/types.ts` — add `Comment` interface
- `inertia/pages/posts/PostShow.tsx` — full replacement with comments section + form

Files **not to touch**:
- `app/models/user.ts` — no User model changes needed (comments accessed via Post relationship)
- `database/migrations/*` — do not alter existing migrations
- Other controllers, validators, policies

### Key Patterns from Previous Stories

- **`inertia.render('...' as never, {...} as any)`** — required TS cast. Do NOT remove `as any`.
- **`useForm` from `@inertiajs/react`** — NOT `@adonisjs/inertia/react`. Established in PostEdit.tsx and UserEdit.tsx.
- **`form.delete(url)`** — Inertia's useForm DELETE submission. Used in PostEdit and UserEdit patterns.
- **Bouncer**: `bouncer.with(CommentPolicy).authorize('delete', comment)` — throws `E_AUTHORIZATION_FAILURE` → auto-handled as 403.
- **Date pre-formatting in controller**: `c.createdAt.toFormat('MMM d, yyyy')` — never pass raw timestamps to React.
- **`snake_case` prop keys** from controller: `author_username`, `created_at`, `is_own`, `is_authenticated`.
- **`vine.string().trim().minLength(1)`** — trim before minLength check prevents whitespace-only inputs. Same pattern used in auth validators.
- **No inline ownership checks** — always Bouncer Policies.

### Important: No Existing Comment or PostLike Models

Story 4.1 creates `Comment` model and `CommentPolicy` from scratch. There is NO existing comment infrastructure. The migration must be run before any test can pass. Check that `node ace migration:run` succeeds before running tests.

### Epic 2 Note on PostShow.tsx

From Epic 2 story notes: "The `PostShow.tsx` component should accept optional `comments` and `like_count` props defaulting to empty/0 so Epic 4 can enrich it without structural changes." The current `PostShow.tsx` already has this scaffold (empty comments array, like_count = 0) — Story 4.1 fulfills that promise. Replace the entire component with the full implementation above.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1] — All acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — `comments` table schema, `CommentPolicy`, route patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — `snake_case` DB columns, `camelCase` model props, route pattern `/posts/:postId/comments`
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines] — Bouncer Policies, eager loading, snake_case props, date format
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — Auth & Ownership pattern, Like Toggle pattern (for reference)
- [Source: app/policies/post_policy.ts] — CommentPolicy shape to replicate
- [Source: app/controllers/posts_controller.ts] — `show()` method to update, `inertia.render` TS cast pattern
- [Source: app/validators/posts/create_post_validator.ts] — Validator pattern to follow
- [Source: inertia/pages/posts/PostEdit.tsx] — `useForm` import, form submission patterns
- [Source: _bmad-output/implementation-artifacts/3-2-edit-own-profile-bio-social-links.md#Dev Notes] — `useForm`, Bouncer, route, VineJS patterns established in previous stories

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4.6)

### Debug Log References

- Removed unused `Comment` import from `posts_controller.ts` — TypeScript `TS6133` error; the ORM relation on the post model provides typing without a direct import.
- Auto-generated `database/schema.ts` had a Prettier formatting issue (pre-existing) — fixed via `npm run lint -- --fix`.

### Completion Notes List

- ✅ Created `database/migrations/1778943387923_create_comments_table.ts` with `post_id` FK (CASCADE), `user_id` FK, `body` text, and timestamps. Migration ran successfully.
- ✅ Created `app/models/comment.ts` with full Lucid model: `belongsTo` relations to `User` (author) and `Post`.
- ✅ Updated `app/models/post.ts` to add `hasMany(() => Comment)` relation.
- ✅ Created `app/validators/comments/create_comment_validator.ts` with `trim().minLength(1).maxLength(5000)`.
- ✅ Created `app/policies/comment_policy.ts` mirroring `PostPolicy` shape — `delete` checks `userId === user.id`.
- ✅ Created `app/controllers/comments_controller.ts` with `store` and `destroy` actions.
- ✅ Added comment routes to `start/routes.ts` with `auth` middleware.
- ✅ Updated `posts_controller.ts` `show()` to preload comments (with author) ordered chronologically; passes `is_authenticated` and `comments` array (with `is_own`) to React.
- ✅ Added `Comment` interface to `inertia/types.ts`.
- ✅ Replaced `PostShow.tsx` with full comments section: list, delete (own only), submit form (authenticated only), "Log in to comment" prompt for guests.
- ✅ All quality gates passed: `npm run typecheck` clean, `npm run lint` clean, `node ace test` — 22/22 passed.

### File List

database/migrations/1778943387923_create_comments_table.ts
app/models/comment.ts
app/models/post.ts
app/validators/comments/create_comment_validator.ts
app/policies/comment_policy.ts
app/controllers/comments_controller.ts
app/controllers/posts_controller.ts
start/routes.ts
inertia/types.ts
inertia/pages/posts/PostShow.tsx
database/schema.ts

### Change Log

- 2026-05-16: Implemented Story 4.1 — Comments on Posts. Added `comments` table migration, `Comment` model, `CommentPolicy`, `CommentsController`, VineJS validator, two new routes (POST/DELETE), updated `PostsController.show()` to eager-load comments, updated `inertia/types.ts`, and fully replaced `PostShow.tsx` with interactive comments section (list, delete, submit form, guest prompt). All ACs #1–#8 satisfied.
