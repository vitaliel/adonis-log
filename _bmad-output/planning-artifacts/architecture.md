---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/product-brief-adonis-blog.md', '_bmad-output/planning-artifacts/product-brief-adonis-blog-distillate.md']
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-05-14'
project_name: 'bmad'
user_name: 'Vitalie'
date: '2026-05-14'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
40 FRs across 8 feature areas: User Auth (FR1–7), User Profiles (FR8–12), Post Management (FR13–19), Tagging (FR20–23), Comments (FR24–27), Likes (FR28–33), Form Validation (FR34–36), Seed Data & Docs (FR37–40).

The feature set is complete and bounded — no ambiguity about scope. All write operations require authentication; read access is public.

**Non-Functional Requirements:**
- Security: bcrypt passwords, session invalidation, server-side auth guards, cross-user mutation prevention
- Performance: Lucid eager loading to eliminate N+1 queries (stated requirement)
- Maintainability: Idiomatic AdonisJS patterns throughout — codebase is a learning reference, antipatterns are explicitly unacceptable

**Scale & Complexity:**
- Primary domain: Full-stack Inertia.js monolith (no separate frontend/backend)
- Complexity level: Low — local dev only, no compliance, single user tier, no deployment, no real-time, no background jobs
- Estimated architectural components: ~8 domain models, ~6 controller groups, ~15–20 Inertia page components

### Technical Constraints & Dependencies

- Stack is confirmed and non-negotiable: AdonisJS + Lucid ORM + Inertia.js + React + Bootstrap + SQLite
- No REST API — Inertia.js is the only client/server bridge
- No file upload handling (no multipart)
- No email/mailer configuration
- No WebSockets or real-time features
- Local development only — no production DB or deployment config needed for v1
- Two separate like tables (`post_likes`, `comment_likes`) — polymorphic pattern explicitly rejected for learnability

### Cross-Cutting Concerns Identified

1. **Authentication middleware** — guards all write routes; redirect to login on unauthorized access
2. **Ownership enforcement** — all edit/delete actions must verify `auth.user.id === resource.userId`
3. **Inertia form validation pattern** — server-side validation errors must be returned via Inertia shared errors so React components display inline
4. **Eager loading discipline** — relationships (tags, comments, like counts, author) must always be preloaded; no lazy-loading in controllers
5. **Inertia shared data** — current auth user state must be available on every page via `inertia.share()`

## Starter Template Evaluation

### Primary Technology Domain

Full-stack Inertia.js monolith — AdonisJS handles server routing and data, Inertia.js bridges to React page components. No separate API.

### Starter Options Considered

The project is already scaffolded via the official AdonisJS starter kit with the Inertia + React preset. No starter selection was needed.

### Selected Starter: AdonisJS Inertia + React Starter Kit (Pre-scaffolded)

**Rationale for Selection:**
Stack was pre-decided as part of the project's learning goals. The official AdonisJS starter kit with Inertia + React preset provides the exact configuration needed to demonstrate full-stack AdonisJS patterns.

**Initialization Command:**
```bash
npm init adonisjs@latest adonis_react_app -- --kit=inertia --adapter=react --ssr=false
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript ~6.0.2 throughout — backend and frontend share same TS config base (`@adonisjs/tsconfig`)
- Node.js ≥24.0.0 required (ESM-native: `"type": "module"`)
- Two TS projects: root `tsconfig.json` (backend) and `inertia/tsconfig.json` (frontend React), linked via project references

**Styling Solution:**
- Twitter Bootstrap (to be added by developer — not in scaffold default)
- Vite handles CSS bundling via `inertia/css/` directory
- No Tailwind, no Styled Components — plain Bootstrap CSS

**Build Tooling:**
- Vite ^7 with `@vitejs/plugin-react` for frontend bundling + HMR
- `@adonisjs/vite` client plugin for backend↔Vite integration
- `node ace build` for production build (compiles TS + bundles assets)
- `node ace serve --hmr` for development with hot module replacement
- `hot-hook` enables backend HMR on controller/model changes

**Testing Framework:**
- Japa test runner (`@japa/runner ^5.3.0`)
- `@japa/assert` for assertions
- `@japa/plugin-adonisjs` for AdonisJS HTTP testing utilities
- `@japa/browser-client` for browser-based E2E testing
- `node ace test` to run

**Code Organization (Established by Scaffold):**
- Backend: `app/controllers/`, `app/models/`, `app/middleware/`, `app/validators/`, `app/policies/`, `app/services/`, `app/exceptions/`
- Frontend: `inertia/pages/`, `inertia/layouts/`, `inertia/css/`
- Config: `config/` (auth, database, session, shield, etc.)
- DB: `database/migrations/`, `database/seeders/`
- Routes: `start/routes.ts`
- Path aliases: `#controllers/*`, `#models/*`, `#validators/*`, etc. (Node.js import map in `package.json`)

**Key Libraries Pre-included:**
- `@adonisjs/auth ^10.1.0` — session-based auth (already configured)
- `@adonisjs/lucid ^22.4.2` — ORM with SQLite via `better-sqlite3`
- `@adonisjs/session ^8.1.0` — server-side sessions
- `@adonisjs/shield ^9.0.0` — CSRF protection, security headers
- `@adonisjs/inertia ^4.2.0` + `@inertiajs/react ^2.3.18`
- `@vinejs/vine ^4.3.1` — schema-based server-side form validation
- `@tuyau/core ^1.2.2` — type-safe route URL generation
- `luxon ^3.7.2` — date/time handling
- `sonner ^2.0.7` — toast notifications (React)

**Development Experience:**
- ESLint via `@adonisjs/eslint-config` (AdonisJS opinionated config)
- Prettier via `@adonisjs/prettier-config`
- `typecheck` script validates both backend and frontend TS projects
- Vite SSR entrypoint exists but SSR is disabled (`ssr: { enabled: false }`)

**Note:** Project initialization is complete. First implementation story should configure the database, run existing migrations scaffold, and add Bootstrap to the Inertia layout.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data model for social links (separate table)
- Tag create-or-find strategy (inline on post form)
- Authorization approach (Bouncer Policies)
- Inertia shared data shape

**Important Decisions (Shape Architecture):**
- Pagination strategy (Lucid offset-based)
- Error handling (named exception classes)
- React page component structure (domain subfolders)
- Seeding strategy (main seeder + sub-seeders)

**Deferred Decisions (Post-MVP):**
- Production DB configuration
- Deployment / CI-CD
- Email/notification infrastructure

### Data Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Database | SQLite via `better-sqlite3` | Local dev only; teachable, zero-config |
| ORM | Lucid ORM (^22) | AdonisJS built-in; demonstrates relationships, migrations, hooks |
| Validation | VineJS (`@vinejs/vine ^4.3.1`) | AdonisJS native; teaches schema-based server-side validation |
| Migrations | Lucid migrations (`node ace make:migration`) | One migration per table; run with `node ace migration:run` |
| Social Links | Separate `user_social_links` table with `type` + `url` columns | Normalized; demonstrates `hasMany` pattern clearly |
| Tags | Many-to-many via `post_tags` pivot; inline find-or-create on post form | Teaches `belongsToMany` + pivot; no separate tag management UI |
| Likes | Two separate tables: `post_likes` and `comment_likes` | Avoids polymorphic ORM complexity; each relationship is explicit and learnable |
| Pagination | Lucid `.paginate()` (offset-based) on post lists and comments | Teachable; built into Lucid; no extra libraries |
| Caching | None (v1) | Local dev scope; no caching infrastructure needed |

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| Auth method | Session-based auth (`@adonisjs/auth ^10`) | AdonisJS native; teaches session guards, `auth.use('web')` |
| Password hashing | bcrypt via AdonisJS hash provider | Automatic via `AuthFinder` mixin; never plain-text |
| Route protection | Named middleware `auth` on all write routes | Demonstrates AdonisJS middleware application |
| Authorization | AdonisJS Bouncer **Policies** (`app/policies/`) | Explicit, testable, idiomatic; teaches the Bouncer pattern cleanly |
| CSRF | `@adonisjs/shield ^9` (pre-configured) | Auto-enabled; Inertia's `<Link>` and `useForm` handle CSRF token injection |
| Security headers | Shield provider (default config) | Content-Security-Policy, X-Frame-Options, etc. out of the box |

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| Server↔Client bridge | Inertia.js only — no REST API | Teaches the Inertia pattern; controller returns `inertia.render()` |
| Error handling | Named exception classes in `app/exceptions/` extending `HttpException` | Structured; teaches AdonisJS exception handling pattern |
| Validation errors | VineJS throws `E_VALIDATION_ERROR`; Inertia catches and surfaces per-field | Standard Inertia + VineJS integration — zero custom wiring needed |
| Route URLs | `@tuyau/core` for type-safe route URL generation | Prevents hardcoded URL strings; teaches Tuyau pattern |

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Framework | React ^19 via Inertia.js | Pre-configured in scaffold |
| SSR | Disabled | Simplifies setup; Inertia client-side navigation is sufficient for demo |
| State management | Inertia page props only — no Redux/Zustand/Context | Props passed per page render; no global state store needed |
| Component structure | Domain subfolders: `inertia/pages/posts/`, `inertia/pages/auth/`, `inertia/pages/users/` | Scales cleanly; mirrors backend controller grouping |
| Layouts | Single root layout in `inertia/layouts/MainLayout.tsx` with Bootstrap navbar/footer | Consistent shell across all pages via Inertia persistent layout |
| Inertia shared data | `{ auth: { user: User \| null }, flash: { success?, error? }, errors: Record<string, string> }` | Auth state + flash messages + validation errors available globally |
| Styling | Twitter Bootstrap (npm) — no custom CSS framework | Matches PRD; responsive by default; no build complexity |
| Toast notifications | `sonner ^2.0.7` driven by `flash` shared data | Pre-included in scaffold; lightweight |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Environment | Local development only (v1) | Per PRD scope |
| Database file | SQLite file in `tmp/` (gitignored) | Standard AdonisJS SQLite convention |
| Seeding | `MainSeeder` calls sub-seeders: `UserSeeder`, `PostSeeder`, `TagSeeder`, `CommentSeeder`, `LikeSeeder` | Single entry point (`node ace db:seed`); each entity seeder is independently readable |
| Logging | Pino (`pino-pretty` in dev) | Pre-configured in scaffold |
| Testing | Japa (`node ace test`) — HTTP functional tests per feature area | Teaches AdonisJS testing patterns |

### Decision Impact Analysis

**Implementation Sequence:**
1. Database config + migrations (users, posts, tags, post_tags, comments, post_likes, comment_likes, user_social_links)
2. Auth setup (User model + AuthFinder mixin + session guard)
3. Bouncer Policies (PostPolicy, CommentPolicy)
4. Core models + relationships (User, Post, Tag, Comment, PostLike, CommentLike, UserSocialLink)
5. Inertia middleware (shared data: auth user + flash + errors)
6. Controllers + validators per feature area
7. React page components per domain subfolder
8. Seeders (MainSeeder → sub-seeders)

**Cross-Component Dependencies:**
- Bouncer Policies depend on User model being defined first
- All write controllers depend on `auth` middleware + relevant Policy
- Inertia shared data middleware must be registered before any controller renders a page
- `@tuyau/core` route types are generated after routes are defined — run `node ace tuyau:generate`

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

6 areas where AI agents could make incompatible choices without explicit rules.

### Naming Patterns

**Database Naming Conventions:**
- Table names: `snake_case` plural — `users`, `posts`, `post_tags`, `post_likes`, `comment_likes`, `user_social_links`
- DB columns in migrations: `snake_case` — `user_id`, `created_at`, `updated_at`
- Model properties: `camelCase` (Lucid auto-maps via naming strategy) — `userId`, `createdAt`
- Foreign keys: `{entity}_id` — `user_id`, `post_id`
- Pivot tables: `{entity1}_{entity2}` alphabetical — `post_tags`
- Index naming: `{table}_{column}_index` — `users_email_index`

```ts
// ✅ Correct migration column names
table.integer('user_id').notNullable()
table.timestamp('created_at').notNullable()

// ✅ Correct model property (Lucid auto-maps)
@column()
declare userId: number

// ❌ Do not define model properties as snake_case
declare user_id: number
```

**Route Naming Conventions:**
- RESTful plural resource routes throughout
- Pattern: `GET /posts`, `GET /posts/:id`, `GET /posts/:id/edit`, `POST /posts`, `PUT /posts/:id`, `DELETE /posts/:id`
- Nested resources: `POST /posts/:postId/comments`, `DELETE /posts/:postId/comments/:id`
- Like toggles: `POST /posts/:postId/likes`, `DELETE /posts/:postId/likes`
- Auth routes: `/register`, `/login`, `/logout`
- Profile: `/users/:username`

```ts
// ✅ Correct route pattern
router.resource('posts', '#controllers/posts_controller').apiOnly()
router.post('/posts/:postId/comments', '#controllers/comments_controller.store')

// ❌ Avoid singular or inconsistent casing
router.get('/post/:id', ...)
```

**Code Naming Conventions:**
- Controllers: `snake_case` file + PascalCase class — `posts_controller.ts` → `PostsController`
- Models: `snake_case` file + PascalCase class — `post.ts` → `Post`
- Policies: `snake_case` file + PascalCase class — `post_policy.ts` → `PostPolicy`
- Validators: `snake_case` file — `create_post_validator.ts`, `update_post_validator.ts`
- Middleware: `snake_case` file — `auth_middleware.ts`
- React pages: PascalCase file matching domain/action — `inertia/pages/posts/PostShow.tsx`
- React components: PascalCase file + named export — `CommentList.tsx` → `export function CommentList`
- TypeScript functions: `camelCase` — `getPaginatedPosts()`, `toggleLike()`

### Structure Patterns

**Project Organization:**
- All tests in `tests/` — never co-located with source
- Structure mirrors `app/`: `tests/functional/posts.spec.ts`, `tests/unit/models/post.spec.ts`
- Shared React components (used across domains): `inertia/components/`
- No `utils/` or `helpers/` catch-all directories — logic belongs in models, services, or validators

**Test Structure:**
```
tests/
  functional/        ← HTTP-level tests (controllers, routes)
    auth.spec.ts
    posts.spec.ts
    comments.spec.ts
    likes.spec.ts
    users.spec.ts
  unit/              ← Model/service unit tests (if needed)
    models/
```

**Page Component Structure:**
```
inertia/pages/
  auth/
    Login.tsx
    Register.tsx
  posts/
    PostIndex.tsx
    PostShow.tsx
    PostCreate.tsx
    PostEdit.tsx
  users/
    UserProfile.tsx
```

### Format Patterns

**Inertia Page Props:**
- All prop names passed from controllers use `snake_case` to stay consistent with DB/API shape
- Example: `{ post_id, created_at, like_count, author_name }`
- Inertia shared data keys also `snake_case`: `auth.user`, `flash.success`, `errors`

```ts
// ✅ Controller: snake_case props
return inertia.render('posts/PostShow', {
  post: post.serialize(),   // Lucid serialize() outputs snake_case by default
  like_count: post.likesCount,
  can_edit: canEdit,
})

// ❌ Do not mix camelCase prop names
return inertia.render('posts/PostShow', { likeCount: post.likesCount })
```

**Date Display Format:**
- Controllers format dates using Luxon before passing to Inertia — never pass raw ISO strings
- Standard format: `"May 14, 2026"` for display dates, `"May 14, 2026 at 3:30 PM"` for timestamps
- React components receive pre-formatted strings — no date parsing in the frontend

```ts
// ✅ Controller formats date
created_at: post.createdAt.toFormat('MMM d, yyyy'),

// ❌ Do not pass raw timestamps to React
created_at: post.createdAt.toISO(),
```

### Process Patterns

**Auth & Ownership Pattern:**
```ts
// ✅ Every write action: auth check → fetch resource → policy check → mutate
async update({ params, request, auth, bouncer }: HttpContext) {
  const post = await Post.findOrFail(params.id)
  await bouncer.with(PostPolicy).authorize('edit', post)
  // ... proceed
}

// ❌ Never inline ownership checks
if (post.userId !== auth.user!.id) { ... }
```

**Eager Loading Rule:**
```ts
// ✅ Always eager load
const post = await Post.query()
  .where('id', params.id)
  .preload('author')
  .preload('tags')
  .preload('comments', (q) => q.preload('author'))
  .firstOrFail()

// ❌ Never lazy-load in controllers
await post.load('tags')
```

**Like Toggle Pattern:**
- Use `firstOrCreate` / `delete` pattern on `PostLike` / `CommentLike` models
- Return updated `like_count` and `user_has_liked` boolean via Inertia redirect

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `snake_case` for all DB migration column names
- Use `camelCase` for all Lucid model property names (let Lucid naming strategy map automatically)
- Use PascalCase for React page and component file names
- Pre-format all dates with Luxon in the controller — never in React
- Pass `snake_case` prop keys from controllers to Inertia page components
- Always use Bouncer Policies for authorization — never inline ownership checks
- Always eager-load relationships — never lazy-load in controller actions
- Place all tests in `tests/functional/` or `tests/unit/` — never co-locate

## Project Structure & Boundaries

### Complete Project Directory Structure

```
adonis_react_app/
├── README.md                          ← Setup instructions + architecture walkthrough (FR39, FR40)
├── package.json
├── adonisrc.ts                        ← AdonisJS app config (providers, commands, aliases)
├── tsconfig.json                      ← Backend TypeScript config
├── tsconfig.inertia.json              ← Frontend TypeScript config
├── vite.config.ts                     ← Vite + Inertia + React plugins
├── eslint.config.js
├── ace.js                             ← AdonisJS CLI entrypoint
│
├── start/
│   ├── routes.ts                      ← All route definitions (single source of truth)
│   ├── kernel.ts                      ← Global middleware registration
│   └── env.ts                         ← Environment variable validation
│
├── config/
│   ├── app.ts
│   ├── auth.ts                        ← Session guard + User model binding
│   ├── database.ts                    ← SQLite connection config
│   ├── inertia.ts                     ← Inertia shared data config
│   ├── session.ts
│   ├── shield.ts                      ← CSRF + security headers
│   └── vite.ts
│
├── app/
│   ├── controllers/
│   │   ├── auth_controller.ts         ← register, login, logout (FR4–FR6)
│   │   ├── posts_controller.ts        ← index, show, create, store, edit, update, destroy (FR13–FR19)
│   │   ├── comments_controller.ts     ← store, destroy (FR24–FR25)
│   │   ├── post_likes_controller.ts   ← store, destroy (FR28–FR29)
│   │   ├── comment_likes_controller.ts← store, destroy (FR30–FR31)
│   │   ├── tags_controller.ts         ← index, show (FR22–FR23)
│   │   └── users_controller.ts        ← show, edit, update (FR8–FR12)
│   │
│   ├── models/
│   │   ├── user.ts                    ← hasMany Posts, Comments, SocialLinks; manyToMany Likes
│   │   ├── post.ts                    ← belongsTo User; hasMany Comments, PostLikes; belongsToMany Tags
│   │   ├── tag.ts                     ← belongsToMany Posts
│   │   ├── comment.ts                 ← belongsTo Post, User; hasMany CommentLikes
│   │   ├── post_like.ts               ← belongsTo Post, User
│   │   ├── comment_like.ts            ← belongsTo Comment, User
│   │   └── user_social_link.ts        ← belongsTo User; columns: type, url
│   │
│   ├── middleware/
│   │   ├── auth_middleware.ts         ← Redirects unauthenticated users (FR7)
│   │   ├── silent_auth_middleware.ts  ← Loads auth user if session exists (for public pages)
│   │   └── inertia_middleware.ts      ← Shares auth.user, flash, errors on every request
│   │
│   ├── validators/
│   │   ├── auth/
│   │   │   ├── register_validator.ts  ← username, email, password rules
│   │   │   └── login_validator.ts
│   │   ├── posts/
│   │   │   ├── create_post_validator.ts  ← title, body, tags[]
│   │   │   └── update_post_validator.ts
│   │   ├── comments/
│   │   │   └── create_comment_validator.ts
│   │   └── users/
│   │       └── update_profile_validator.ts ← bio, social_links[]
│   │
│   ├── policies/
│   │   ├── post_policy.ts             ← edit, delete: userId === auth.user.id
│   │   └── comment_policy.ts          ← delete: userId === auth.user.id
│   │
│   └── exceptions/
│       └── handler.ts                 ← Global exception handler (Inertia error pages)
│
├── database/
│   ├── migrations/
│   │   ├── TIMESTAMP_create_users_table.ts
│   │   ├── TIMESTAMP_create_posts_table.ts
│   │   ├── TIMESTAMP_create_tags_table.ts
│   │   ├── TIMESTAMP_create_post_tags_table.ts    ← pivot: post_id, tag_id
│   │   ├── TIMESTAMP_create_comments_table.ts
│   │   ├── TIMESTAMP_create_post_likes_table.ts   ← post_id, user_id (unique)
│   │   ├── TIMESTAMP_create_comment_likes_table.ts← comment_id, user_id (unique)
│   │   └── TIMESTAMP_create_user_social_links_table.ts ← user_id, type, url
│   │
│   └── seeders/
│       ├── main_seeder.ts             ← Calls all sub-seeders in order (FR37, FR38)
│       ├── user_seeder.ts
│       ├── post_seeder.ts
│       ├── tag_seeder.ts
│       ├── comment_seeder.ts
│       └── like_seeder.ts
│
├── inertia/
│   ├── app.tsx                        ← Inertia client entrypoint
│   ├── ssr.tsx                        ← SSR entrypoint (disabled but present)
│   ├── types.ts                       ← Shared TypeScript types (PageProps, User, Post, etc.)
│   │
│   ├── layouts/
│   │   └── MainLayout.tsx             ← Bootstrap navbar, flash toasts, footer
│   │
│   ├── components/                    ← Shared components used across domains
│   │   ├── Pagination.tsx
│   │   ├── LikeButton.tsx
│   │   ├── TagBadge.tsx
│   │   └── FlashMessage.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx              ← FR5
│   │   │   └── Register.tsx           ← FR4
│   │   ├── posts/
│   │   │   ├── PostIndex.tsx          ← FR17, FR19, FR23
│   │   │   ├── PostShow.tsx           ← FR18, FR26, FR27, FR32, FR33
│   │   │   ├── PostCreate.tsx         ← FR13, FR14, FR20, FR21, FR34, FR35
│   │   │   └── PostEdit.tsx           ← FR15, FR34, FR35
│   │   └── users/
│   │       ├── UserProfile.tsx        ← FR8, FR9, FR12
│   │       └── UserEdit.tsx           ← FR10, FR11
│   │
│   └── css/
│       └── app.css                    ← Bootstrap import + minimal global styles
│
├── resources/
│   └── views/
│       └── inertia_layout.edge        ← Root HTML shell (loads Vite assets + Inertia div)
│
├── tests/
│   ├── bootstrap.ts
│   ├── functional/
│   │   ├── auth.spec.ts
│   │   ├── posts.spec.ts
│   │   ├── comments.spec.ts
│   │   ├── likes.spec.ts
│   │   └── users.spec.ts
│   └── unit/
│       └── models/
│
└── tmp/
    └── db.sqlite3                     ← SQLite DB file (gitignored)
```

### Architectural Boundaries

**Inertia Boundary (Server ↔ Client):**
- Controllers are the ONLY place that calls `inertia.render()` — no direct JSON responses to frontend
- React pages receive typed props — define all page prop shapes in `inertia/types.ts`
- Flash messages and validation errors cross the boundary via Inertia's session flash mechanism

**Authorization Boundary:**
- `auth_middleware.ts` guards all write routes at the route level
- `PostPolicy` / `CommentPolicy` guard resource-level ownership inside controllers
- Public read routes use `silent_auth_middleware` only

**Data Access Boundary:**
- Controllers query models directly — no repository layer
- All DB access goes through Lucid models — no raw SQL queries
- Eager loading is enforced in controllers — models do not trigger lazy loads

### Requirements to Structure Mapping

| FR Category | Controller | Model(s) | Pages | Validator(s) |
|---|---|---|---|---|
| Auth (FR1–7) | `auth_controller` | `User` | `auth/Login`, `auth/Register` | `login_validator`, `register_validator` |
| Profiles (FR8–12) | `users_controller` | `User`, `UserSocialLink` | `users/UserProfile`, `users/UserEdit` | `update_profile_validator` |
| Posts (FR13–19) | `posts_controller` | `Post`, `Tag` | `posts/PostIndex`, `PostShow`, `PostCreate`, `PostEdit` | `create_post_validator`, `update_post_validator` |
| Tags (FR20–23) | `posts_controller` + `tags_controller` | `Tag` | `posts/PostIndex` (filter) | (inline in post validators) |
| Comments (FR24–27) | `comments_controller` | `Comment` | `posts/PostShow` | `create_comment_validator` |
| Likes (FR28–33) | `post_likes_controller`, `comment_likes_controller` | `PostLike`, `CommentLike` | `posts/PostShow` | none |
| Validation (FR34–36) | all write controllers | — | all form pages | all validators |
| Seed (FR37–38) | — | all models | — | — |

**Cross-Cutting Concerns:**

| Concern | Location |
|---|---|
| Auth state on every page | `inertia_middleware.ts` → `inertia.share()` |
| Flash messages | `inertia_middleware.ts` + `MainLayout.tsx` + `FlashMessage.tsx` |
| CSRF protection | `@adonisjs/shield` (global, auto) |
| Ownership checks | `PostPolicy`, `CommentPolicy` in `app/policies/` |
| Eager loading | Enforced per controller action |
| Pagination | `Pagination.tsx` component + Lucid `.paginate()` in controllers |

### Data Flow

```
Browser request
  → AdonisJS router (start/routes.ts)
  → Named middleware chain (silent_auth or auth)
  → Inertia middleware (shares auth.user, flash, errors)
  → Controller action
    → VineJS validator (throws E_VALIDATION_ERROR on failure)
    → Bouncer policy check (throws E_AUTHORIZATION_FAILURE on failure)
    → Lucid model query (with preloads)
    → inertia.render('domain/PageName', { snake_case_props })
  → Inertia protocol → React page component
  → MainLayout renders Bootstrap shell + page content
```

### Development Workflow

```bash
node ace serve --hmr          # Dev server with HMR
node ace migration:run         # Run pending migrations
node ace db:seed               # Load seed data via MainSeeder
node ace test                  # Run Japa test suite
npm run typecheck              # Validate backend + frontend TS
npm run lint                   # ESLint
node ace tuyau:generate        # Regenerate type-safe route URLs
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All library versions are mutually compatible: AdonisJS ^7 + Lucid ^22 + Inertia ^4 + React ^19 + VineJS ^4 + Auth ^10 + Shield ^9. No version conflicts detected.

**Pattern Consistency:**
`snake_case` DB columns → Lucid auto-camelization → `snake_case` Inertia props forms a consistent, unambiguous data flow. Bouncer Policies + `auth_middleware` + VineJS validators create a clean 3-layer guard chain (route → resource → data).

**Structure Alignment:**
Controller grouping, page component domain subfolders, and validator subfolders all follow the same domain taxonomy (auth, posts, comments, likes, users). Consistent mental model across all layers.

### Requirements Coverage Validation ✅

All 40 Functional Requirements are architecturally supported:

| FR Range | Area | Covered By |
|---|---|---|
| FR1–3 | Public read access | `silent_auth_middleware` + public routes |
| FR4–7 | Authentication | `auth_controller` + session guard + `auth_middleware` |
| FR8–12 | User profiles | `users_controller` + `UserSocialLink` model |
| FR13–19 | Post CRUD + pagination | `posts_controller` + Lucid `.paginate()` |
| FR20–23 | Tagging (many-to-many) | Find-or-create in `posts_controller` + `tags_controller` |
| FR24–27 | Comments | `comments_controller` + `CommentPolicy` |
| FR28–33 | Likes (posts + comments) | `post_likes_controller` + `comment_likes_controller` + separate tables |
| FR34–36 | Form validation + errors | VineJS + Inertia error surfacing via shared `errors` prop |
| FR37–38 | Seed data | `MainSeeder` + 5 sub-seeders |
| FR39–40 | README + architecture docs | `README.md` + this document |

**Non-Functional Requirements:**
- ✅ Security: bcrypt (hash provider) + Shield (CSRF/headers) + Bouncer (ownership) + auth middleware (route guards)
- ✅ Performance: Eager loading enforced as mandatory pattern rule — N+1 queries architecturally prevented
- ✅ Maintainability: Idiomatic AdonisJS patterns documented with anti-patterns explicitly called out

### Gap Analysis Results

**Gap 1 (Resolved) — PageProps type:**
Added `PageProps` interface definition to `inertia/types.ts` as the canonical shared data shape:
```ts
export interface PageProps {
  auth: { user: User | null }
  flash: { success?: string; error?: string }
  errors: Record<string, string>
}
```
All Inertia page components must type their props extending `PageProps`.

**Gap 2 (Resolved) — Tag filtering route:**
Tag filtering (FR22) lives in `TagsController.show` at `GET /tags/:slug`.
`/tags/adonisjs` displays all posts tagged with `adonisjs` — keeps `PostsController` clean.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (40 FRs, 3 NFRs)
- [x] Scale and complexity assessed (Low — local dev monolith)
- [x] Technical constraints identified (stack locked, no API, no real-time)
- [x] Cross-cutting concerns mapped (auth, ownership, eager loading, shared data)

**✅ Architectural Decisions**
- [x] Critical decisions documented with library versions
- [x] Technology stack fully specified (7 core libraries)
- [x] Data model strategy defined (8 tables, no polymorphic likes)
- [x] Authorization strategy defined (Bouncer Policies)

**✅ Implementation Patterns**
- [x] Naming conventions established (DB, routes, code, files)
- [x] Structure patterns defined (tests/, pages/, components/)
- [x] Inertia prop format specified (snake_case, pre-formatted dates)
- [x] Process patterns documented (eager loading, ownership, like toggle)

**✅ Project Structure**
- [x] Complete directory structure defined (all files named)
- [x] Component boundaries established (3-layer guard chain)
- [x] Integration points mapped (Inertia boundary, data flow diagram)
- [x] All 40 FRs mapped to specific files/controllers/pages

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — stack is pre-scaffolded, decisions are fully specified, all FRs are mapped to concrete files, and consistency rules prevent agent divergence.

**Key Strengths:**
- Stack is already scaffolded — no initialization ambiguity
- Every FR maps to a specific controller + model + page
- Anti-patterns explicitly documented with code examples
- Data flow is linear and unambiguous (request → middleware → controller → Inertia → React)

**Areas for Future Enhancement (Post-MVP):**
- Add tag autocomplete on post form (requires client-side fetch)
- Pagination of comments on `PostShow` (currently loads all)
- Post search / filtering beyond tag (Phase 2 per PRD)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently — refer to anti-pattern examples
- Respect project structure: controllers → models → validators → policies → pages
- All dates formatted in controller via Luxon before passing to React
- Run `node ace tuyau:generate` after any route changes

**First Implementation Priority:**
1. Configure `config/database.ts` for SQLite
2. Write all 8 migrations and run `node ace migration:run`
3. Define all 7 models with relationships
4. Add Bootstrap to `inertia/css/app.css` and `MainLayout.tsx`
5. Implement auth flow (register, login, logout) end-to-end
