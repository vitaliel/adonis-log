# Story 5.2: Functional Test Suite

Status: ready-for-dev

## Story

As a developer learning AdonisJS testing patterns,
I want a functional test suite covering all major feature areas,
So that I can see how Japa HTTP tests work for real-world AdonisJS features.

## Acceptance Criteria

1. **Given** I run `node ace test` **When** the test suite executes **Then** all tests pass with no failures on a freshly seeded database

2. **Given** `tests/functional/auth.spec.ts` exists **When** I read it **Then** it covers: registration with valid data, registration with duplicate email, login with valid credentials, login with invalid credentials, logout, and redirect to login for protected routes

3. **Given** `tests/functional/posts.spec.ts` exists **When** I read it **Then** it covers: public post list, post detail view, create post (authenticated), create post (unauthenticated → redirect), edit own post, attempt to edit another user's post (→ 403), delete own post

4. **Given** `tests/functional/comments.spec.ts` exists **When** I read it **Then** it covers: comment on a post (authenticated), empty comment validation, delete own comment, attempt to delete another user's comment (→ 403)

5. **Given** `tests/functional/likes.spec.ts` exists **When** I read it **Then** it covers: like a post, unlike a post (toggle), like a comment, unauthenticated like attempt (→ redirect)

6. **Given** `tests/functional/users.spec.ts` exists **When** I read it **Then** it covers: view public profile, view own profile edit form, update bio and social links, attempt to edit another user's profile (→ redirect)

## Tasks / Subtasks

- [ ] Task 1: Create `tests/functional/auth.spec.ts` (AC: #2)
  - [ ] Test: POST `/register` with valid unique data → 302 redirect, session established
  - [ ] Test: POST `/register` with duplicate email → 422 or redirect back with errors
  - [ ] Test: POST `/login` with valid credentials → 302 redirect, session established
  - [ ] Test: POST `/login` with invalid credentials → redirect back with errors
  - [ ] Test: POST `/logout` when authenticated → session invalidated, redirect
  - [ ] Test: GET `/posts/create` unauthenticated → 302 redirect to `/login`

- [ ] Task 2: Create `tests/functional/posts.spec.ts` (AC: #3)
  - [ ] Test: GET `/posts` → 200 with post list
  - [ ] Test: GET `/posts/:id` → 200 with post detail
  - [ ] Test: GET `/posts/create` authenticated → 200
  - [ ] Test: POST `/posts` unauthenticated → 302 redirect to `/login`
  - [ ] Test: POST `/posts` authenticated with valid data → 302 redirect to new post
  - [ ] Test: PUT `/posts/:id` as owner → 302 redirect, post updated
  - [ ] Test: PUT `/posts/:id` as non-owner → 403 Forbidden
  - [ ] Test: DELETE `/posts/:id` as owner → 302 redirect

- [ ] Task 3: Create `tests/functional/comments.spec.ts` (AC: #4)
  - [ ] Test: POST `/posts/:postId/comments` authenticated with valid body → 302 redirect
  - [ ] Test: POST `/posts/:postId/comments` with empty body → redirect back with validation error
  - [ ] Test: DELETE `/posts/:postId/comments/:id` as comment owner → 302 redirect
  - [ ] Test: DELETE `/posts/:postId/comments/:id` as non-owner → 403 Forbidden

- [ ] Task 4: Create `tests/functional/likes.spec.ts` (AC: #5)
  - [ ] Test: POST `/posts/:postId/likes` authenticated → 302 redirect, like created
  - [ ] Test: DELETE `/posts/:postId/likes` authenticated (toggle off) → 302 redirect, like removed
  - [ ] Test: POST `/posts/:postId/comments/:commentId/likes` authenticated → 302 redirect
  - [ ] Test: POST `/posts/:postId/likes` unauthenticated → 302 redirect to `/login`

- [ ] Task 5: Create `tests/functional/users.spec.ts` (AC: #6)
  - [ ] Test: GET `/users/:username` → 200 public profile visible
  - [ ] Test: GET `/users/:username/edit` as that user → 200 edit form visible
  - [ ] Test: PUT `/users/:username` as that user with valid bio → 302 redirect, bio updated
  - [ ] Test: GET `/users/:username/edit` unauthenticated → 302 redirect to `/login`

- [ ] Task 6: Run full test suite `node ace test` — all tests pass (AC: #1)
- [ ] Task 7: Run quality gates — `npm run typecheck`, `npm run lint`

## Dev Notes

### HTTP Testing Pattern in This Project

The existing `tests/functional/` files test model-level logic (queries, validators, policies) inside the `functional` suite. For this story, the new spec files **must use the Japa HTTP `client`** from `@japa/plugin-adonisjs` to test actual HTTP routes end-to-end. The bootstrap already starts an HTTP server for the functional suite:

```ts
// tests/bootstrap.ts — already configured
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
```

### Standard Test File Structure

Always use `testUtils.db().withGlobalTransaction()` so each test is fully isolated with automatic rollback:

```ts
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Feature area | description', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('does something', async ({ client }) => {
    const response = await client.get('/posts')
    response.assertStatus(200)
  })
})
```

### Authenticating Requests in Tests

Use `.loginAs(user)` from `@japa/plugin-adonisjs` to log in a user for an HTTP request:

```ts
test('authenticated user can create post', async ({ client }) => {
  const user = await User.create({ username: 'u', email: 'u@e.com', password: 'password123' })
  const response = await client.post('/posts').form({ title: 'T', body: 'B' }).loginAs(user)
  response.assertRedirectsTo('/posts/1') // or assertStatus(302)
})
```

**Important:** When creating users in tests, `User.create()` triggers the `beforeSave` hook which **auto-hashes** the password. Do NOT use `hash.make()` manually when creating users for authentication with `.loginAs()` — just pass the plain password and let the hook handle it.

```ts
// ✅ Correct — hook hashes automatically, .loginAs() works
const user = await User.create({ username: 'u', email: 'u@e.com', password: 'secret123' })

// ❌ Wrong — double-hashing breaks .loginAs()
const user = await User.create({ username: 'u', email: 'u@e.com', password: await hash.make('secret123') })
```

### Asserting Responses

```ts
response.assertStatus(200)           // exact status
response.assertStatus(302)           // redirect
response.assertRedirectsTo('/login') // redirect target
response.assertBodyContains({ ... }) // JSON body match
// For Inertia responses (HTML), check status only — Inertia renders HTML, not JSON
```

### Authorization — 403 for Bouncer Policy Violations

When a user attempts to edit/delete a resource they don't own, `PostPolicy.edit()` / `CommentPolicy.destroy()` returns false and AdonisJS throws a 403 (`E_AUTHORIZATION_FAILURE`). Assert with:

```ts
response.assertStatus(403)
```

### Redirect-Back for Validation Errors

VineJS validation failures cause a redirect back with errors in Inertia. Assert redirect:

```ts
response.assertStatus(302) // or check headers for location
```

### Route URLs — Hardcode Strings in Tests

The `@tuyau/core` route helpers are for production code. In tests, use hardcoded route strings directly (simpler and more readable):

```ts
// ✅ In tests
await client.post('/posts')
await client.delete(`/posts/${post.id}`)
await client.put(`/users/${user.username}`)

// ❌ Don't bother with tuyau in tests
```

### Factory Helpers for Test Data

No factory library is installed. Create model data directly using Lucid `.create()`:

```ts
const user = await User.create({ username: 'alice', email: 'alice@test.com', password: 'password' })
const post = await Post.create({ userId: user.id, title: 'Hello', body: 'World' })
const comment = await Comment.create({ userId: user.id, postId: post.id, body: 'Nice post' })
```

Tags need `slug` in addition to `name`:

```ts
const tag = await Tag.create({ name: 'Tech', slug: 'tech' })
await post.related('tags').attach([tag.id])
```

### Model Import Paths (ESM `.js` Extension Rule)

All imports in test files use `#alias` paths (no `.js` needed):

```ts
import User from '#models/user'
import Post from '#models/post'
import Comment from '#models/comment'
import Tag from '#models/tag'
import PostLike from '#models/post_like'
import CommentLike from '#models/comment_like'
```

### Existing Test Files — Do NOT Modify

These files are already passing and must remain untouched:
- `tests/unit/auth.spec.ts`
- `tests/unit/post_policy.spec.ts`
- `tests/unit/user_policy.spec.ts`
- `tests/functional/posts_public_read.spec.ts`
- `tests/functional/profile_edit.spec.ts`

### Route Map for Tests

```
GET  /posts                                              → PostsController.index (public)
GET  /posts/create                                       → PostsController.create (auth required)
GET  /posts/:id                                          → PostsController.show (public)
GET  /posts/:id/edit                                     → PostsController.edit (auth required)
POST /posts                                              → PostsController.store (auth required)
PUT  /posts/:id                                          → PostsController.update (auth + owner)
DELETE /posts/:id                                        → PostsController.destroy (auth + owner)

POST /register                                           → AuthController.register
POST /login                                              → AuthController.login
POST /logout                                             → AuthController.logout (auth required)

POST   /posts/:postId/comments                           → CommentsController.store (auth required)
DELETE /posts/:postId/comments/:id                       → CommentsController.destroy (auth + owner)

POST   /posts/:postId/likes                              → PostLikesController.store (auth required)
DELETE /posts/:postId/likes                              → PostLikesController.destroy (auth required)

POST   /posts/:postId/comments/:commentId/likes          → CommentLikesController.store (auth required)
DELETE /posts/:postId/comments/:commentId/likes          → CommentLikesController.destroy (auth required)

GET /users/:username                                     → UsersController.show (public)
GET /users/:username/edit                                → UsersController.edit (auth required)
PUT /users/:username                                     → UsersController.update (auth + owner via UserPolicy)
```

### Project Structure Notes

- New test files go in `tests/functional/` (matches the `functional` suite glob: `tests/functional/**/*.spec.{ts,js}`)
- Do NOT create files anywhere else (no `tests/http/`, no `tests/integration/`)
- Do NOT modify `tests/bootstrap.ts`, `bin/test.ts`, or `adonisrc.ts`
- All 5 new files follow pattern: `tests/functional/{feature}.spec.ts`

### Previous Story Intelligence

From Story 5.1 (seed data):
- Password hashing: `User.create({ password: 'plain' })` — the `beforeSave` hook auto-hashes; never pre-hash manually in tests either
- `PostLike.firstOrCreate({ postId, userId })` and `CommentLike.firstOrCreate({ commentId, userId })` — unique constraints on `(postId, userId)` and `(commentId, userId)`; toggling a like means creating then deleting the same row
- `UserSocialLink` uses `type` (string, e.g. `'github'`) + `url` columns

### References

- Japa + AdonisJS HTTP testing: `@japa/plugin-adonisjs` pluginAdonisJS — [Source: _bmad-output/planning-artifacts/architecture.md#Testing Framework]
- Test suite structure: `tests/functional/**/*.spec.ts` — [Source: _bmad-output/planning-artifacts/architecture.md#Test Structure]
- HTTP server auto-start for functional suite: [Source: tests/bootstrap.ts#configureSuite]
- Bouncer Policies for ownership: [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- Story requirements: [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2: Functional Test Suite]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
