# Story 3.1: Public User Profile Page

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor (authenticated or not),
I want to view any user's profile page,
so that I can learn about authors and browse their published posts.

## Acceptance Criteria

1. **Given** I visit `/users/:username` **When** the page loads **Then** I see the user's username, bio, social links (each with `type` label e.g. Twitter, GitHub, LinkedIn), and a paginated list of all posts authored by that user in reverse chronological order.

2. **Given** the user has no bio or no social links **When** the page loads **Then** those sections are gracefully omitted or show an empty state — no errors, no blank broken UI.

3. **Given** I visit a username that does not exist **When** the request is processed **Then** I receive a 404 response (AdonisJS `ModelNotFoundException` → 404).

4. **Given** a user has authored posts **When** the profile page loads **Then** each post shows title (linked to `/posts/:id`), publication date (formatted "May 14, 2026"), and tag badges — matching the established `PostSummary` display pattern from `PostIndex.tsx`.

5. **Given** a user has authored many posts **When** I click pagination links **Then** I see more posts without a full page reload (Inertia navigation), using the same `Pagination` component already in `inertia/components/Pagination.tsx`.

## Tasks / Subtasks

- [ ] Create migration `TIMESTAMP_create_user_social_links_table.ts` (AC: #1, #2)
  - [ ] `node ace make:migration create_user_social_links_table`
  - [ ] Columns: `id` (increments PK), `user_id` (integer, notNullable, FK → users.id onDelete CASCADE), `type` (string, notNullable), `url` (string, notNullable), `created_at`, `updated_at`
  - [ ] Run `node ace migration:run` (regenerates `database/schema.ts`)

- [ ] Create `app/models/user_social_link.ts` with `UserSocialLink` model (AC: #1)
  - [ ] Columns matching schema: `id`, `userId`, `type`, `url`, `createdAt`, `updatedAt`
  - [ ] `@belongsTo(() => User)` for ownership relation

- [ ] Update `app/models/user.ts` to add relations (AC: #1, #4)
  - [ ] `@hasMany(() => Post, { foreignKey: 'userId' })` → `declare posts: HasMany<typeof Post>`
  - [ ] `@hasMany(() => UserSocialLink, { foreignKey: 'userId' })` → `declare socialLinks: HasMany<typeof UserSocialLink>`
  - [ ] Add necessary imports (`hasMany`, `HasMany`, `Post`, `UserSocialLink`)

- [ ] Create `app/controllers/users_controller.ts` with `show` method (AC: #1–#5)
  - [ ] Lazy-import `UsersController` in routes (match pattern of `PostsController`)
  - [ ] `show({ params, request, inertia }: HttpContext)`:
    - [ ] Find user by username: `User.query().where('username', params.username).firstOrFail()` — throws `ModelNotFoundException` → 404 automatically
    - [ ] Preload social links: `.preload('socialLinks')`
    - [ ] Paginate posts via separate query: `Post.query().where('userId', user.id).preload('tags').orderBy('created_at', 'desc').paginate(page, 10)`
    - [ ] Return `inertia.render('users/UserProfile' as never, { user, posts, meta } as any)`

- [ ] Add route `GET /users/:username` to `start/routes.ts` (AC: #1–#3)
  - [ ] `router.get('/users/:username', [UsersController, 'show']).as('users.show')`
  - [ ] No middleware (public route — uses global silent auth)

- [ ] Create `inertia/pages/users/UserProfile.tsx` (AC: #1–#5)
  - [ ] Props: `user` (id, username, bio, socialLinks[]), `posts: PostSummary[]`, `meta: PaginationMeta`
  - [ ] Show bio section only if `user.bio` is non-null/non-empty
  - [ ] Show social links section only if `user.socialLinks.length > 0`; render each as `<a href={link.url} target="_blank">` with `link.type` as label
  - [ ] Render posts list using same pattern as `PostIndex.tsx` (card with title link, date, tag badges)
  - [ ] Render `<Pagination meta={meta} />` below posts list
  - [ ] Import `Link` from `@adonisjs/inertia/react` (NOT from `@inertiajs/react`)

- [ ] Update `inertia/types.ts` to add new types (AC: #1)
  - [ ] `SocialLink` interface: `{ id: number; type: string; url: string }`
  - [ ] `UserProfile` interface: `{ id: number; username: string; bio: string | null; socialLinks: SocialLink[] }`

- [ ] Run checks: `npm run typecheck` (clean), `npm run lint` (clean), `node ace test` (all pass)

## Dev Notes

### Migration: `user_social_links`

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_social_links'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('type').notNullable()   // e.g. "Twitter", "GitHub", "LinkedIn"
      table.string('url').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

After running `node ace migration:run`, `database/schema.ts` will auto-regenerate and include `UserSocialLinkSchema`.

### Model: `app/models/user_social_link.ts`

```ts
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class UserSocialLink extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare type: string

  @column()
  declare url: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
```

### Updated `app/models/user.ts`

Add `posts` and `socialLinks` relations — **do NOT replace the file**, only extend:

```ts
import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'
import UserSocialLink from '#models/user_social_link'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  @hasMany(() => Post, { foreignKey: 'userId' })
  declare posts: HasMany<typeof Post>

  @hasMany(() => UserSocialLink, { foreignKey: 'userId' })
  declare socialLinks: HasMany<typeof UserSocialLink>

  get initials() {
    const name = this.username || this.email
    return name.slice(0, 2).toUpperCase()
  }
}
```

> **Circular import note:** `Post` imports `User` (via `belongsTo`). Adding `Post` to `User` creates a circular dependency. AdonisJS Lucid handles this via lazy relation functions (`() => Post`) — the circular import is safe at runtime. This pattern is used throughout Lucid codebases.

### Controller: `app/controllers/users_controller.ts`

```ts
import User from '#models/user'
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async show({ params, request, inertia }: HttpContext) {
    const user = await User.query()
      .where('username', params.username)
      .preload('socialLinks')
      .firstOrFail()

    const page = Math.max(1, Number.parseInt(String(request.input('page', 1)), 10) || 1)
    const posts = await Post.query()
      .where('userId', user.id)
      .preload('tags')
      .orderBy('created_at', 'desc')
      .paginate(page, 10)

    return inertia.render('users/UserProfile' as never, {
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
      posts: posts.all().map((post) => ({
        id: post.id,
        title: post.title,
        author_username: user.username,
        created_at: post.createdAt.toFormat('MMM d, yyyy'),
        tags: post.tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
        like_count: 0,
      })),
      meta: posts.getMeta(),
    } as any)
  }
}
```

> **`firstOrFail()` → 404:** Lucid's `firstOrFail()` throws `ModelNotFoundException` which AdonisJS exception handler automatically converts to a 404 response. No manual 404 handling needed.

> **`like_count: 0`:** Story 4.2 adds likes. Pass `0` for now — same established pattern as `PostShow.tsx` initial `like_count: 0`.

> **`posts.getMeta()`**: Returns the `PaginationMeta` shape already defined in `inertia/types.ts`. The paginator's `getMeta()` returns `first_page_url`, `last_page_url`, `next_page_url`, `prev_page_url`, `total`, etc.

### Route Addition in `start/routes.ts`

```ts
const UsersController = () => import('#controllers/users_controller')

// Add after tags route (end of file):
router.get('/users/:username', [UsersController, 'show']).as('users.show')
```

No `middleware.auth()` — this is a public read route. The global `silentAuth` middleware loads auth state for navbar rendering.

### React Page: `inertia/pages/users/UserProfile.tsx`

```tsx
import { Link } from '@adonisjs/inertia/react'
import { Pagination } from '~/components/Pagination'
import { TagBadge } from '~/components/TagBadge'
import { type PageProps, type PaginationMeta, type PostSummary } from '~/types'

interface SocialLink {
  id: number
  type: string
  url: string
}

interface UserProfileData {
  id: number
  username: string
  bio: string | null
  socialLinks: SocialLink[]
}

interface UserProfileProps extends PageProps {
  user: UserProfileData
  posts: PostSummary[]
  meta: PaginationMeta
}

export default function UserProfile({ user, posts, meta }: UserProfileProps) {
  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1">{user.username}</h1>

        {user.bio && (
          <p className="text-muted">{user.bio}</p>
        )}

        {user.socialLinks.length > 0 && (
          <div className="mb-2">
            {user.socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-secondary me-2 mb-1"
              >
                {link.type}
              </a>
            ))}
          </div>
        )}
      </div>

      <h2 className="h5 mb-3">Posts by {user.username}</h2>

      {posts.length === 0 && (
        <p className="text-muted">No posts yet.</p>
      )}

      {posts.map((post) => (
        <article key={post.id} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title mb-1">
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h5>
            <p className="card-text text-muted small mb-2">
              {post.created_at} | Like count: {post.like_count}
            </p>
            <div>
              {post.tags.map((tag) => (
                <TagBadge key={tag.slug} tag={tag} />
              ))}
            </div>
          </div>
        </article>
      ))}

      <Pagination meta={meta} />
    </div>
  )
}
```

> **`Link` import:** MUST use `@adonisjs/inertia/react` (not `@inertiajs/react`). ESLint enforces this — confirmed in Story 2.3 debug log.

### Types Addition in `inertia/types.ts`

Append these interfaces to the file (after `PostDetail`):

```ts
export interface SocialLink {
  id: number
  type: string
  url: string
}

export interface UserProfile {
  id: number
  username: string
  bio: string | null
  socialLinks: SocialLink[]
}
```

### Project Structure Notes

New files to **create**:
- `database/migrations/TIMESTAMP_create_user_social_links_table.ts`
- `app/models/user_social_link.ts`
- `app/controllers/users_controller.ts`
- `inertia/pages/users/UserProfile.tsx` (create `inertia/pages/users/` folder)

Files to **modify**:
- `app/models/user.ts` — add `posts` and `socialLinks` relations + imports
- `start/routes.ts` — add `UsersController` lazy import + `GET /users/:username` route
- `inertia/types.ts` — add `SocialLink` and `UserProfile` interfaces
- `database/schema.ts` — auto-regenerated by `node ace migration:run` (do not edit manually)

### Key Patterns from Previous Stories

- **`inertia.render('...' as never, {...} as any)`** — TypeScript cast pattern used throughout this project (Stories 2.2, 2.3). Required because Tuyau's generated types are strict; the `as never/as any` pattern is the established workaround.
- **`toFormat('MMM d, yyyy')`** — Luxon date format for display (confirmed in Stories 2.1, 2.2, 2.3). Always format dates in the controller, never in the React component.
- **Pagination pattern** — `PostIndex.tsx` + `TagsController.show` use `.paginate(page, 10)` with `getMeta()`. Follow the same pattern exactly.
- **`like_count: 0`** — Story 4.2 enriches this. Pass `0` for now as placeholder (same approach in Stories 2.1–2.3).
- **No `@inertiajs/react` Link** — always `@adonisjs/inertia/react`. ESLint will flag the wrong import.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1] — Acceptance Criteria, user profile requirements
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — `user_social_links` table design (`type` + `url`), `UserSocialLink` hasMany pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — `app/controllers/users_controller.ts`, `app/models/user_social_link.ts`, `inertia/pages/users/UserProfile.tsx`
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — `snake_case` props, Luxon date format, route naming
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — `firstOrFail()` → 404, eager loading discipline
- [Source: _bmad-output/implementation-artifacts/2-3-edit-delete-own-post.md#Debug Log] — `Link` must import from `@adonisjs/inertia/react`
- [Source: _bmad-output/implementation-artifacts/2-3-edit-delete-own-post.md#Dev Notes] — `inertia.render(...as never, {} as any)` pattern
- [Source: _bmad-output/implementation-artifacts/2-1-post-list-post-detail-public-read.md] — Pagination pattern with `getMeta()`, `PostIndex.tsx` structure

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

### File List
