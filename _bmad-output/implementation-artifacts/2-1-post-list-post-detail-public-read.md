# Story 2.1: Post List & Post Detail (Public Read)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor (authenticated or not),
I want to browse a paginated list of all posts and read any post in full,
So that I can discover and consume content on the platform.

## Acceptance Criteria

1. **Given** I visit `/posts` **When** the page loads **Then** I see a paginated list of posts in reverse chronological order, each showing title, author username, publication date (formatted `"May 14, 2026"`), tag badges, and like count.

2. **Given** there are more posts than the page size **When** I click a pagination link **Then** I see the next page of posts without a full page reload (Inertia navigation).

3. **Given** I click a post title **When** the post detail page loads at `/posts/:id` **Then** I see the full post content and all tags — loaded via Lucid eager loading (no N+1 queries). `PostShow.tsx` accepts optional `comments` (default `[]`) and `like_count` (default `0`) props so Epic 4 can enrich it without structural changes.

4. **Given** I visit `/tags/:slug` **When** the page loads **Then** I see only posts tagged with that tag, also paginated and in reverse chronological order.

5. **Given** a user logs in successfully **When** the login action is processed **Then** the redirect target is `/posts` (update the TODO left in `auth_controller.ts` from Story 1.3).

6. **Given** a user logs out **When** the logout action is processed **Then** the redirect target is `/posts`.

## Tasks / Subtasks

- [x] Create migrations (AC: #1, #3, #4)
  - [x] `node ace make:migration create_posts_table` — columns: `id`, `user_id` (FK → users, notNull), `title` (string, notNull), `body` (text, notNull), `created_at`, `updated_at`
  - [x] `node ace make:migration create_tags_table` — columns: `id`, `name` (string, notNull, unique), `slug` (string, notNull, unique), `created_at`, `updated_at`
  - [x] `node ace make:migration create_post_tags_table` — pivot: `post_id` (FK → posts), `tag_id` (FK → tags); composite unique on `(post_id, tag_id)`; no `created_at`/`updated_at` needed (pivot only)
  - [x] Run `node ace migration:run` to verify migrations apply cleanly

- [x] Create `app/models/post.ts` (AC: #1, #3)
  - [x] `@column() declare id: number`; `@column() declare userId: number`; `@column() declare title: string`; `@column() declare body: string`; `@column.dateTime() declare createdAt: DateTime`; `@column.dateTime() declare updatedAt: DateTime`
  - [x] `@belongsTo(() => User) declare author: BelongsTo<typeof User>`
  - [x] `@belongsToMany(() => Tag, { pivotTable: 'post_tags' }) declare tags: ManyToMany<typeof Tag>`

- [x] Create `app/models/tag.ts` (AC: #4)
  - [x] `@column() declare id: number`; `@column() declare name: string`; `@column() declare slug: string`; `@column.dateTime() declare createdAt: DateTime`; `@column.dateTime() declare updatedAt: DateTime`
  - [x] `@belongsToMany(() => Post, { pivotTable: 'post_tags' }) declare posts: ManyToMany<typeof Post>`

- [x] Create `app/controllers/posts_controller.ts` (AC: #1, #2, #3)
  - [x] `index({ request, inertia })` — paginate 10/page; preload `author` + `tags`; format `created_at`; pass `like_count: 0` placeholder; return `inertia.render('posts/PostIndex', { posts, meta })`
  - [x] `show({ params, inertia })` — `Post.query().where('id', params.id).preload('author').preload('tags').firstOrFail()`; return `inertia.render('posts/PostShow', { post, like_count: 0, comments: [] })`

- [x] Create `app/controllers/tags_controller.ts` (AC: #4)
  - [x] `show({ params, request, inertia })` — find tag by `slug`; query posts via `tag.related('posts').query().preload('author').paginate(page, 10)`; return `inertia.render('posts/PostIndex', { posts, meta, active_tag: tag.name })`

- [x] Create `inertia/components/Pagination.tsx` (AC: #2, #4)
  - [x] Accepts `meta: { current_page, last_page, first_page_url, last_page_url, next_page_url, prev_page_url }` prop
  - [x] Renders Bootstrap pagination using Inertia `<Link>` (NOT `<a>`) for page navigation

- [x] Create `inertia/components/TagBadge.tsx` (AC: #1, #4)
  - [x] Accepts `tag: { name: string; slug: string }` prop
  - [x] Renders a Bootstrap `badge bg-secondary` wrapped in Inertia `<Link href="/tags/:slug">`

- [x] Create `inertia/pages/posts/PostIndex.tsx` (AC: #1, #2, #4)
  - [x] Accepts `posts` (serialized array), `meta` (pagination meta), optional `active_tag?: string`
  - [x] Renders Bootstrap card list per post: title (link to `/posts/:id`), author username, formatted date, tag badges, like count
  - [x] Renders `<Pagination>` component at bottom

- [x] Create `inertia/pages/posts/PostShow.tsx` (AC: #3)
  - [x] Accepts `post`, optional `comments?: CommentType[]` (default `[]`), optional `like_count?: number` (default `0`)
  - [x] Renders post title, author, date, body, tag badges
  - [x] Leaves comments and like sections as empty stubs ready for Epic 4

- [x] Update `start/routes.ts` (AC: #1, #2, #3, #4)
  - [x] Add `GET /posts` → `[PostsController, 'index']` with `silent_auth_middleware`, named `posts.index`
  - [x] Add `GET /posts/:id` → `[PostsController, 'show']` with `silent_auth_middleware`, named `posts.show`
  - [x] Add `GET /tags/:slug` → `[TagsController, 'show']` with `silent_auth_middleware`, named `tags.show`
  - [x] Apply `middleware.silentAuth()` to all three routes (public, but auth user may be loaded)

- [x] Fix TODO redirects in `app/controllers/auth_controller.ts` (AC: #5, #6)
  - [x] `login()` method: replace `response.redirect('/')` with `response.redirect('/posts')`
  - [x] `logout()` method: replace `response.redirect('/')` with `response.redirect('/posts')`

- [x] Update `inertia/types.ts` with new types
  - [x] Add `Post`, `Tag`, `PaginationMeta` interfaces consistent with serialized Lucid output (snake_case field names)

- [x] Run checks: `npm run typecheck` (clean), `npm run lint` (clean), `node ace test` (all pass)

## Dev Notes

### Migrations

**posts table:**
```ts
// database/migrations/TIMESTAMP_create_posts_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('title').notNullable()
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

**tags table:**
```ts
table.increments('id')
table.string('name').notNullable().unique()
table.string('slug').notNullable().unique()
table.timestamp('created_at').notNullable()
table.timestamp('updated_at').notNullable()
```

**post_tags pivot (no timestamps):**
```ts
table.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE')
table.integer('tag_id').unsigned().notNullable().references('id').inTable('tags').onDelete('CASCADE')
table.unique(['post_id', 'tag_id'])
```
- No `id`, no `created_at`/`updated_at` on the pivot.
- `onDelete('CASCADE')` on both FKs so orphan pivot rows are cleaned up.

### Model Patterns

**`app/models/post.ts`:**
```ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, belongsToMany, column } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Tag from '#models/tag'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare body: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare author: BelongsTo<typeof User>

  @belongsToMany(() => Tag, {
    pivotTable: 'post_tags',
    localKey: 'id',
    pivotForeignKey: 'post_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>
}
```

**`app/models/tag.ts`:**
```ts
import { DateTime } from 'luxon'
import { BaseModel, belongsToMany, column } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsToMany(() => Post, {
    pivotTable: 'post_tags',
    localKey: 'id',
    pivotForeignKey: 'tag_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'post_id',
  })
  declare posts: ManyToMany<typeof Post>
}
```

- Lucid **auto-maps** `user_id` ↔ `userId`, `created_at` ↔ `createdAt` — do NOT declare snake_case properties on the model.
- `foreignKey: 'userId'` on `belongsTo` is required if Lucid can't infer it from the field name.

### Controller Patterns

**`app/controllers/posts_controller.ts`:**
```ts
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'

export default class PostsController {
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const posts = await Post.query()
      .preload('author')
      .preload('tags')
      .orderBy('created_at', 'desc')
      .paginate(page, 10)

    const result = posts.toJSON()
    const serialized = result.data.map((post) => ({
      id: post.id,
      title: post.title,
      author_username: post.author.username,
      created_at: post.createdAt.toFormat('MMM d, yyyy'),
      tags: post.tags.map((t) => ({ name: t.name, slug: t.slug })),
      like_count: 0, // Epic 4 enriches this
    }))

    return inertia.render('posts/PostIndex', {
      posts: serialized,
      meta: result.meta,
    })
  }

  async show({ params, inertia }: HttpContext) {
    const post = await Post.query()
      .where('id', params.id)
      .preload('author')
      .preload('tags')
      .firstOrFail()

    return inertia.render('posts/PostShow', {
      post: {
        id: post.id,
        title: post.title,
        body: post.body,
        author_username: post.author.username,
        created_at: post.createdAt.toFormat('MMM d, yyyy'),
        tags: post.tags.map((t) => ({ name: t.name, slug: t.slug })),
      },
      like_count: 0, // Epic 4: preload PostLike count
      comments: [],  // Epic 4: preload Comments
    })
  }
}
```

**`app/controllers/tags_controller.ts`:**
```ts
import type { HttpContext } from '@adonisjs/core/http'
import Tag from '#models/tag'

export default class TagsController {
  async show({ params, request, inertia }: HttpContext) {
    const tag = await Tag.findByOrFail('slug', params.slug)
    const page = request.input('page', 1)

    const posts = await tag
      .related('posts')
      .query()
      .preload('author')
      .preload('tags')
      .orderBy('created_at', 'desc')
      .paginate(page, 10)

    const result = posts.toJSON()
    const serialized = result.data.map((post) => ({
      id: post.id,
      title: post.title,
      author_username: post.author.username,
      created_at: post.createdAt.toFormat('MMM d, yyyy'),
      tags: post.tags.map((t) => ({ name: t.name, slug: t.slug })),
      like_count: 0,
    }))

    return inertia.render('posts/PostIndex', {
      posts: serialized,
      meta: result.meta,
      active_tag: tag.name,
    })
  }
}
```

**Pagination `.toJSON()` shape from Lucid:**
```ts
{
  meta: {
    total: number,
    per_page: number,
    current_page: number,
    last_page: number,
    first_page: number,
    first_page_url: string,
    last_page_url: string,
    next_page_url: string | null,
    prev_page_url: string | null,
  },
  data: Post[]
}
```

### Route Pattern

```ts
// start/routes.ts — add public post + tag routes
const PostsController = () => import('#controllers/posts_controller')
const TagsController  = () => import('#controllers/tags_controller')

router.get('/posts', [PostsController, 'index']).as('posts.index').use(middleware.silentAuth())
router.get('/posts/:id', [PostsController, 'show']).as('posts.show').use(middleware.silentAuth())
router.get('/tags/:slug', [TagsController, 'show']).as('tags.show').use(middleware.silentAuth())
```

- `silentAuth` loads the authenticated user if a session exists **without blocking unauthenticated visitors** — correct for public read pages.
- `auth` (hard auth) is for write-protected routes only.
- The new `/posts` and `/posts/:id` routes should NOT be in the `.use(middleware.auth())` group.

### React Component Patterns

**`inertia/components/TagBadge.tsx`:**
```tsx
import { Link } from '@inertiajs/react'

interface TagBadgeProps {
  tag: { name: string; slug: string }
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <Link href={`/tags/${tag.slug}`} className="badge bg-secondary text-decoration-none me-1">
      {tag.name}
    </Link>
  )
}
```

**`inertia/components/Pagination.tsx`:**
```tsx
import { Link } from '@inertiajs/react'

interface PaginationMeta {
  current_page: number
  last_page: number
  prev_page_url: string | null
  next_page_url: string | null
}

interface PaginationProps {
  meta: PaginationMeta
}

export function Pagination({ meta }: PaginationProps) {
  if (meta.last_page <= 1) return null

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${!meta.prev_page_url ? 'disabled' : ''}`}>
          <Link className="page-link" href={meta.prev_page_url ?? '#'}>
            Previous
          </Link>
        </li>
        <li className="page-item disabled">
          <span className="page-link">
            {meta.current_page} / {meta.last_page}
          </span>
        </li>
        <li className={`page-item ${!meta.next_page_url ? 'disabled' : ''}`}>
          <Link className="page-link" href={meta.next_page_url ?? '#'}>
            Next
          </Link>
        </li>
      </ul>
    </nav>
  )
}
```

**`inertia/pages/posts/PostIndex.tsx`:**
```tsx
import { Link } from '@inertiajs/react'
import { TagBadge } from '~/components/TagBadge'
import { Pagination } from '~/components/Pagination'
import type { PageProps } from '~/types'

interface PostSummary {
  id: number
  title: string
  author_username: string
  created_at: string
  tags: { name: string; slug: string }[]
  like_count: number
}

interface PostIndexProps extends PageProps {
  posts: PostSummary[]
  meta: {
    current_page: number
    last_page: number
    prev_page_url: string | null
    next_page_url: string | null
  }
  active_tag?: string
}

export default function PostIndex({ posts, meta, active_tag }: PostIndexProps) {
  return (
    <div>
      <h1 className="mb-4">{active_tag ? `Posts tagged: ${active_tag}` : 'All Posts'}</h1>
      {posts.length === 0 && <p className="text-muted">No posts yet.</p>}
      {posts.map((post) => (
        <div key={post.id} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h5>
            <p className="card-text text-muted small">
              By {post.author_username} · {post.created_at} · 👍 {post.like_count}
            </p>
            <div>
              {post.tags.map((tag) => (
                <TagBadge key={tag.slug} tag={tag} />
              ))}
            </div>
          </div>
        </div>
      ))}
      <Pagination meta={meta} />
    </div>
  )
}
```

**`inertia/pages/posts/PostShow.tsx`:**
```tsx
import { TagBadge } from '~/components/TagBadge'
import type { PageProps } from '~/types'

interface PostDetail {
  id: number
  title: string
  body: string
  author_username: string
  created_at: string
  tags: { name: string; slug: string }[]
}

interface PostShowProps extends PageProps {
  post: PostDetail
  like_count?: number    // default 0; enriched in Epic 4
  comments?: unknown[]   // default []; enriched in Epic 4
}

export default function PostShow({ post, like_count = 0, comments = [] }: PostShowProps) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p className="text-muted small">
        By {post.author_username} · {post.created_at} · 👍 {like_count}
      </p>
      <div className="mb-3">
        {post.tags.map((tag) => (
          <TagBadge key={tag.slug} tag={tag} />
        ))}
      </div>
      <div className="mb-4" style={{ whiteSpace: 'pre-wrap' }}>
        {post.body}
      </div>
      {/* Comments section — Epic 4 will populate this */}
      <section className="mt-4">
        <h4>Comments ({comments.length})</h4>
      </section>
    </article>
  )
}
```

### Types to Add to `inertia/types.ts`

```ts
export interface PaginationMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
  first_page: number
  first_page_url: string
  last_page_url: string
  next_page_url: string | null
  prev_page_url: string | null
}

export interface TagSummary {
  name: string
  slug: string
}

export interface PostSummary {
  id: number
  title: string
  author_username: string
  created_at: string
  tags: TagSummary[]
  like_count: number
}

export interface PostDetail extends PostSummary {
  body: string
}
```

### Auth Controller TODO Fix (from Story 1.3)

```ts
// app/controllers/auth_controller.ts
// In login():
return response.redirect('/posts')   // was response.redirect('/')

// In logout():
return response.redirect('/posts')   // was response.redirect('/')
```

### Critical Rules — Do NOT Violate

- **Never lazy-load** — always `.preload('author')`, `.preload('tags')` in controller queries
- **Date formatting in controller** — `post.createdAt.toFormat('MMM d, yyyy')` — never pass raw ISO in props
- **snake_case prop keys** from controllers to Inertia: `author_username`, `like_count`, `created_at`
- **`inertia.render('posts/PostIndex', {...})`** — second arg is required (overload resolution)
- **Use `Link` from `@inertiajs/react`** for all internal navigation — never bare `<a>` tags
- **`silentAuth` not `auth`** on these public routes — `auth` would block unauthenticated visitors
- **Do NOT create `PostCreate.tsx`, `PostEdit.tsx`, `create_post_validator.ts` yet** — these are Story 2.2
- **Do NOT create Bouncer `PostPolicy`** yet — needed only for 2.3 edit/delete
- **`post_likes` and `comment_likes` migrations** — do NOT create them here; Epic 4 handles likes

### Project Structure Notes

New files to **create**:
- `database/migrations/TIMESTAMP_create_posts_table.ts`
- `database/migrations/TIMESTAMP_create_tags_table.ts`
- `database/migrations/TIMESTAMP_create_post_tags_table.ts`
- `app/models/post.ts`
- `app/models/tag.ts`
- `app/controllers/posts_controller.ts`
- `app/controllers/tags_controller.ts`
- `inertia/components/TagBadge.tsx`
- `inertia/components/Pagination.tsx`
- `inertia/pages/posts/PostIndex.tsx`
- `inertia/pages/posts/PostShow.tsx`

Files to **modify**:
- `app/controllers/auth_controller.ts` — fix two `response.redirect('/')` → `response.redirect('/posts')`
- `start/routes.ts` — add `/posts`, `/posts/:id`, `/tags/:slug` routes
- `inertia/types.ts` — add `PostSummary`, `PostDetail`, `TagSummary`, `PaginationMeta` interfaces

Files **untouched**:
- All auth files (`auth_controller` other than the two redirect lines, validators, login/register pages)
- All middleware and config files
- `inertia/layouts/MainLayout.tsx`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1] — Acceptance Criteria, like_count/comments stub note
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — Post, Tag, post_tags schema decisions
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — snake_case props, route names, file/class naming
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] — date formatting with Luxon, snake_case Inertia props
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — eager loading rule, silentAuth for public routes
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — complete directory structure, component locations
- [Source: _bmad-output/implementation-artifacts/1-3-user-login-logout.md#Dev Notes] — TODO story 2.1 redirects, inertia.render second arg, vine.compile pattern

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `node ace make:migration create_posts_table`
- `node ace make:migration create_tags_table`
- `node ace make:migration create_post_tags_table`
- `node ace migration:run`
- `npm run typecheck`
- `npm run lint`
- `node ace test --files tests/functional/posts_public_read.spec.ts`
- `node ace test`

### Completion Notes List

- Implemented Story 2.1 public read flow with new `posts`, `tags`, and `post_tags` schema, including foreign keys and cascade cleanup.
- Added `Post` and `Tag` Lucid models with many-to-many relationships and `author` relation for post ownership.
- Added `PostsController` and `TagsController` with eager-loading (`author`, `tags`), reverse-chronological pagination, and formatted display dates.
- Added Inertia UI surface: `PostIndex`, `PostShow`, `Pagination`, and `TagBadge` using Inertia `Link` navigation.
- Updated `auth_controller` redirects for register/login/logout to `/posts`.
- Added routes for `/posts`, `/posts/:id`, and `/tags/:slug` and exposed `middleware.silentAuth()` for route-level usage.
- Added Story 2.1 integration tests (`tests/functional/posts_public_read.spec.ts`) covering eager-loading and tag-scoped post query behavior.
- Regenerated Adonis indexes/types via test bootstrap (`.adonisjs/server/controllers.ts`, `.adonisjs/server/pages.d.ts`) and validated all checks pass.

### File List

- `.adonisjs/server/controllers.ts` (modified)
- `.adonisjs/server/pages.d.ts` (modified)
- `_bmad-output/implementation-artifacts/2-1-post-list-post-detail-public-read.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `app/controllers/auth_controller.ts` (modified)
- `app/controllers/posts_controller.ts` (added)
- `app/controllers/tags_controller.ts` (added)
- `app/models/post.ts` (added)
- `app/models/tag.ts` (added)
- `database/migrations/1778863088284_create_posts_table.ts` (added)
- `database/migrations/1778863089253_create_tags_table.ts` (added)
- `database/migrations/1778863090383_create_post_tags_table.ts` (added)
- `database/schema.ts` (modified)
- `inertia/components/Pagination.tsx` (added)
- `inertia/components/TagBadge.tsx` (added)
- `inertia/pages/posts/PostIndex.tsx` (added)
- `inertia/pages/posts/PostShow.tsx` (added)
- `inertia/types.ts` (modified)
- `start/kernel.ts` (modified)
- `start/routes.ts` (modified)
- `tests/functional/posts_public_read.spec.ts` (added)

## Change Log

- 2026-05-15: Implemented Story 2.1 end-to-end, added schema/models/controllers/routes/UI/types/tests, and moved status to `review`.

### Review Findings

- [x] [Review][Patch] Validate and clamp pagination `page` input to positive integers in both controllers [app/controllers/posts_controller.ts:6]
- [x] [Review][Patch] Add an index on `posts.created_at` to support reverse-chronological pagination queries [database/migrations/1778863088284_create_posts_table.ts:18]
- [x] [Review][Patch] Add an index on `post_tags.tag_id` for efficient tag-scoped post lookups [database/migrations/1778863090383_create_post_tags_table.ts:16]
- [x] [Review][Patch] Remove duplicate route-level `silentAuth` middleware where router-level middleware already applies it [start/routes.ts:34]
- [x] [Review][Patch] Render non-clickable pagination controls when page URLs are null instead of linking to `#` [inertia/components/Pagination.tsx:17]
