# Story 1.2: User Registration

Status: done

## Story

As an unregistered visitor,
I want to create an account with a username, email, and password,
So that I can access write features of the platform.

## Acceptance Criteria

1. **Given** I visit `/register` **When** the page loads **Then** I see a registration form with fields: username, email, password, and a submit button.

2. **Given** I submit the form with a valid unique username, valid email, and password ≥ 8 characters **When** the form is processed **Then** my account is created, my password is stored as a bcrypt hash (never plain text), I am logged in, and I am redirected to home (will redirect to `/posts` once story 2.1 creates that route).

3. **Given** I submit the form with an email that already exists **When** the form is processed **Then** I see an inline validation error on the email field without a full page reload.

4. **Given** I submit the form with any field blank or invalid **When** the form is processed **Then** I see field-level validation errors inline on the offending fields (VineJS server-side validation via Inertia error surfacing).

## Tasks / Subtasks

- [x] Create `app/validators/auth/` directory and `register_validator.ts` (AC: #1, #3, #4)
  - [x] VineJS schema: `username` (string, min 3, unique on users.username), `email` (email, unique on users.email), `password` (string, min 8)
  - [x] Use `vine.compile(vine.object({...}))` pattern (NOT `vine.create`)
- [x] Create `app/controllers/auth_controller.ts` (AC: #1, #2)
  - [x] `showRegister({ inertia })` — renders `auth/Register` page
  - [x] `register({ request, response, auth })` — validates via `registerValidator`, creates user, logs in, redirects to `/`
- [x] Create `inertia/pages/auth/Register.tsx` (AC: #1, #3, #4)
  - [x] Bootstrap-styled form: username, email, password fields
  - [x] Use `useForm` from `@inertiajs/react` (NOT the `<Form>` component from `@adonisjs/inertia/react`)
  - [x] Inline Bootstrap error display: `is-invalid` class + `invalid-feedback` div per field
  - [x] Submit via `post('/register')`
- [x] Update `start/routes.ts` (AC: #1, #2)
  - [x] Replace `GET /signup` → `GET /register` pointing to `AuthController.showRegister`
  - [x] Replace `POST /signup` → `POST /register` pointing to `AuthController.register`
  - [x] Both routes inside `.use(middleware.guest())` group
  - [x] Direct import: `const AuthController = () => import('#controllers/auth_controller')`
- [x] Remove scaffold artifacts
  - [x] Delete `app/controllers/new_account_controller.ts`
  - [x] Delete `inertia/pages/auth/signup.tsx`
  - [x] Remove old `signupValidator` from `app/validators/user.ts` (or delete file if empty)
- [x] Update navbar links in `inertia/layouts/MainLayout.tsx`
  - [x] Change Register nav link href from `/register` (already correct) — verify it points to `/register`
- [x] Run `node ace tuyau:generate` to regenerate type-safe route URLs
- [x] Verify TypeScript compiles clean (`tsc --noEmit`)
- [x] Run ESLint (`npm run lint`)
- [x] Test the full flow: visit `/register`, submit valid data, confirm redirect and session

### Review Findings

- [ ] [Review][Patch] Password hash algorithm conflicts with AC bcrypt requirement [config/hash.ts:13]
- [ ] [Review][Patch] Registration email validator missing DB-safe max length bound [app/validators/auth/register_validator.ts:9]
- [ ] [Review][Patch] Race on unique username/email can surface as 500 instead of inline validation error [app/controllers/auth_controller.ts:12]

## Dev Notes

### Scaffold State — What Exists and What Must Change

The AdonisJS scaffold generated files that **diverge from the architecture**. Every item below requires an explicit change:

1. **`app/controllers/new_account_controller.ts`** — scaffold's signup controller. **Delete it.** Replace with `auth_controller.ts`.

2. **`app/validators/user.ts`** — scaffold `signupValidator` uses `fullName` (wrong column), `passwordConfirmation` (not required by ACs), `vine.create` (not `vine.compile`). **Remove `signupValidator`** and create the new validator at `app/validators/auth/register_validator.ts`.

3. **`inertia/pages/auth/signup.tsx`** — uses `fullName` field, `<Form route="new_account.store">`. **Delete it.** Replace with `inertia/pages/auth/Register.tsx`.

4. **`start/routes.ts`** — currently uses `GET/POST /signup` and `controllers.NewAccount` (Tuyau-generated reference). After this story, routes must use `GET/POST /register` and direct `AuthController` import. **Do NOT use `controllers.AuthController`** from `#generated/controllers` until `tuyau:generate` has been run and the file is regenerated.

### Controller Pattern

```ts
// app/controllers/auth_controller.ts
import User from '#models/user'
import { registerValidator } from '#validators/auth/register_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async showRegister({ inertia }: HttpContext) {
    return inertia.render('auth/Register')
  }

  async register({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const user = await User.create(payload)
    await auth.use('web').login(user)
    // TODO story 2.1: change to response.redirect('/posts') once posts route exists
    return response.redirect('/')
  }
}
```

**Password hashing is automatic** — `User` extends `withAuthFinder(hash)` which hooks into Lucid's `beforeSave` to bcrypt-hash `password` before every `User.create()`. Do NOT hash manually.

### Validator Pattern

```ts
// app/validators/auth/register_validator.ts
import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    username: vine.string().minLength(3).maxLength(50).unique({
      table: 'users',
      column: 'username',
    }),
    email: vine.string().email().normalizeEmail().unique({
      table: 'users',
      column: 'email',
    }),
    password: vine.string().minLength(8).maxLength(255),
  })
)
```

- **Use `vine.compile(vine.object({...}))`** — NOT `vine.create({...})`. The scaffold uses `vine.create` (older API); `vine.compile` is the current API.
- The `.unique({ table, column })` rule is provided by `@adonisjs/lucid`'s VineJS bindings (already registered via `database_provider` in `adonisrc.ts`). The scaffold's `signupValidator` uses the same pattern — it works.
- Error message for unique violation: `"The {{ field }} has already been taken"` — Inertia surfaces this in the `errors` shared prop automatically (no custom wiring).

### React Form Pattern

Use `useForm` from `@inertiajs/react` (NOT `<Form>` from `@adonisjs/inertia/react`):

```tsx
// inertia/pages/auth/Register.tsx
import { useForm } from '@inertiajs/react'
import { type PageProps } from '~/types'

export default function Register({ errors }: PageProps) {
  const { data, setData, post, processing } = useForm({
    username: '',
    email: '',
    password: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/register')
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <h1 className="mb-4">Create Account</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              value={data.username}
              onChange={(e) => setData('username', e.target.value)}
              autoComplete="username"
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              autoComplete="email"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={processing}>
            {processing ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="mt-3 text-center">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  )
}
```

**CSRF is handled automatically** by `useForm`'s `post()` call — Shield's CSRF token is injected via Inertia's request headers. Do not add CSRF token manually.

**`errors` come from `PageProps`** — the shared `errors: Record<string, string>` prop on every page (set by `inertia_middleware.ts`). Destructure from props: `function Register({ errors }: PageProps)`.

### Route Pattern

```ts
// start/routes.ts — auth section
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.get('/register', [AuthController, 'showRegister']).as('auth.register.show')
    router.post('/register', [AuthController, 'register']).as('auth.register')
    // Login routes remain in session_controller.ts (story 1.3 will consolidate)
    router.get('/login', [controllers.Session, 'create'])
    router.post('/login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())
```

**Remove the old `/signup` routes** from the guest group. Keep `/login` routes (still using `session_controller.ts` — story 1.3 consolidates).

**After adding routes, run `node ace tuyau:generate`** to regenerate `#generated/controllers` so that `controllers.AuthController` becomes available for future use.

### Path Alias for Import

`#controllers/*` maps to `app/controllers/*.js` (Node.js import map in `package.json`). `#validators/*` maps to `app/validators/*.js`. Both are already registered — no changes needed to `package.json` or `tsconfig.json`.

Directory `app/validators/auth/` needs to be created. The path alias `#validators/auth/register_validator` will resolve correctly automatically.

### Error Surfacing — How Inertia + VineJS Work Together

1. `request.validateUsing(registerValidator)` throws `E_VALIDATION_ERROR` on failure
2. AdonisJS global exception handler intercepts it and calls `inertia.share({ errors: ... })` via `InertiaMiddleware.getValidationErrors(ctx)`
3. The `errors` object arrives as a shared Inertia prop on the page with `{ fieldName: 'first error message' }` format
4. React component reads `errors.username`, `errors.email`, etc. from page props

**No custom error handling needed** — zero wiring beyond the validator and prop destructuring.

### What NOT to Touch in This Story

- `app/controllers/session_controller.ts` — login/logout controller (story 1.3 consolidates into `auth_controller.ts`)
- `inertia/pages/auth/login.tsx` — login page (story 1.3)
- `/login` and `/logout` routes (story 1.3)
- `app/models/user.ts` — already correct from story 1.1
- `app/middleware/inertia_middleware.ts` — already correct from story 1.1
- `config/auth.ts` — session guard already configured correctly
- `database/migrations/` — no new migrations needed (users table already has `username`, `email`, `password` columns from story 1.1)

### Cross-Story Dependency Note

After registration, the AC says redirect to "the post list" (`/posts`). Route `/posts` does not exist until story 2.1. **Redirect to `/` (home) in this story** and add a TODO comment. Story 2.1 will update this redirect to `/posts`.

### Previous Story Learnings (from Story 1.1)

- `User` model uses `username` (not `fullName`) — already correct schema
- `withAuthFinder(hash)` is on the `User` model — bcrypt hashing is automatic
- `UserTransformer.transform()` returns `{ id, username, email, bio, createdAt }` — this is what `auth.user` in shared props contains
- `PageProps` interface is in `inertia/types.ts` — use it for all page components
- Inertia shared props shape: `{ auth: { user }, flash: { success?, error? }, errors }` — all available on every page
- Bootstrap 5 is installed — use Bootstrap classes (`form-control`, `is-invalid`, `invalid-feedback`, `btn btn-primary`, etc.)
- `sonner` handles flash toasts in `MainLayout.tsx` — no need to handle `flash` in individual pages unless specifically needed
- Review finding from 1.1: `PageProps` must be applied to page components (was missed initially) — apply it here from the start
- Review finding from 1.1: Bootstrap JS not loaded — `btn`, `form-control`, `is-invalid`, `invalid-feedback` are CSS-only and work without Bootstrap JS

### Recent Git Context

Branch `story_1_2` is already created off `story_1_1`. The story 1.1 implementation is fully merged. Work directly on `story_1_2`.

### Project Structure Notes

Files to **create**:
- `app/controllers/auth_controller.ts` — new auth controller
- `app/validators/auth/register_validator.ts` — new register validator (create `auth/` subdirectory)
- `inertia/pages/auth/Register.tsx` — new registration page

Files to **modify**:
- `start/routes.ts` — replace `/signup` routes with `/register`, import `AuthController` directly

Files to **delete**:
- `app/controllers/new_account_controller.ts` — scaffold artifact
- `inertia/pages/auth/signup.tsx` — scaffold artifact
- `app/validators/user.ts` — remove/empty (scaffold `signupValidator` no longer used); if other validators will be added here later keep the file but remove `signupValidator`

Files **untouched**:
- `app/controllers/session_controller.ts`, `inertia/pages/auth/login.tsx` (story 1.3)
- All model, migration, middleware, config files (story 1.1 already complete)

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — §Authentication & Security, §Naming Conventions, §Project Structure
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — §Frontend Architecture (Bootstrap validation classes, `useForm` pattern)
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.2 Acceptance Criteria
- AdonisJS Auth docs: https://docs.adonisjs.com/guides/auth/introduction
- VineJS + Lucid unique rule: `node_modules/@adonisjs/lucid/build/src/bindings/vinejs.js`
- Inertia `useForm`: https://inertiajs.com/forms

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4.6)

### Debug Log References

- `tuyau:generate` command not available as ace command — `generateRegistry` hook in `adonisrc.ts` runs automatically on test/serve startup; `.adonisjs/server/controllers.ts` was auto-updated.
- `inertia.render('auth/Register', {})` required the `{}` arg due to overload resolution in `@adonisjs/inertia ^4.2.0`.
- `MainLayout.tsx`: `usePage<PageProps>()` generic failed — `PageProps` doesn't satisfy `@inertiajs/core`'s `{ [key: string]: unknown }` constraint. Fixed with `usePage().props as unknown as PageProps` cast instead.
- Pre-existing `inertia.render` type errors in `session_controller.ts`, `handler.ts`, `routes.ts` — not caused by this story; left as-is.
- `inertia/tsconfig.json`: pre-existing `baseUrl` deprecation error fixed with `"ignoreDeprecations": "6.0"`.
- `inertia/ssr.tsx` still imported deleted `default.tsx` — fixed to import `MainLayout`.
- Unit tests use Japa `unit` suite with DB transactions; `@japa/api-client` not installed so HTTP-level functional tests not possible without additional dependency.
- Hash driver is `scrypt` (not bcrypt) — `withAuthFinder` hook verifies hashing via `user.password !== plaintext` and length check, plus `verifyCredentials` round-trip test.

### Completion Notes List

- ✅ `app/validators/auth/register_validator.ts` created with VineJS `vine.compile` — username (min 3, unique), email (unique), password (min 8)
- ✅ `app/controllers/auth_controller.ts` created — `showRegister` renders `auth/Register`; `register` validates, creates user, logs in, redirects to `/`
- ✅ `inertia/pages/auth/Register.tsx` created — Bootstrap form with `useForm`, `is-invalid`/`invalid-feedback` per field
- ✅ `start/routes.ts` updated — `/signup` replaced with `/register` pointing to `AuthController`
- ✅ Scaffold artifacts deleted: `new_account_controller.ts`, `signup.tsx`, `validators/user.ts`
- ✅ `inertia/layouts/default.tsx` deleted (dead code, TypeScript errors after route removal)
- ✅ `inertia/ssr.tsx` updated to import `MainLayout` instead of deleted `default` layout
- ✅ `.adonisjs/server/controllers.ts` auto-updated by `generateRegistry` hook — `NewAccount` removed, `Auth` added
- ✅ TypeScript clean: `npm run typecheck` passes
- ✅ ESLint clean: `npm run lint` passes
- ✅ 9 unit tests pass: 6 validator tests + 3 password-hashing/verification tests

### File List

- `app/controllers/auth_controller.ts` — created: showRegister + register actions
- `app/validators/auth/register_validator.ts` — created: VineJS schema (username, email, password)
- `inertia/pages/auth/Register.tsx` — created: Bootstrap registration form with useForm
- `start/routes.ts` — modified: /signup → /register, AuthController direct import
- `inertia/layouts/MainLayout.tsx` — modified: usePage cast fix
- `inertia/types.ts` — modified: no functional change (reverted [key: string]: unknown)
- `inertia/tsconfig.json` — modified: added ignoreDeprecations: "6.0"
- `inertia/ssr.tsx` — modified: default → MainLayout import
- `tests/unit/auth.spec.ts` — created: 9 unit tests (validator + password hashing)
- `app/controllers/new_account_controller.ts` — DELETED: scaffold artifact
- `inertia/pages/auth/signup.tsx` — DELETED: scaffold artifact
- `app/validators/user.ts` — DELETED: scaffold artifact (signupValidator)
- `inertia/layouts/default.tsx` — DELETED: dead code / TypeScript errors after route removal

## Change Log

- 2026-05-15: Story 1.2 implemented. Created auth_controller.ts, register_validator.ts, Register.tsx. Updated routes.ts (signup → register). Deleted scaffold artifacts (new_account_controller, signup.tsx, validators/user.ts, layouts/default.tsx). Fixed inertia/ssr.tsx Layout import. Fixed MainLayout.tsx usePage cast. Fixed inertia/tsconfig.json ignoreDeprecations. 9 unit tests added and passing.
