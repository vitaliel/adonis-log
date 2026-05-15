# Story 1.1: Project Foundation — Database, Bootstrap & Inertia Layout

Status: ready-for-dev

## Story

As a developer setting up the project,
I want the database configured, Bootstrap installed, and a consistent main layout in place,
So that I have a working, navigable application shell before any features are built.

## Acceptance Criteria

1. **Given** the AdonisJS + Inertia + React scaffold is already present **When** I run `node ace migration:run` **Then** a SQLite database is created at `tmp/db.sqlite3` with a `users` table containing columns: `id`, `username`, `email`, `password`, `bio` (nullable), `created_at`, `updated_at`.

2. **Given** Bootstrap is installed via npm **When** the Inertia app renders any page **Then** Bootstrap CSS is loaded and the layout uses Bootstrap grid classes.

3. **Given** `MainLayout.tsx` exists in `inertia/layouts/` **When** any page is rendered **Then** a Bootstrap navbar appears with the app name and navigation links, and a footer is present.

4. **Given** `inertia_middleware.ts` is registered **When** any request is made **Then** `auth.user` (or null), `flash.success`, `flash.error`, and `errors` are available as Inertia shared props on every page.

5. **Given** the `inertia_layout.edge` root HTML shell exists **When** the Inertia app loads in a browser **Then** Vite assets are loaded correctly and the `#app` div is present for React hydration.

6. **Given** the project root is set up **When** I inspect the repository **Then** an `.env.example` file exists documenting required environment variables (`APP_KEY`, `DB_CONNECTION`, etc.) with safe placeholder values, so that `cp .env.example .env` works as the first setup step.

## Tasks / Subtasks

- [ ] Fix users migration to match architecture schema (AC: #1)
  - [ ] Change `full_name` column → `username` (string, not nullable)
  - [ ] Add `bio` column (text, nullable)
  - [ ] Remove `full_name` column
- [ ] Update User model to match new schema (AC: #1)
  - [ ] Replace `fullName` property → `username: string`
  - [ ] Add `bio: string | null` property
  - [ ] Update `UserTransformer` to expose `username`, `bio` instead of `fullName`, `initials`
  - [ ] Update `initials` getter (if kept) to use `username` not `fullName`
- [ ] Install Bootstrap and wire CSS (AC: #2)
  - [ ] Run `npm install bootstrap`
  - [ ] Replace custom CSS in `inertia/css/app.css` with Bootstrap import: `@import 'bootstrap/dist/css/bootstrap.min.css';`
- [ ] Create `MainLayout.tsx` with Bootstrap navbar and footer (AC: #3)
  - [ ] Create `inertia/layouts/MainLayout.tsx` (Bootstrap navbar, `<main>` container, footer)
  - [ ] Navbar: app name link to `/`, nav links (Posts, Login, Register when unauthenticated; Posts, Logout when authenticated)
  - [ ] Render flash toasts via `sonner` (already in scaffold)
  - [ ] Update `inertia/app.tsx` to import `MainLayout` instead of `Layout from ~/layouts/default`
  - [ ] The old `inertia/layouts/default.tsx` can be replaced or removed
- [ ] Fix `inertia_middleware.ts` shared data shape (AC: #4)
  - [ ] Change `user:` key → nest under `auth: { user }` per architecture spec
  - [ ] Ensure `errors` and `flash` keys remain unchanged
- [ ] Add `PageProps` type to `inertia/types.ts` (AC: #4)
  - [ ] Add `PageProps` interface: `{ auth: { user: User | null }, flash: { success?: string; error?: string }, errors: Record<string, string> }`
  - [ ] All Inertia page components should extend `PageProps` for their props
- [ ] Create `.env.example` (AC: #6)
  - [ ] Document: `TZ`, `PORT`, `HOST`, `NODE_ENV`, `LOG_LEVEL`, `APP_KEY` (placeholder), `APP_URL`, `SESSION_DRIVER`, `DB_CONNECTION`
- [ ] Run migrations and verify DB (AC: #1)
  - [ ] Run `node ace migration:run` — confirm `tmp/db.sqlite3` created with correct `users` schema
- [ ] Verify application boots and layout renders (AC: #2, #3, #5)
  - [ ] Run `node ace serve --hmr` and confirm Bootstrap styles are visible and layout renders

## Dev Notes

### Critical Scaffold Divergences (Must Fix)

The scaffold was generated with defaults that **differ from architecture requirements**. Every item below requires an explicit change:

1. **`database/migrations/1761885935168_create_users_table.ts`** — uses `full_name` column, lacks `username` and `bio`. **Must** alter to: `username` (string, not nullable), `bio` (text, nullable). Drop `full_name` column.

2. **`app/models/user.ts`** — extends `UserSchema` which maps to `full_name`. After migration fix, update model: `declare username: string`, `declare bio: string | null`. The `initials` getter uses `this.fullName` — update or remove.

3. **`app/transformers/user_transformer.ts`** — currently picks `fullName`, `email`, `createdAt`, `updatedAt`, `initials`. Update to pick `id`, `username`, `email`, `bio`, `createdAt`.

4. **`inertia_middleware.ts`** currently shares `user:` at top level. Architecture requires nesting under `auth`:
   ```ts
   // ❌ Current (must change)
   return { user: ctx.inertia.always(...), ... }

   // ✅ Required
   return {
     auth: ctx.inertia.always({ user: auth?.user ? UserTransformer.transform(auth.user) : null }),
     flash: ctx.inertia.always({ error, success }),
     errors: ctx.inertia.always(this.getValidationErrors(ctx)),
   }
   ```

5. **`inertia/layouts/default.tsx`** — uses custom SVG, no Bootstrap. **Replace** with `MainLayout.tsx` using Bootstrap classes.

6. **`inertia/css/app.css`** — contains custom CSS variables and resets. **Replace** entirely with Bootstrap import (the Bootstrap CSS provides its own resets).

7. **`inertia/types.ts`** — uses `@generated/data` generated types. Add the `PageProps` interface defined by architecture alongside the existing generated types.

### User Model / Schema Note

The scaffold uses `UserSchema` from `#database/schema` (a generated Lucid schema class). After the migration change, ensure `UserSchema` (or wherever column definitions live) is updated to match. Check `database/` for a `schema/` folder or inline column decorators in the model. Use `@column()` decorators directly on `User` model if the schema import approach adds complexity.

### Layout Architecture

`inertia/app.tsx` uses:
```tsx
import Layout from '~/layouts/default'
// ...
(page: ReactElement<Data.SharedProps>) => <Layout children={page} />
```
After renaming to `MainLayout.tsx`, update this import. Use `~/layouts/MainLayout` via the `~` path alias (maps to `inertia/`).

### Bootstrap Installation

```bash
npm install bootstrap
```

Then in `inertia/css/app.css`:
```css
@import 'bootstrap/dist/css/bootstrap.min.css';
```

No Bootstrap JS bundle is needed for this story (dropdowns, modals come in later stories only if needed — Bootstrap CSS is sufficient for layout).

### Inertia Shared Props Shape

Architecture-required shape (all pages receive this via `@inertiajs/react`'s `usePage().props`):
```ts
export interface PageProps {
  auth: { user: User | null }
  flash: { success?: string; error?: string }
  errors: Record<string, string>
}
```
The `User` type in PageProps should match what `UserTransformer` returns: `{ id, username, email, bio, createdAt }`.

### MainLayout.tsx Structure

```tsx
// Bootstrap navbar with conditional auth links
// Uses usePage().props.auth.user to show Login/Register vs Logout
// Flash messages via sonner toast (already in scaffold — keep this pattern)
// <main className="container py-4">{children}</main>
// Footer with app name
```

Nav links for unauthenticated users: app name (home), Posts (`/posts`), Login (`/login`), Register (`/register`).
Nav links for authenticated users: app name, Posts, Logout (POST via Inertia `<Link method="post" href="/logout">`).

Routes `/posts`, `/login`, `/register`, `/logout` don't exist yet — use `href` strings for now; Tuyau-typed links come after routes are defined in Story 1.2.

### `.env.example` Content

```env
# Node
TZ=UTC
PORT=3333
HOST=localhost
NODE_ENV=development

# App
LOG_LEVEL=info
APP_KEY=<generate-with-node-ace-generate:key>
APP_URL=http://${HOST}:${PORT}

# Session
SESSION_DRIVER=cookie

# Database
DB_CONNECTION=sqlite
```

### Project Structure Notes

Files to create/modify in this story:
- **Modify**: `database/migrations/1761885935168_create_users_table.ts` — fix schema
- **Modify**: `app/models/user.ts` — username/bio columns
- **Modify**: `app/transformers/user_transformer.ts` — pick username/bio
- **Modify**: `app/middleware/inertia_middleware.ts` — nest user under `auth`
- **Modify**: `inertia/css/app.css` — Bootstrap import
- **Modify**: `inertia/types.ts` — add PageProps interface
- **Modify**: `inertia/app.tsx` — import MainLayout
- **Create**: `inertia/layouts/MainLayout.tsx` — Bootstrap navbar + footer layout
- **Create**: `.env.example`
- **Remove or keep for reference**: `inertia/layouts/default.tsx`

Do NOT touch: `resources/views/inertia_layout.edge` (correct as-is), `config/database.ts` (SQLite already configured to `tmp/db.sqlite3`), `start/kernel.ts` (inertia_middleware already in server stack), `adonisrc.ts` (no changes needed).

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — §Frontend Architecture, §Naming Patterns, §Project Structure
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — §Inertia shared data shape (Gap 1 resolved)
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.1 Acceptance Criteria
- AdonisJS Inertia docs: [https://docs.adonisjs.com/guides/views-and-templates/inertia](https://docs.adonisjs.com/guides/views-and-templates/inertia)

## Dev Agent Record

### Agent Model Used

_to be filled by dev agent_

### Debug Log References

### Completion Notes List

### File List
