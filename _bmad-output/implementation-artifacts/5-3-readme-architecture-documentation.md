# Story 5.3: README & Architecture Documentation

Status: done

## Story

As a developer discovering AdonisLog on GitHub,
I want a clear README with setup instructions and an architectural walkthrough,
So that I can get the project running locally in under 15 minutes and understand how it demonstrates AdonisJS capabilities.

## Acceptance Criteria

1. **Given** I find the repository on GitHub **When** I read `README.md` **Then** I find: project description, prerequisites (Node.js version ≥24.0.0), step-by-step local setup commands (`git clone`, `npm install`, `cp .env.example .env`, `node ace generate:key`, `node ace migration:run`, `node ace db:seed`, `node ace serve --hmr`), and a note that the app is available at `http://localhost:3333`

2. **Given** I follow the README setup steps exactly **When** I run `node ace serve --hmr` **Then** the application starts without errors and I can browse the post list in a browser

3. **Given** I read the architectural section of the README **When** I review it **Then** it documents: the AdonisJS capabilities demonstrated (auth, Lucid ORM, Inertia.js, Bouncer, VineJS), key architectural decisions (no polymorphic likes, Inertia shared data shape, Bouncer Policies for authorization), and a brief project structure overview

## Tasks / Subtasks

- [x] Task 1: Create `README.md` at project root (AC: #1, #2)
  - [x] Project name and one-sentence description
  - [x] Prerequisites section: Node.js ≥24.0.0, npm (no other global tools needed)
  - [x] Setup section with exact commands in order (clone → install → .env → generate:key → migration:run → db:seed → serve --hmr)
  - [x] App URL: `http://localhost:3333`
  - [x] Brief note on test credentials from seeder (any seeded user email/password)

- [x] Task 2: Add Architectural Overview section to `README.md` (AC: #3)
  - [x] AdonisJS capabilities demonstrated (session auth, Lucid ORM, Inertia.js, Bouncer Policies, VineJS)
  - [x] Key architectural decisions subsection:
    - No polymorphic likes (two separate tables: `post_likes`, `comment_likes`)
    - Inertia shared data shape: `{ auth: { user }, flash: { success?, error? }, errors: Record<string, string> }`
    - Bouncer Policies in `app/policies/` for all ownership authorization
  - [x] Brief project structure overview matching actual source tree

- [x] Task 3: Verify accuracy — dry-run all setup commands mentally against actual project state (AC: #2)
  - [x] Confirm `.env.example` exists and contains all required keys
  - [x] Confirm `node ace generate:key` is the right command (not `key:generate` — corrected from story notes)
  - [x] Confirm migration and seed commands work on fresh SQLite database

### Review Findings

- [x] [Review][Decision] Resolve canonical APP_KEY command reference — kept `node ace generate:key` as canonical and aligned story references accordingly.
- [x] [Review][Patch] Add Git to prerequisites because setup requires `git clone` [README.md:7]

## Dev Notes

- **Only deliverable is `README.md` at the project root** — no code changes, no new files elsewhere
- `.env.example` already exists with all required keys (`APP_KEY`, `DB_CONNECTION=sqlite`, etc.)
- `APP_KEY` must be generated via `node ace generate:key` (writes to `.env`) — not manually copied
- The app uses SQLite so no database server setup is needed — pure zero-config local dev
- SSR is disabled; the app runs client-side React via Inertia — no SSR setup steps needed
- Dev command is `node ace serve --hmr` (not `npm run dev` — though that alias may exist; use the canonical ace command)

### Key Architectural Facts to Document

| Topic | Fact |
|---|---|
| Node.js version | ≥24.0.0 (ESM-native runtime) |
| Database | SQLite via `better-sqlite3` — zero setup |
| Auth | Session-based (`@adonisjs/auth ^10`), bcrypt passwords |
| ORM | Lucid ORM (^22) — migrations + eager loading |
| Validation | VineJS (`@vinejs/vine ^4.3.1`) — server-side schema validation |
| Authorization | Bouncer Policies in `app/policies/` — `PostPolicy`, `CommentPolicy`, `UserPolicy` |
| Server↔Client | Inertia.js only — no REST API; controllers call `inertia.render()` |
| Frontend | React ^19 via Inertia, Bootstrap CSS, Vite HMR |
| Likes design | Two explicit tables (`post_likes`, `comment_likes`); polymorphic pattern explicitly avoided |
| Inertia shared data | `auth.user`, `flash.success/error`, `errors` — available on every page |

### Project Structure Overview (for README)

```
app/
  controllers/   # HTTP controllers (PostsController, AuthController, etc.)
  models/        # Lucid ORM models
  policies/      # Bouncer authorization policies
  validators/    # VineJS validation schemas
database/
  migrations/    # One migration per table
  seeders/       # Demo content seeders
inertia/
  pages/         # React page components (auth/, posts/, users/)
  layouts/       # MainLayout.tsx (Bootstrap navbar/footer)
start/
  routes.ts      # All route definitions
tests/
  functional/    # Japa HTTP integration tests
```

### Setup Commands (Exact Sequence)

```bash
git clone <repo-url> adonis_react_app
cd adonis_react_app
npm install
cp .env.example .env
node ace generate:key          # writes APP_KEY into .env
node ace migration:run
node ace db:seed
node ace serve --hmr           # http://localhost:3333
```

### Previous Story Intelligence

From Story 5.2 (functional test suite — last story in the epic):
- The project is feature-complete and all tests pass (47/48; 1 pre-existing failure in `posts_public_read.spec.ts` unrelated to implementation)
- `node ace test` runs the full Japa suite — worth mentioning in README as a developer convenience
- All seeded users use plain passwords (auto-hashed by `beforeSave` hook) — the README can list a seeded user's email for quick login

From Story 5.1 (seed data):
- Seeder creates ≥2 users, ≥5 posts, ≥3 comments, and some likes
- Check `database/seeders/` for actual seeded user credentials to include in README

### References

- Story requirements: [Source: _bmad-output/planning-artifacts/epics.md#Story 5.3: README & Architecture Documentation]
- Architecture decisions: [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- Tech stack + versions: [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- Project structure: [Source: _bmad-output/planning-artifacts/architecture.md#Code Organization (Established by Scaffold)]
- `.env.example`: [Source: .env.example]
- FR39, FR40: [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 requirements traceability]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- Discovered that the correct Ace command is `generate:key` not `key:generate` (as written in Dev Notes). Verified via `node ace list`. README uses the correct command.

### Completion Notes List

- Created `README.md` at project root with project description, prerequisites (Node.js ≥24.0.0), exact setup command sequence, app URL, and seeded test credentials (alice@example.com / password123).
- Added Architecture Overview section covering all 5 AdonisJS capabilities (session auth, Lucid ORM, Inertia.js, Bouncer Policies, VineJS) plus key architectural decisions table and project structure tree.
- Verified `.env.example` exists with all required keys (APP_KEY, DB_CONNECTION, SESSION_DRIVER, PORT, HOST, APP_URL, LOG_LEVEL, TZ, NODE_ENV).
- Verified all 8 migration files exist in `database/migrations/`.
- Corrected command from `key:generate` → `generate:key` based on actual `node ace list` output.

### File List

- `README.md` (new)

## Change Log

- 2026-05-17: Created `README.md` with setup instructions and architecture documentation. Corrected `key:generate` → `generate:key` (actual Ace command name verified from project).
