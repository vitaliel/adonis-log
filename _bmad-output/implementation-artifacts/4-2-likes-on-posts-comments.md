# Story 4.2: Likes on Posts & Comments

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to like and unlike posts and comments,
so that I can express appreciation for content I find valuable.

## Acceptance Criteria

1. **Given** I visit any post detail page **When** the page loads **Then** I see a like count on the post and on each comment, visible to all users (authenticated or not)

2. **Given** I am logged in and click the Like button on a post I have not yet liked **When** the action is processed **Then** a `post_likes` record is created for my `user_id` + that `post_id`, and the updated like count is reflected on the page

3. **Given** I am logged in and click the Like button on a post I have already liked **When** the action is processed **Then** the `post_likes` record is deleted (toggle), and the updated like count is reflected on the page

4. **Given** I am logged in **When** I view a post or comment I have already liked **Then** the Like button shows a visually distinct "liked" state (e.g. filled/active)

5. **Given** I am logged in and like or unlike a comment **When** the action is processed **Then** the `comment_likes` table is used (not `post_likes`), and the comment's like count updates correctly

6. **Given** I am not logged in **When** I view the post detail page **Then** like counts are visible but the Like button is not shown — instead a static count or prompt to log in is displayed

7. **Given** I am not logged in and attempt to POST/DELETE to a like endpoint directly **When** the request is processed **Then** I am redirected to `/login` by `auth_middleware`

8. **Given** I am logged in and attempt to like the same post twice via direct requests **When** the second request is processed **Then** no duplicate `post_likes` record is created (unique constraint on `post_id` + `user_id` enforced at DB level; controller uses `firstOrCreate`)

9. **Given** the post list at `/posts` **When** the page loads **Then** each post card shows the actual like count (not hardcoded 0)

## Tasks / Subtasks

- [ ] Task 1: Create migrations for `post_likes` and `comment_likes` tables (AC: #2, #5, #8)
  - [ ] `node ace make:migration create_post_likes_table` — columns: `post_id`, `user_id`, unique constraint, `created_at`
  - [ ] `node ace make:migration create_comment_likes_table` — columns: `comment_id`, `user_id`, unique constraint, `created_at`
  - [ ] Run `node ace migration:run` and verify schema
- [ ] Task 2: Create `PostLike` and `CommentLike` Lucid models (AC: #2, #5)
  - [ ] `app/models/post_like.ts` with `postId`, `userId`, `createdAt`, `belongsTo Post`, `belongsTo User`
  - [ ] `app/models/comment_like.ts` with `commentId`, `userId`, `createdAt`, `belongsTo Comment`, `belongsTo User`
- [ ] Task 3: Update `Post` and `Comment` models with like relations (AC: #2, #5)
  - [ ] Add `hasMany(() => PostLike)` to `Post` model
  - [ ] Add `hasMany(() => CommentLike)` to `Comment` model
- [ ] Task 4: Create `PostLikesController` and `CommentLikesController` (AC: #2, #3, #5, #7, #8)
  - [ ] `app/controllers/post_likes_controller.ts` — `store` (firstOrCreate) and `destroy` (find + delete)
  - [ ] `app/controllers/comment_likes_controller.ts` — `store` (firstOrCreate) and `destroy` (find + delete)
- [ ] Task 5: Add like routes to `start/routes.ts` (AC: #7)
  - [ ] `POST /posts/:postId/likes` → `PostLikesController.store` (auth)
  - [ ] `DELETE /posts/:postId/likes` → `PostLikesController.destroy` (auth)
  - [ ] `POST /posts/:postId/comments/:commentId/likes` → `CommentLikesController.store` (auth)
  - [ ] `DELETE /posts/:postId/comments/:commentId/likes` → `CommentLikesController.destroy` (auth)
- [ ] Task 6: Update `PostsController` to pass real like counts and `user_has_liked` (AC: #1, #4, #9)
  - [ ] `show()` — use `withCount('postLikes')`, query `user_has_liked`, bulk-load comment likes
  - [ ] `index()` — use `withCount('postLikes')` to replace hardcoded `like_count: 0`
- [ ] Task 7: Update `inertia/types.ts` (AC: #1, #4)
  - [ ] Add `user_has_liked: boolean` to `PostSummary`
  - [ ] Add `like_count: number` and `user_has_liked: boolean` to `Comment`
- [ ] Task 8: Create `inertia/components/LikeButton.tsx` reusable component (AC: #1, #4, #6)
- [ ] Task 9: Update `PostShow.tsx` to integrate like buttons (AC: #1, #3, #4, #5, #6)
  - [ ] Replace static `Like count: {like_count}` text with `<LikeButton>` on post
  - [ ] Add `<LikeButton>` to each comment card
  - [ ] Accept new props: `user_has_liked`, updated `comments` shape
- [ ] Task 10: Run quality gates — `npm run typecheck`, `npm run lint`, `node ace test`

## Dev Notes

### Overview

This story adds like/unlike functionality for both posts and comments. The architecture uses **two separate tables** (`post_likes`, `comment_likes`) — polymorphic pattern is explicitly rejected per architecture decision. No validators needed (no user-submitted body content — only route params). No Bouncer Policy needed (no ownership check — any authenticated user can like/unlike, and unliking is idempotent via `firstOrCreate`/delete).

### Migration Schemas

**`post_likes` table** (no `updated_at` — it's an event/join table):
```ts
table.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE')
table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
table.unique(['post_id', 'user_id'])  // ← DB-level duplicate prevention (AC #8)
table.timestamp('created_at').notNullable()
```

**`comment_likes` table** (same pattern):
```ts
table.integer('comment_id').unsigned().notNullable().references('id').inTable('comments').onDelete('CASCADE')
table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
table.unique(['comment_id', 'user_id'])
table.timestamp('created_at').notNullable()
```

Use `node ace make:migration create_post_likes_table` and `node ace make:migration create_comment_likes_table` to generate the files, then fill in the schema above.

### PostLike Model (`app/models/post_like.ts`)

```ts
import User from '#models/user'
import Post from '#models/post'
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class PostLike extends BaseModel {
  static table = 'post_likes'

  @column()
  declare postId: number

  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Post, { foreignKey: 'postId' })
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
```

> No `@column({ isPrimary: true })` — `post_likes` is a composite-key table (no surrogate PK). Lucid works fine without one for models used only for query/create/delete.

**`CommentLike` model** follows the exact same shape but with `commentId` instead of `postId` and `belongsTo Comment`.

### Post Model Update (`app/models/post.ts`)

Add import and relation:
```ts
import PostLike from '#models/post_like'
import type { HasMany } from '@adonisjs/lucid/types/relations'

// inside class:
@hasMany(() => PostLike, { foreignKey: 'postId' })
declare postLikes: HasMany<typeof PostLike>
```

### Comment Model Update (`app/models/comment.ts`)

Add import and relation:
```ts
import CommentLike from '#models/comment_like'
import type { HasMany } from '@adonisjs/lucid/types/relations'

// inside class:
@hasMany(() => CommentLike, { foreignKey: 'commentId' })
declare commentLikes: HasMany<typeof CommentLike>
```

### PostLikesController (`app/controllers/post_likes_controller.ts`)

```ts
import type { HttpContext } from '@adonisjs/core/http'
import PostLike from '#models/post_like'

export default class PostLikesController {
  async store({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await PostLike.firstOrCreate(
      { postId: Number(params.postId), userId: user.id }
    )
    return response.redirect().back()
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const like = await PostLike.query()
      .where('postId', params.postId)
      .where('userId', user.id)
      .first()
    await like?.delete()
    return response.redirect().back()
  }
}
```

> `firstOrCreate` accepts a single object when all fields are both search and create keys. `like?.delete()` is silent if the like doesn't exist — idempotent, no error needed.

**`CommentLikesController`** (`app/controllers/comment_likes_controller.ts`) follows the same pattern with `commentId: Number(params.commentId)`.

### Routes Addition (`start/routes.ts`)

Add controller imports at the top (with the others):
```ts
const PostLikesController = () => import('#controllers/post_likes_controller')
const CommentLikesController = () => import('#controllers/comment_likes_controller')
```

Add routes after the comment routes:
```ts
router
  .post('/posts/:postId/likes', [PostLikesController, 'store'])
  .as('post_likes.store')
  .use(middleware.auth())

router
  .delete('/posts/:postId/likes', [PostLikesController, 'destroy'])
  .as('post_likes.destroy')
  .use(middleware.auth())

router
  .post('/posts/:postId/comments/:commentId/likes', [CommentLikesController, 'store'])
  .as('comment_likes.store')
  .use(middleware.auth())

router
  .delete('/posts/:postId/comments/:commentId/likes', [CommentLikesController, 'destroy'])
  .as('comment_likes.destroy')
  .use(middleware.auth())
```

### PostsController Updates (`app/controllers/posts_controller.ts`)

**`index()` method** — replace `like_count: 0` with actual count via `withCount`:
```ts
const posts = await Post.query()
  .preload('author')
  .preload('tags')
  .withCount('postLikes', (q) => q.as('likes_count'))
  .orderBy('created_at', 'desc')
  .paginate(page, 10)

const serialized = posts.all().map((post) => ({
  id: post.id,
  title: post.title,
  author_username: post.author.username,
  created_at: post.createdAt.toFormat('MMM d, yyyy'),
  tags: post.tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
  like_count: Number(post.$extras.likes_count),
  user_has_liked: false,  // list view does not show per-user liked state
}))
```

**`show()` method** — replace `like_count: 0` with real data + per-comment like data:
```ts
import PostLike from '#models/post_like'
import CommentLike from '#models/comment_like'

// in show():
const post = await Post.query()
  .where('id', params.id)
  .preload('author')
  .preload('tags')
  .preload('comments', (q) => q.preload('author').orderBy('created_at', 'asc'))
  .withCount('postLikes', (q) => q.as('likes_count'))
  .firstOrFail()

const canEdit = auth.user ? await bouncer.with(PostPolicy).allows('edit', post) : false

const userHasLikedPost = auth.user
  ? !!(await PostLike.query().where('postId', post.id).where('userId', auth.user.id).first())
  : false

// Bulk-load all comment likes in a single query (avoids N+1 per comment)
const commentIds = post.comments.map((c) => c.id)
const allCommentLikes = commentIds.length > 0
  ? await CommentLike.query().whereIn('commentId', commentIds)
  : []

const commentLikeCountMap: Record<number, number> = {}
const userLikedCommentSet = new Set<number>()
for (const cl of allCommentLikes) {
  commentLikeCountMap[cl.commentId] = (commentLikeCountMap[cl.commentId] ?? 0) + 1
  if (auth.user && cl.userId === auth.user.id) {
    userLikedCommentSet.add(cl.commentId)
  }
}

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
      like_count: Number(post.$extras.likes_count),
      user_has_liked: userHasLikedPost,
    },
    can_edit: canEdit,
    is_authenticated: !!auth.user,
    comments: post.comments.map((c) => ({
      id: c.id,
      body: c.body,
      author_username: c.author.username,
      created_at: c.createdAt.toFormat('MMM d, yyyy'),
      is_own: auth.user ? c.userId === auth.user.id : false,
      like_count: commentLikeCountMap[c.id] ?? 0,
      user_has_liked: userLikedCommentSet.has(c.id),
    })),
  } as any
)
```

> `withCount('postLikes')` requires the `postLikes` hasMany relation on the `Post` model to be defined first (Task 3). The `$extras.likes_count` value is a string from the DB driver — always wrap with `Number(...)`.

### Types Update (`inertia/types.ts`)

Update `PostSummary` to add `user_has_liked`:
```ts
export interface PostSummary {
  id: number
  title: string
  author_username: string
  created_at: string
  tags: TagSummary[]
  like_count: number
  user_has_liked: boolean   // ← add this
}
```

Update `Comment` to add like fields:
```ts
export interface Comment {
  id: number
  body: string
  author_username: string
  created_at: string
  is_own: boolean
  like_count: number         // ← add this
  user_has_liked: boolean    // ← add this
}
```

### LikeButton Component (`inertia/components/LikeButton.tsx`)

```tsx
import { useForm } from '@inertiajs/react'

interface LikeButtonProps {
  likeCount: number
  userHasLiked: boolean
  likeUrl: string     // e.g. `/posts/5/likes` or `/posts/5/comments/3/likes`
  isAuthenticated: boolean
}

export function LikeButton({ likeCount, userHasLiked, likeUrl, isAuthenticated }: LikeButtonProps) {
  const form = useForm({})

  function handleClick() {
    if (userHasLiked) {
      form.delete(likeUrl, { preserveScroll: true } as any)
    } else {
      form.post(likeUrl, { preserveScroll: true } as any)
    }
  }

  if (!isAuthenticated) {
    return <span className="text-muted small">♥ {likeCount}</span>
  }

  return (
    <button
      type="button"
      className={`btn btn-sm ${userHasLiked ? 'btn-danger' : 'btn-outline-secondary'}`}
      onClick={handleClick}
      disabled={form.processing}
    >
      {userHasLiked ? '♥' : '♡'} {likeCount}
    </button>
  )
}
```

> `preserveScroll: true` prevents page from jumping to top when liking a comment midway down the page.
> `useForm` from `@inertiajs/react` (NOT `@adonisjs/inertia/react`) — same import as established in `PostEdit.tsx`.
> `form.post` / `form.delete` both work on the same `useForm({})` instance.

### PostShow.tsx Updates (`inertia/pages/posts/PostShow.tsx`)

Update the interface and component to use `LikeButton` and the new `Comment` shape:

```tsx
import { LikeButton } from '~/components/LikeButton'

interface PostShowProps extends PageProps {
  post: PostDetail & { user_has_liked: boolean }
  comments?: Comment[]
  can_edit?: boolean
  is_authenticated?: boolean
}
```

Replace the subtitle line:
```tsx
// REMOVE:
<p className="text-muted small">
  By {post.author_username} | {post.created_at} | Like count: {like_count}
</p>

// REPLACE WITH:
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
```

Remove the old `like_count` prop from the destructure (it's now inside `post`).

In each comment card, add `<LikeButton>` after the comment body:
```tsx
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
```

### Project Structure Notes

New files to **create** (use `node ace make:migration` for migrations):
- `database/migrations/TIMESTAMP_create_post_likes_table.ts`
- `database/migrations/TIMESTAMP_create_comment_likes_table.ts`
- `app/models/post_like.ts`
- `app/models/comment_like.ts`
- `app/controllers/post_likes_controller.ts`
- `app/controllers/comment_likes_controller.ts`
- `inertia/components/LikeButton.tsx`

Files to **modify**:
- `app/models/post.ts` — add `hasMany(() => PostLike)` relation
- `app/models/comment.ts` — add `hasMany(() => CommentLike)` relation
- `app/controllers/posts_controller.ts` — update `index()` (withCount) and `show()` (withCount + like data)
- `start/routes.ts` — add 2 controller imports + 4 new routes
- `inertia/types.ts` — add `user_has_liked` to `PostSummary`; add `like_count`/`user_has_liked` to `Comment`
- `inertia/pages/posts/PostShow.tsx` — integrate `LikeButton`, update interface, remove old `like_count` prop

Files **not to touch**:
- `app/models/user.ts` — no User changes needed
- `app/policies/` — no Policy needed for likes (no ownership — any auth user can like)
- `app/validators/` — no validator needed (no body content)
- Existing migrations — never alter

### Key Patterns from Previous Stories

- **`inertia.render('...' as never, {...} as any)`** — required TS cast. Do NOT remove `as any`.
- **`useForm` from `@inertiajs/react`** (NOT `@adonisjs/inertia/react`) — established in `PostEdit.tsx`, `PostShow.tsx`.
- **`form.delete(url)`** / **`form.post(url)`** — Inertia's `useForm` HTTP method calls. Used in `CommentsController` patterns from Story 4.1.
- **Date pre-formatting in controller**: `createdAt.toFormat('MMM d, yyyy')` — never pass raw timestamps to React.
- **`snake_case` prop keys** from controller: `author_username`, `created_at`, `user_has_liked`, `like_count`.
- **`Number(post.$extras.likes_count)`** — `withCount` returns string from SQLite driver; always cast.
- **No Bouncer for likes** — unlike comments/posts, there is no ownership check. Any authenticated user can like/unlike anything. Auth middleware is the only guard.
- **No validator** — like endpoints take no request body, only route params. VineJS not needed here.
- **`response.redirect().back()`** — redirects to the referring page (the post detail), triggering Inertia to re-render with fresh server data.

### Important: PostShow.tsx `like_count` Prop is Now Inside `post`

The current `PostShow.tsx` destructures a top-level `like_count` prop. After this story, `like_count` and `user_has_liked` are inside the `post` object (passed as `post.like_count`, `post.user_has_liked`). Remove `like_count` from the top-level destructure to avoid TS errors.

### Avoiding N+1 on Comment Likes

The `show()` implementation uses a single `CommentLike.query().whereIn('commentId', [...])` to load ALL comment likes for the post in one DB hit, then builds Maps to compute per-comment count and user-liked state. This is the correct approach — do NOT run a separate query per comment.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2] — All acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — `post_likes` / `comment_likes` table schemas, two-table (non-polymorphic) decision
- [Source: _bmad-output/planning-artifacts/architecture.md#Like Toggle Pattern] — `firstOrCreate` / `delete` controller pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Route Naming Conventions] — Like toggle routes: `POST/DELETE /posts/:postId/likes`
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — `post_likes_controller.ts`, `comment_likes_controller.ts`, `LikeButton.tsx`
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines] — Eager loading, snake_case props, date pre-formatting
- [Source: _bmad-output/implementation-artifacts/4-1-comments-on-posts.md#Dev Notes] — useForm patterns, inertia.render TS cast, Inertia redirect.back(), established Comment type
- [Source: app/models/comment.ts] — Shape to replicate for CommentLike model
- [Source: app/controllers/comments_controller.ts] — Controller pattern to follow (auth.getUserOrFail, response.redirect().back())
- [Source: inertia/pages/posts/PostShow.tsx] — Current component shape to update
- [Source: inertia/types.ts] — Interfaces to extend

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4.6)

### Debug Log References

### Completion Notes List

### File List
