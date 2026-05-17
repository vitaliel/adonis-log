---
project_name: 'adonis_react_app'
user_name: 'Vitalie'
date: '2026-05-17'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 48
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Runtime:** Node.js `>=24.0.0`
- **Language:** TypeScript `~6.0.2` (strict TS configs split for backend and Inertia frontend)
- **Backend:** AdonisJS Core `^7.3.1`
- **Data layer:** Lucid ORM `^22.4.2`, SQLite via `better-sqlite3 ^12.9.0`
- **Auth & Security:** `@adonisjs/auth ^10.1.0`, `@adonisjs/session ^8.1.0`, `@adonisjs/shield ^9.0.0`, `@adonisjs/cors ^3.0.0`
- **Server-driven UI:** Inertia `@adonisjs/inertia ^4.2.0` + `@inertiajs/react ^2.3.18`
- **Frontend:** React `^19.2.5`, React DOM `^19.2.5`, Vite `^7.3.1`, `@vitejs/plugin-react ^5.1.4`, Bootstrap `^5.3.8`
- **Validation & Authorization:** VineJS `^4.3.1`, Bouncer `^4.0.0`
- **Testing:** Japa Runner `^5.3.0` + AdonisJS/Japa plugins
- **Formatting & Linting:** Prettier `^3.8.2` (`@adonisjs/prettier-config`), ESLint `^10.2.0` (`@adonisjs/eslint-config`)

## Critical Implementation Rules

### Language-Specific Rules

- Use TypeScript everywhere; do not introduce `.js` source files in `app/` or `inertia/`.
- Keep backend and frontend type boundaries explicit: backend uses `HttpContext`; frontend page props extend `PageProps` from `inertia/types.ts`.
- Preserve **server-to-client `snake_case` payload keys** in controller-rendered Inertia props (for example: `author_username`, `created_at`, `user_has_liked`).
- Format user-facing dates in controllers before rendering (Luxon `toFormat(...)`); do not push raw DateTime objects to pages.
- Prefer ESM imports and project aliases (`#controllers/*`, `#models/*`, `~/`) over long relative paths.
- Avoid broad `any` assertions; if bridging generated/shared types, isolate and minimize casts.
- Use `request.validateUsing(...)` with Vine validators for input parsing instead of manual request body checks.

### Framework-Specific Rules

- This is an **Inertia monolith**: controllers return `inertia.render(...)`; do not add parallel REST endpoints for page flows.
- Keep auth/flash/errors in shared middleware (`app/middleware/inertia_middleware.ts`); page components rely on these shared props.
- Apply route protection with named middleware (`middleware.auth()`, `middleware.guest()`), not ad hoc checks in controllers.
- Enforce authorization with Bouncer policies (`bouncer.with(Policy).authorize(...)`), never inline ownership logic.
- For relational reads in controllers, preload required relations (`preload(...)`) and counts (`withCount(...)`) to avoid N+1 behavior.
- Use `useForm` and `Link` patterns in Inertia React pages for mutations/navigation to keep CSRF/session behavior consistent.
- Keep persistent shell/layout behavior in `inertia/layouts/MainLayout.tsx`; page-level layout divergence should be explicit.

### Testing Rules

- Use Japa suites as configured in `adonisrc.ts`: `tests/unit`, `tests/functional`, `tests/browser`.
- Default integration tests to `functional` with HTTP client flows; keep pure policy/business logic in `unit`.
- Wrap tests in DB transactions via `testUtils.db().withGlobalTransaction()` for isolation.
- Assert redirect/location behavior explicitly for auth/guarded routes (`302` + target path checks).
- Prefer end-to-end validator behavior checks (invalid payload → redirect/error contract) over mocking Vine internals.
- Use built-in AdonisJS auth/session test plugins instead of manual cookie/session wiring.

### Code Quality & Style Rules

- Follow Adonis presets: ESLint via `@adonisjs/eslint-config` and Prettier via `@adonisjs/prettier-config`.
- Keep file naming aligned with existing backend convention (`snake_case` files like `posts_controller.ts`, `auth_middleware.ts`).
- Keep React page/component naming in PascalCase (`PostShow.tsx`, `LikeButton.tsx`), with route folders by domain (`posts/`, `auth/`, `users/`).
- Place domain logic in controllers/models/policies/validators; avoid mixing policy checks and validation logic into React pages.
- Keep prop contracts explicit in `inertia/types.ts` and ensure page interfaces extend `PageProps`.
- Prefer small, focused transformers for model-to-JSON shaping before data reaches Inertia shared props.

### Development Workflow Rules

- Use npm scripts as canonical workflow entry points: `npm run dev`, `npm run build`, `npm run test`, `npm run lint`, `npm run typecheck`.
- For backend feature work, wire end-to-end through all affected layers: route → middleware/policy → validator → controller/model → Inertia page.
- Keep write operations behind `middleware.auth()` and keep read/public routes explicitly separated in `start/routes.ts`.
- Preserve import alias usage from `package.json#imports` and Vite aliases when adding new modules.
- When changing shared props/auth behavior, update both middleware (`inertia_middleware.ts`) and frontend `PageProps` contracts together.

### Critical Don't-Miss Rules

- Do **not** replace policy authorization with inline `if (auth.user?.id !== ...)` checks; keep authz in Bouncer policies.
- Do **not** bypass Vine validators for mutation endpoints; every write path must validate with `request.validateUsing(...)`.
- Do **not** send raw model instances or unformatted date objects to Inertia pages; serialize/shape explicitly.
- Do **not** break server/client key consistency (`snake_case` from controllers vs typed frontend expectations).
- Do **not** introduce polymorphic likes; keep separate `post_likes` and `comment_likes` flows/tables.
- Do **not** build features that require a separate REST API layer unless project architecture is intentionally changed.
- Do **not** add unauthenticated write routes (`POST/PUT/DELETE`) without explicit middleware protection.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow all rules exactly as documented.
- Prefer stricter patterns when multiple options exist.
- Update this file when new stable patterns emerge.

**For Humans:**

- Keep this file lean and focused on non-obvious implementation rules.
- Update it when stack versions or architecture patterns change.
- Periodically remove rules that have become obvious or obsolete.

Last Updated: 2026-05-17
