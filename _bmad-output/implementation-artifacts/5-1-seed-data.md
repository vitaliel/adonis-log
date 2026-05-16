# Story 5.1: Seed Data

Status: ready-for-dev

## Story

As a developer exploring or demoing AdonisLog,
I want the application pre-loaded with realistic sample content,
So that I can immediately explore all features without manually creating data.

## Acceptance Criteria

1. **Given** I run `node ace db:seed` on a fresh database **When** the seeding completes **Then** the database contains: at least 2 sample users, at least 5 sample posts with varied tags, at least 3 sample comments across posts, and at least a few likes on posts and comments

2. **Given** the seed data is loaded **When** I browse the post list **Then** posts show realistic content with tags, author names, dates, and like/comment counts

3. **Given** the seed data is loaded **When** I visit a user profile **Then** the profile shows the seeded bio, social links, and authored posts

4. **Given** I run `node ace db:seed` more than once on the same database **When** seeding completes **Then** duplicate records are avoided (idempotent seeding or clear docs on running with a fresh DB)

## Tasks / Subtasks

- [ ] Task 1: Create `database/seeders/` directory and `main_seeder.ts` (AC: #1, #4)
  - [ ] `node ace make:seeder main` — creates `database/seeders/main_seeder.ts`
  - [ ] `run()` method calls sub-seeders in order: `UserSeeder → PostSeeder → TagSeeder → CommentSeeder → LikeSeeder`
  - [ ] Import and instantiate each sub-seeder with `new XxxSeeder(this.client)`
- [ ] Task 2: Create `user_seeder.ts` — 2 sample users (AC: #1, #3, #4)
  - [ ] `node ace make:seeder user`
  - [ ] Create 2 users via `User.firstOrCreate({ email }, { username, password, bio })`
  - [ ] Password must be stored as bcrypt hash — use `hash.make('password')` or create user via `User.create()` which triggers the `beforeSave` hook automatically
  - [ ] Add `UserSocialLink` rows for each user (e.g. `github`, `twitter` types)
  - [ ] Use `UserSocialLink.firstOrCreate({ userId, type }, { url })` for idempotency
- [ ] Task 3: Create `post_seeder.ts` — at least 5 posts (AC: #1, #2)
  - [ ] `node ace make:seeder post`
  - [ ] Create 5+ posts distributed across the 2 users via `Post.firstOrCreate({ title }, { userId, body })`
  - [ ] Use `await post.related('tags').attach(...)` or `sync()` to attach pre-created tags
- [ ] Task 4: Create `tag_seeder.ts` — a set of reusable tags (AC: #1, #2)
  - [ ] `node ace make:seeder tag`
  - [ ] Create 4–6 tags via `Tag.firstOrCreate({ slug }, { name })`
  - [ ] Return created tags so `PostSeeder` can reference them
- [ ] Task 5: Create `comment_seeder.ts` — at least 3 comments (AC: #1)
  - [ ] `node ace make:seeder comment`
  - [ ] Create 3+ comments on different posts via `Comment.firstOrCreate({ postId, userId, body }, {})`
- [ ] Task 6: Create `like_seeder.ts` — likes on posts and comments (AC: #1)
  - [ ] `node ace make:seeder like`
  - [ ] Create `PostLike` rows via `PostLike.firstOrCreate({ postId, userId })`
  - [ ] Create `CommentLike` rows via `CommentLike.firstOrCreate({ commentId, userId })`
  - [ ] Respect the unique constraint on `(postId, userId)` and `(commentId, userId)`
- [ ] Task 7: Verify end-to-end: `node ace db:seed` on a fresh DB, then re-run for idempotency (AC: #1, #4)
- [ ] Task 8: Run quality gates — `npm run typecheck`, `npm run lint`

## Dev Notes

### Overview

This story creates 6 seeder files under `database/seeders/`. No migrations, no controllers, no React changes — pure DB seed layer. The architecture mandates a single entry point: `node ace db:seed` runs `MainSeeder` which delegates to 5 sub-seeders in dependency order.

**Idempotency strategy:** Use `Model.firstOrCreate(uniqueKey, defaults)` throughout. This avoids duplicate records on repeated runs. An alternative (acceptable) approach is to document "truncate DB first" clearly, but `firstOrCreate` is preferred so the command is safe to re-run.

### Seeder Execution Order (dependency-driven)

```
MainSeeder
  └── UserSeeder       (no deps)
  └── TagSeeder        (no deps)
  └── PostSeeder       (needs users + tags)
  └── CommentSeeder    (needs users + posts)
  └── LikeSeeder       (needs users + posts + comments)
```

### AdonisJS Lucid Seeder API (v22)

```ts
// database/seeders/main_seeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserSeeder from './user_seeder.js'
import TagSeeder from './tag_seeder.js'
import PostSeeder from './post_seeder.js'
import CommentSeeder from './comment_seeder.js'
import LikeSeeder from './like_seeder.js'

export default class MainSeeder extends BaseSeeder {
  async run() {
    await new UserSeeder(this.client).run()
    await new TagSeeder(this.client).run()
    await new PostSeeder(this.client).run()
    await new CommentSeeder(this.client).run()
    await new LikeSeeder(this.client).run()
  }
}
```

### Password Hashing in Seeders

The `User` model uses the `withAuthFinder` mixin and a `beforeSave` hash hook. When creating users via `User.create()` or `User.firstOrCreate()`, **the plain-text password will be auto-hashed** by the hook — do NOT pre-hash manually. Example:

```ts
await User.firstOrCreate(
  { email: 'alice@example.com' },
  { username: 'alice', password: 'password123', bio: 'A sample user.' }
)
```

### Tag-Post Association

After creating posts and tags, attach tags via the `manyToMany` relation:

```ts
const post = await Post.firstOrCreate({ title }, { userId, body })
await post.related('tags').sync([tag1.id, tag2.id], false)
// false = don't detach existing tags, just add missing ones
```

### UserSocialLink types

Architecture doesn't restrict type values to an enum — use plain strings. Suggested values: `'github'`, `'twitter'`, `'website'`.

### File Locations

```
database/seeders/main_seeder.ts
database/seeders/user_seeder.ts
database/seeders/tag_seeder.ts
database/seeders/post_seeder.ts
database/seeders/comment_seeder.ts
database/seeders/like_seeder.ts
```

No changes to: `app/`, `inertia/`, `start/routes.ts`, `config/`.

### Project Structure Notes

- `database/` currently only has `migrations/`, `schema_rules.ts`, `schema.ts` — the `seeders/` subdirectory does not exist yet; create it.
- `ace make:seeder` will create files in `database/seeders/` automatically.
- Import paths in TypeScript files must use `.js` extension (ESM project): `import UserSeeder from './user_seeder.js'`.

### References

- Seeder structure decision: [Source: docs/architecture.md#Infrastructure & Deployment]
- Seeder file tree: [Source: docs/architecture.md#Project Structure]
- FR37–38 seed requirements: [Source: docs/epics.md#Story 5.1: Seed Data]
- `MainSeeder` orchestration pattern: [Source: docs/architecture.md#Decision Impact Analysis — step 8]
- `post_likes` unique constraint `(postId, userId)`: [Source: app/models/post_like.ts]
- `comment_likes` unique constraint `(commentId, userId)`: [Source: app/models/comment_like.ts]
- `UserSocialLink` model shape: [Source: app/models/user_social_link.ts]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4.6

### Debug Log References

### Completion Notes List

### File List
