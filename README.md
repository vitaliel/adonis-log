# AdonisLog

A full-stack blogging platform built with AdonisJS 6, demonstrating session authentication, Lucid ORM, Inertia.js, Bouncer Policies, and VineJS validation.

## Prerequisites

- **Git** (for cloning the repository)
- **Node.js** ≥ 24.0.0 (ESM-native runtime)
- **npm** (bundled with Node.js — no other global tools required)

## Local Setup

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

The application will be available at **http://localhost:3333**.

### Test Credentials

The seeder creates two demo users — either can be used to log in immediately:

| Email | Password |
|---|---|
| alice@example.com | password123 |
| bob@example.com | password123 |

### Running Tests

```bash
node ace test
```

## Architecture Overview

### AdonisJS Capabilities Demonstrated

| Capability | Details |
|---|---|
| **Session Auth** | `@adonisjs/auth ^10` — cookie-based sessions with bcrypt password hashing |
| **Lucid ORM** | `^22` — migrations, models, relationships, eager loading |
| **Inertia.js** | Server-driven React SPA — no REST API; controllers call `inertia.render()` |
| **Bouncer Policies** | `app/policies/` — `PostPolicy`, `CommentPolicy`, `UserPolicy` for ownership checks |
| **VineJS** | `@vinejs/vine ^4.3.1` — server-side schema validation in `app/validators/` |
| **Frontend** | React ^19, Bootstrap CSS, Vite HMR |
| **Database** | SQLite via `better-sqlite3` — zero-config, no database server needed |

### Key Architectural Decisions

**No polymorphic likes** — Two explicit tables (`post_likes`, `comment_likes`) are used instead of a polymorphic pattern. This keeps queries simple and type-safe.

**Inertia shared data shape** — The following data is available on every page via Inertia's shared data mechanism:

```ts
{
  auth: { user: User | null },
  flash: { success?: string, error?: string },
  errors: Record<string, string>
}
```

**Bouncer Policies for authorization** — All ownership-based access control lives in `app/policies/`. Controllers call `bouncer.authorize('edit', post)` rather than embedding ownership checks inline.

### Project Structure

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
