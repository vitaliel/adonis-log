# Story 1.3: User Login & Logout

Status: ready-for-dev

## Story

As a registered user,
I want to log in with my email and password, and log out when done,
So that I can securely access my account and protect it when I leave.

## Acceptance Criteria

1. **Given** I visit `/login` **When** the page loads **Then** I see a login form with email and password fields.

2. **Given** I submit valid credentials **When** the form is processed **Then** I am authenticated, a session is established, and I am redirected to home (`/`).
   _(TODO story 2.1: redirect to `/posts` once that route exists.)_

3. **Given** I submit invalid credentials (wrong password or non-existent email) **When** the form is processed **Then** I see an inline error message without a full page reload.

4. **Given** I am logged in and click Logout **When** the logout action is processed **Then** my session is invalidated, I am redirected to home (`/`) as an unauthenticated visitor, and `auth.user` in shared props is `null`.
   _(TODO story 2.1: redirect to `/posts` once that route exists.)_

5. **Given** I am not logged in and attempt to navigate to a write-protected route (e.g., `/posts/create`) **When** the request is processed **Then** I am redirected to `/login` by the `auth_middleware`.

## Tasks / Subtasks

- [ ] Create `app/validators/auth/login_validator.ts` (AC: #1, #3)
  - [ ] VineJS schema: `email` (string, email, normalizeEmail), `password` (string, minLength(1))
  - [ ] Use `vine.compile(vine.object({...}))` pattern (NOT `vine.create`)
- [ ] Add `showLogin`, `login`, `logout` to `app/controllers/auth_controller.ts` (AC: #1, #2, #3, #4)
  - [ ] `showLogin({ inertia })` — renders `auth/Login` page
  - [ ] `login({ request, response, auth, session })` — validates via `loginValidator`, calls `User.verifyCredentials()`, logs in, redirects to `/`
  - [ ] Catch `E_INVALID_CREDENTIALS` in `login()` — flash `errors.email` + redirect back
  - [ ] `logout({ auth, response })` — calls `auth.use('web').logout()`, redirects to `/`
- [ ] Create `inertia/pages/auth/Login.tsx` (AC: #1, #3)
  - [ ] Bootstrap-styled form: email and password fields
  - [ ] Use `useForm` from `@inertiajs/react` (NOT `<Form>` from `@adonisjs/inertia/react`)
  - [ ] Inline Bootstrap error display: `is-invalid` class + `invalid-feedback` div per field
  - [ ] Submit via `post('/login')`
  - [ ] Link to `/register` at bottom
- [ ] Update `start/routes.ts` (AC: #1, #2, #4, #5)
  - [ ] Replace `controllers.Session` login routes with `[AuthController, 'showLogin']` and `[AuthController, 'login']`
  - [ ] Replace `controllers.Session` logout route with `[AuthController, 'logout']` (keep in `middleware.auth()` group)
  - [ ] Name routes: `auth.login.show`, `auth.login`, `auth.logout`
  - [ ] Remove any reference to `controllers.Session` and the `session_controller` import
- [ ] Delete scaffold artifacts
  - [ ] Delete `app/controllers/session_controller.ts`
  - [ ] Delete `inertia/pages/auth/login.tsx` (lowercase scaffold file)
- [ ] Run `node ace tuyau:generate` (or verify it auto-runs) to regenerate `#generated/controllers`
- [ ] Verify TypeScript compiles clean (`npm run typecheck`)
- [ ] Run ESLint (`npm run lint`)
- [ ] Test the full flow manually: login with valid credentials, login with invalid credentials, logout

## Dev Notes

### Scaffold State — What Exists and Must Change

1. **`app/controllers/session_controller.ts`** — scaffold login/logout controller. **Delete it.** Consolidate into `auth_controller.ts`.

2. **`inertia/pages/auth/login.tsx`** (lowercase) — scaffold login page. Uses `<Form route="session.store">` from `@adonisjs/inertia/react` (wrong pattern). **Delete it.** Replace with `inertia/pages/auth/Login.tsx` (PascalCase).

3. **`start/routes.ts`** — currently uses `controllers.Session` for all login/logout routes. **Replace** with direct `AuthController` import (already in the file from story 1.2). Remove the `controllers` import entirely if Session was the only thing using it — but check if `controllers` is used elsewhere first.

4. **`.adonisjs/server/controllers.ts`** — auto-generated. After deleting `session_controller.ts` and running `tuyau:generate` (or restarting dev server), the `Session` entry will be removed automatically.

### Controller Pattern

```ts
// app/controllers/auth_controller.ts — ADD these three methods
import User from '#models/user'
import { registerValidator } from '#validators/auth/register_validator'
import { loginValidator } from '#validators/auth/login_validator'
import { errors as authErrors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  // ...existing showRegister and register methods...

  async showLogin({ inertia }: HttpContext) {
    return inertia.render('auth/Login', {})
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      // TODO story 2.1: change to response.redirect('/posts') once posts route exists
      return response.redirect('/')
    } catch (error) {
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        session.flash('errors', { email: 'Invalid email or password' })
        return response.redirect().back()
      }
      throw error
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    // TODO story 2.1: change to response.redirect('/posts') once posts route exists
    return response.redirect('/')
  }
}
```

**Why catch `E_INVALID_CREDENTIALS` manually:**
- `User.verifyCredentials()` throws `E_INVALID_CREDENTIALS` (HTTP 401) on wrong password or unknown email.
- Without catching it, AdonisJS would return a 401 response — which breaks the Inertia inline-error pattern.
- Catching it, flashing `session.flash('errors', { email: '...' })`, and redirecting back causes the InertiaMiddleware's `getValidationErrors()` to pick up the error on the next GET request. The `errors` prop on the Login page will then have `errors.email` populated.
- **Re-throw anything that isn't `E_INVALID_CREDENTIALS`** — only swallow the expected credential failure.

**`errors.E_INVALID_CREDENTIALS` import path:**
```ts
import { errors as authErrors } from '@adonisjs/auth'
// authErrors.E_INVALID_CREDENTIALS is the class
```

### Validator Pattern

```ts
// app/validators/auth/login_validator.ts
import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(1),
  })
)
```

- No `.unique()` needed — credential verification is handled by `User.verifyCredentials()`, not VineJS.
- `normalizeEmail()` ensures the email is lowercased before verification (matches stored normalized email from registration).
- Use `vine.compile(vine.object({...}))` — NOT `vine.create({...})`.

### React Form Pattern

Use `useForm` from `@inertiajs/react` (NOT `<Form>` from `@adonisjs/inertia/react`):

```tsx
// inertia/pages/auth/Login.tsx
import { useForm } from '@inertiajs/react'
import { type PageProps } from '~/types'

export default function Login({ errors }: PageProps) {
  const { data, setData, post, processing } = useForm({
    email: '',
    password: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/login')
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <h1 className="mb-4">Log In</h1>
        <form onSubmit={handleSubmit} noValidate>
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
              autoComplete="current-password"
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={processing}>
            {processing ? 'Logging in…' : 'Log In'}
          </button>
        </form>
        <p className="mt-3 text-center">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  )
}
```

**`errors` come from `PageProps`** (defined in `inertia/types.ts`). Destructure from props directly.
**CSRF handled automatically** by `useForm`'s `post()` — do not add CSRF tokens manually.
**`errors.email` carries both format validation errors AND the `E_INVALID_CREDENTIALS` flash error** (both land in the `email` key via `getValidationErrors`).

### Route Pattern

```ts
// start/routes.ts — replace Session references
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')  // already in file

router
  .group(() => {
    router.get('/register', [AuthController, 'showRegister']).as('auth.register.show')
    router.post('/register', [AuthController, 'register']).as('auth.register')
    router.get('/login', [AuthController, 'showLogin']).as('auth.login.show')
    router.post('/login', [AuthController, 'login']).as('auth.login')
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('/logout', [AuthController, 'logout']).as('auth.logout')
  })
  .use(middleware.auth())
```

**Remove `controllers.Session`** (delete from routes.ts). Check if `controllers` import from `#generated/controllers` is still needed elsewhere — if not, remove the import entirely.

**After updating routes**, run `node ace tuyau:generate` (or restart `node ace serve --hmr`) to regenerate `#generated/controllers`. The `Session` entry will be removed.

### Error Flow for Invalid Credentials

1. User submits wrong email/password
2. `loginValidator` passes (valid email format, non-empty password)
3. `User.verifyCredentials(email, password)` throws `E_INVALID_CREDENTIALS`
4. Controller catches it → `session.flash('errors', { email: 'Invalid email or password' })`
5. `response.redirect().back()` → redirects to `GET /login`
6. On the GET request, `InertiaMiddleware.share()` calls `this.getValidationErrors(ctx)`
7. `getValidationErrors` reads `session.flashMessages.get('errors')` → returns `{ email: 'Invalid email or password' }`
8. React `Login` component receives this in `errors.email` → renders `is-invalid` + `invalid-feedback`

**No custom exception handler wiring needed** — only the controller-level try/catch.

### How `auth_middleware` Already Works

`auth_middleware.ts` has `redirectTo = '/login'`. It calls `ctx.auth.authenticateUsing(guards, { loginRoute: this.redirectTo })`, which redirects unauthenticated users to `/login` automatically. **No changes needed** to `auth_middleware.ts`.

The `silent_auth_middleware` loads the user from session if logged in but does not block unauthenticated requests — it's used on public routes. **No changes needed** here either.

### What NOT to Touch in This Story

- `app/models/user.ts` — already has `withAuthFinder(hash)` mixin; `verifyCredentials()` is inherited from it
- `app/middleware/auth_middleware.ts` — already correct (redirectTo = '/login')
- `app/middleware/silent_auth_middleware.ts` — no changes
- `app/middleware/inertia_middleware.ts` — already shares `errors` via `getValidationErrors()`
- `config/auth.ts` — session guard already configured for web
- `database/migrations/` — no new migrations needed
- `app/validators/auth/register_validator.ts` — do not touch
- `inertia/layouts/MainLayout.tsx` — already has correct logout `<Link href="/logout" method="post">` pattern; no changes needed

### Previous Story Learnings (from Story 1.2)

- **`inertia.render()`** requires a second `{}` arg due to overload resolution in `@adonisjs/inertia ^4.2.0` — use `inertia.render('auth/Login', {})`.
- **`vine.compile(vine.object({...}))`** — NOT `vine.create`. Scaffold uses `vine.create` (older API).
- **`useForm` from `@inertiajs/react`** — NOT `<Form>` from `@adonisjs/inertia/react`. The scaffold login page uses the wrong import; that's why we delete it.
- **`errors` from `PageProps`** — destructure directly: `function Login({ errors }: PageProps)`.
- **Bootstrap JS not needed** — `is-invalid`, `invalid-feedback`, `form-control`, `btn` are CSS-only.
- **`usePage().props as unknown as PageProps`** cast may be needed in components that call `usePage()` — but for page components that receive props directly, destructure from function args instead.
- **`tuyau:generate`** is invoked via `generateRegistry` hook in `adonisrc.ts`; it runs automatically when `node ace serve --hmr` restarts or when explicitly called. After deleting `session_controller.ts`, restart dev server to purge the stale `Session` entry from `#generated/controllers`.
- **Hash driver is `scrypt`** (configured in `config/hash.ts`), not bcrypt — `verifyCredentials()` uses whatever hash driver is configured. This is fine; `withAuthFinder` abstracts it.

### Unfixed Review Findings from Story 1.2

These are tracked but **not in scope for story 1.3** — do not address them here:
- `[Review][Patch]` Hash driver configured as scrypt vs bcrypt mention in AC — config/hash.ts:13
- `[Review][Patch]` register_validator missing max length on email — app/validators/auth/register_validator.ts:9
- `[Review][Patch]` Race on unique username/email surfaces as 500 — app/controllers/auth_controller.ts:12

### Project Structure Notes

Files to **create**:
- `app/validators/auth/login_validator.ts` — new login validator

Files to **modify**:
- `app/controllers/auth_controller.ts` — add `showLogin`, `login`, `logout` methods
- `start/routes.ts` — replace `controllers.Session` with `[AuthController, ...]` for login/logout

Files to **delete**:
- `app/controllers/session_controller.ts` — scaffold artifact (consolidated into auth_controller)
- `inertia/pages/auth/login.tsx` — scaffold artifact (lowercase, wrong Form component)

Files to **create**:
- `inertia/pages/auth/Login.tsx` — PascalCase, Bootstrap + useForm pattern

Files **untouched**:
- All model, migration, middleware, config files
- `inertia/pages/auth/Register.tsx` — story 1.2 artifact, do not touch
- `inertia/layouts/MainLayout.tsx` — logout link already correct

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security] — session guard, auth middleware, route protection
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — validation errors via Inertia
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — `useForm` pattern, shared props shape
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Conventions] — PascalCase React pages, route naming
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3] — Acceptance Criteria
- [Source: _bmad-output/implementation-artifacts/1-2-user-registration.md#Dev Notes] — VineJS, useForm, Bootstrap error patterns

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4.6)

### Debug Log References

### Completion Notes List

### File List
