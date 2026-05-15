---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# AdonisLog - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for AdonisLog, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Unauthenticated visitors can browse and read all published posts
FR2: Unauthenticated visitors can view user profiles
FR3: Unauthenticated visitors can read comments on posts
FR4: Users can register a new account with username, email, and password
FR5: Users can log in with email and password
FR6: Users can log out
FR7: Unauthenticated users who attempt write actions are redirected to login
FR8: Users can view their own profile page
FR9: Users can view any other user's profile page
FR10: Users can update their profile bio
FR11: Users can add/update social site links on their profile (e.g., Twitter, GitHub, LinkedIn)
FR12: A user's profile page displays all posts authored by that user
FR13: Authenticated users can create a new post with a title and body
FR14: Authenticated users can attach one or more tags to a post
FR15: Authenticated users can edit their own posts
FR16: Authenticated users can delete their own posts
FR17: All users can view a list of all published posts
FR18: All users can view a single post with its full content, tags, comments, and like count
FR19: Posts are listed in reverse chronological order
FR20: Authenticated users can tag posts with existing tags
FR21: Authenticated users can create new tags when tagging a post
FR22: All users can view posts filtered by a specific tag
FR23: Tags are displayed on the post detail view and post list
FR24: Authenticated users can post a comment on any post
FR25: Authenticated users can delete their own comments
FR26: All users can read comments on a post
FR27: Comments are displayed in chronological order on the post detail view
FR28: Authenticated users can like a post
FR29: Authenticated users can unlike a post they previously liked
FR30: Authenticated users can like a comment
FR31: Authenticated users can unlike a comment they previously liked
FR32: All users can see the like count on posts and comments
FR33: Authenticated users can see whether they have liked a given post or comment
FR34: Form submissions with invalid data return field-level validation errors
FR35: Validation errors are displayed inline in the relevant form without a full page reload
FR36: Successful form submissions redirect to the appropriate page
FR37: The application ships with seed data including sample users, posts, comments, and tags
FR38: Seed data can be loaded via a single CLI command (`node ace db:seed`)
FR39: A README provides step-by-step local setup instructions
FR40: The README documents key architectural decisions and the AdonisJS capabilities demonstrated

### NonFunctional Requirements

NFR1: Passwords are hashed using bcrypt via AdonisJS auth — never stored in plain text
NFR2: User sessions are invalidated on logout
NFR3: All write routes are protected by auth middleware; unauthenticated requests are redirected to login
NFR4: Users may only edit or delete their own posts and comments — no cross-user mutation permitted
NFR5: All form inputs are validated server-side; client-side validation is an optional enhancement only
NFR6: Relationship data (posts + tags, comments, like counts) loaded via Lucid eager loading to eliminate N+1 query patterns
NFR7: Code follows idiomatic AdonisJS patterns — no framework workarounds or antipatterns that would mislead learners
NFR8: Each feature area is traceable end-to-end: controller → model → migration → Inertia page component
NFR9: No dead code or unused dependencies in the final codebase
NFR10: Application supports Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
NFR11: Responsive layout via Twitter Bootstrap grid system

### Additional Requirements

- **Starter template already scaffolded**: Project was initialized with `npm init adonisjs@latest adonis_react_app -- --kit=inertia --adapter=react --ssr=false`. First story must configure the database, run existing migration scaffold, and add Bootstrap to the Inertia layout.
- **8 database migrations required**: `users`, `posts`, `tags`, `post_tags` (pivot), `comments`, `post_likes`, `comment_likes`, `user_social_links`
- **No polymorphic likes**: Two separate tables (`post_likes`, `comment_likes`) — explicitly avoids polymorphic ORM complexity for learnability
- **Bouncer Policies**: `PostPolicy` and `CommentPolicy` in `app/policies/` for resource-level ownership authorization
- **Inertia shared data middleware**: `inertia_middleware.ts` must share `{ auth: { user }, flash: { success?, error? }, errors }` on every request
- **Tuyau route types**: Run `node ace tuyau:generate` after all routes are defined to regenerate type-safe route URLs
- **Seeder structure**: `MainSeeder` calls sub-seeders in order: `UserSeeder → PostSeeder → TagSeeder → CommentSeeder → LikeSeeder`
- **Implementation sequence dictated by architecture**: DB + migrations → Auth/User model → Bouncer Policies → Core models + relationships → Inertia middleware → Controllers + validators → React pages → Seeders
- **Naming conventions enforced**: `snake_case` DB columns, `camelCase` Lucid model properties, PascalCase React components, `snake_case` Inertia prop keys
- **All dates pre-formatted with Luxon in controllers** — React components receive pre-formatted strings, never raw ISO timestamps
- **Japa test runner** with functional tests per feature area in `tests/functional/`

### UX Design Requirements

No UX Design document provided. Bootstrap's default responsive utilities and semantic HTML are used throughout. No additional UX design requirements beyond PRD responsive/accessibility notes.

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 2 | Public post list (enabled by Epic 1 silent_auth middleware) |
| FR2 | Epic 3 | Public user profiles |
| FR3 | Epic 4 | Public comment reading |
| FR4 | Epic 1 | User registration |
| FR5 | Epic 1 | User login |
| FR6 | Epic 1 | User logout |
| FR7 | Epic 1 | Auth guard → redirect to login |
| FR8 | Epic 3 | View own profile |
| FR9 | Epic 3 | View others' profiles |
| FR10 | Epic 3 | Update profile bio |
| FR11 | Epic 3 | Social site links |
| FR12 | Epic 3 | Profile shows authored posts |
| FR13 | Epic 2 | Create post |
| FR14 | Epic 2 | Attach tags to post |
| FR15 | Epic 2 | Edit own post |
| FR16 | Epic 2 | Delete own post |
| FR17 | Epic 2 | View post list |
| FR18 | Epic 2 | View single post (full content, tags, comments, likes) |
| FR19 | Epic 2 | Posts in reverse chronological order |
| FR20 | Epic 2 | Tag with existing tags |
| FR21 | Epic 2 | Create new tag inline |
| FR22 | Epic 2 | Filter posts by tag |
| FR23 | Epic 2 | Tags displayed on list and detail |
| FR24 | Epic 4 | Post a comment |
| FR25 | Epic 4 | Delete own comment |
| FR26 | Epic 4 | Read comments (public) |
| FR27 | Epic 4 | Comments in chronological order |
| FR28 | Epic 4 | Like a post |
| FR29 | Epic 4 | Unlike a post |
| FR30 | Epic 4 | Like a comment |
| FR31 | Epic 4 | Unlike a comment |
| FR32 | Epic 4 | Like count visible to all |
| FR33 | Epic 4 | Own like state visible to authenticated users |
| FR34 | Epic 2 | Field-level validation errors (pattern established, reused in 3+4) |
| FR35 | Epic 2 | Inline validation errors without page reload |
| FR36 | Epic 2 | Successful form submission redirect |
| FR37 | Epic 5 | Seed data (users, posts, comments, tags) |
| FR38 | Epic 5 | `node ace db:seed` command |
| FR39 | Epic 5 | README setup instructions |
| FR40 | Epic 5 | README architectural decisions |

## Epic List

### Epic 1: Project Foundation & User Authentication
Users can register, log in, and log out securely. The project is fully set up and runnable locally with database, Bootstrap layout, and Inertia shared data in place — the working foundation all other epics build upon.
**FRs covered:** FR4, FR5, FR6, FR7

### Epic 2: Post Publishing & Discovery
Authenticated users can create, edit, and delete posts with tags. All users can browse posts, read individual posts, filter by tag, and receive inline validation feedback on forms.
**FRs covered:** FR1, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR34, FR35, FR36

### Epic 3: User Profiles
Users can view and edit their own profile (bio + social links) and see their authored posts. Anyone can view any user's public profile page.
**FRs covered:** FR2, FR8, FR9, FR10, FR11, FR12

### Epic 4: Community Engagement — Comments & Likes
Authenticated users can comment on posts, delete their own comments, and like/unlike posts and comments. All users can see engagement counts and authenticated users see their own like state.
**FRs covered:** FR3, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33

### Epic 5: Seed Data, Tests & Documentation
The application ships with rich demo content, a functional Japa test suite demonstrating AdonisJS testing patterns, and a README that gets any developer running locally in under 15 minutes.
**FRs covered:** FR37, FR38, FR39, FR40

---

## Epic 1: Project Foundation & User Authentication

Users can register, log in, and log out securely. The project is fully set up and runnable locally with database, Bootstrap layout, and Inertia shared data in place — the working foundation all other epics build upon.

### Story 1.1: Project Foundation — Database, Bootstrap & Inertia Layout

As a developer setting up the project,
I want the database configured, Bootstrap installed, and a consistent main layout in place,
So that I have a working, navigable application shell before any features are built.

**Acceptance Criteria:**

**Given** the AdonisJS + Inertia + React scaffold is already present
**When** I run `node ace migration:run`
**Then** a SQLite database is created at `tmp/db.sqlite3` with a `users` table (id, username, email, password, bio, created_at, updated_at)

**Given** Bootstrap is installed via npm
**When** the Inertia app renders any page
**Then** Bootstrap CSS is loaded and the layout uses Bootstrap grid classes

**Given** `MainLayout.tsx` exists in `inertia/layouts/`
**When** any page is rendered
**Then** a Bootstrap navbar appears with the app name and navigation links, and a footer is present

**Given** `inertia_middleware.ts` is registered
**When** any request is made
**Then** `auth.user` (or null), `flash.success`, `flash.error`, and `errors` are available as Inertia shared props on every page

**Given** the `inertia_layout.edge` root HTML shell exists
**When** the Inertia app loads in a browser
**Then** Vite assets are loaded correctly and the `#app` div is present for React hydration

**Given** the project root is set up
**When** I inspect the repository
**Then** an `.env.example` file exists documenting required environment variables (APP_KEY, DB_CONNECTION, etc.) with safe placeholder values, so that `cp .env.example .env` works as the first setup step

### Story 1.2: User Registration

As an unregistered visitor,
I want to create an account with a username, email, and password,
So that I can access write features of the platform.

**Acceptance Criteria:**

**Given** I visit `/register`
**When** the page loads
**Then** I see a registration form with fields: username, email, password, and a submit button

**Given** I submit the form with a valid unique username, valid email, and password ≥ 8 characters
**When** the form is processed
**Then** my account is created, my password is stored as a bcrypt hash (never plain text), I am logged in, and I am redirected to the post list

**Given** I submit the form with an email that already exists
**When** the form is processed
**Then** I see an inline validation error on the email field without a full page reload

**Given** I submit the form with any field blank or invalid
**When** the form is processed
**Then** I see field-level validation errors inline on the offending fields (VineJS server-side validation via Inertia error surfacing)

### Story 1.3: User Login & Logout

As a registered user,
I want to log in with my email and password, and log out when done,
So that I can securely access my account and protect it when I leave.

**Acceptance Criteria:**

**Given** I visit `/login`
**When** the page loads
**Then** I see a login form with email and password fields

**Given** I submit valid credentials
**When** the form is processed
**Then** I am authenticated, a session is established, and I am redirected to the post list

**Given** I submit invalid credentials (wrong password or non-existent email)
**When** the form is processed
**Then** I see an inline error message without a full page reload

**Given** I am logged in and click logout
**When** the logout action is processed
**Then** my session is invalidated, I am redirected to the post list as an unauthenticated visitor, and `auth.user` in shared props is null

**Given** I am not logged in and attempt to navigate to a write-protected route (e.g., `/posts/create`)
**When** the request is processed
**Then** I am redirected to `/login` by the `auth_middleware`

---

## Epic 2: Post Publishing & Discovery

Authenticated users can create, edit, and delete posts with tags. All users can browse posts, read individual posts, and filter by tag. Inline form validation is established here as the platform pattern.

### Story 2.1: Post List & Post Detail (Public Read)

As a visitor (authenticated or not),
I want to browse a paginated list of all posts and read any post in full,
So that I can discover and consume content on the platform.

**Acceptance Criteria:**

**Given** I visit `/posts`
**When** the page loads
**Then** I see a paginated list of posts in reverse chronological order, each showing title, author username, publication date (formatted "May 14, 2026"), tag badges, and like count

**Given** there are more posts than the page size
**When** I click a pagination link
**Then** I see the next page of posts without a full page reload (Inertia navigation)

**Given** I click a post title
**When** the post detail page loads at `/posts/:id`
**Then** I see the full post content and all tags — loaded via Lucid eager loading (no N+1 queries). *(Note: the comments section and like count are added to this page in Epic 4 Stories 4.1 and 4.2. The `PostShow.tsx` component should accept optional `comments` and `like_count` props defaulting to empty/0 so Epic 4 can enrich it without structural changes.)*

**Given** I visit `/tags/:slug`
**When** the page loads
**Then** I see only posts tagged with that tag, also paginated and in reverse chronological order

### Story 2.2: Create & Publish a Post

As an authenticated user,
I want to create a new post with a title, body, and tags,
So that I can share content with the community.

**Acceptance Criteria:**

**Given** I am logged in and visit `/posts/create`
**When** the page loads
**Then** I see a form with title, body (textarea), and a tags input field

**Given** the posts feature is being implemented
**When** I run `node ace migration:run`
**Then** migrations for `posts`, `tags`, and `post_tags` (pivot: post_id, tag_id) tables have been created and applied successfully

**Given** I fill in a valid title, body, and optionally add tags (new or existing), and submit
**When** the form is processed
**Then** my post is saved, any new tags are created (find-or-create), existing tags are associated via the `post_tags` pivot, and I am redirected to the new post's detail page

**Given** I submit the form with a blank title or blank body
**When** the form is processed
**Then** I see field-level validation errors inline without a full page reload (VineJS + Inertia error surfacing)

**Given** I am not logged in and navigate to `/posts/create`
**When** the request is processed
**Then** I am redirected to `/login`

### Story 2.3: Edit & Delete Own Post

As an authenticated user,
I want to edit or delete posts I authored,
So that I can keep my content up to date or remove it.

**Acceptance Criteria:**

**Given** I am the author of a post and visit `/posts/:id`
**When** the page renders
**Then** I see Edit and Delete action buttons that other users do not see

**Given** I click Edit and navigate to `/posts/:id/edit`
**When** the form loads
**Then** it is pre-populated with the existing title, body, and tags

**Given** I update the title/body/tags and submit
**When** the form is processed
**Then** the post is updated (including tag associations synced via pivot), and I am redirected to the post detail page with a success flash message

**Given** I click Delete and confirm
**When** the action is processed
**Then** the post is deleted and I am redirected to the post list with a success flash message

**Given** I attempt to edit or delete a post I do not own (via direct URL manipulation)
**When** the request is processed
**Then** `PostPolicy` via Bouncer rejects the action and I receive a 403 / am redirected

**Given** I submit an edit form with a blank title or body
**When** the form is processed
**Then** I see inline validation errors without a full page reload

---

## Epic 3: User Profiles

Users can view and edit their own profile (bio + social links) and see their authored posts. Anyone can view any user's public profile page.

### Story 3.1: Public User Profile Page

As a visitor (authenticated or not),
I want to view any user's profile page,
So that I can learn about authors and browse their published posts.

**Acceptance Criteria:**

**Given** I visit `/users/:username`
**When** the page loads
**Then** I see the user's username, bio, social links (with type labels e.g. Twitter, GitHub, LinkedIn), and a paginated list of all posts authored by that user in reverse chronological order

**Given** the user has no bio or no social links
**When** the page loads
**Then** those sections are gracefully omitted or show an empty state — no errors

**Given** I visit a username that does not exist
**When** the request is processed
**Then** I receive a 404 response

### Story 3.2: Edit Own Profile (Bio & Social Links)

As an authenticated user,
I want to update my bio and add or update my social site links,
So that other users can learn about me and find me elsewhere online.

**Acceptance Criteria:**

**Given** I am logged in and visit `/users/:username/edit` for my own profile
**When** the page loads
**Then** I see a form pre-populated with my current bio and any existing social links (each with type and URL fields)

**Given** I update my bio and submit
**When** the form is processed
**Then** my bio is saved and I am redirected to my profile page with a success flash message

**Given** I add a social link with a valid type and URL and submit
**When** the form is processed
**Then** the link is saved to `user_social_links`, visible on my profile page

**Given** I update or remove an existing social link and submit
**When** the form is processed
**Then** the changes are persisted correctly (existing links updated or deleted)

**Given** I submit the form with an invalid URL
**When** the form is processed
**Then** I see an inline field-level validation error without a full page reload

**Given** I attempt to navigate to `/users/:other_username/edit`
**When** the request is processed
**Then** I am redirected — I cannot edit another user's profile

---

## Epic 4: Community Engagement — Comments & Likes

Authenticated users can comment on posts, delete their own comments, and like/unlike posts and comments. All users see engagement counts; authenticated users see their own like state.

### Story 4.1: Comments on Posts

As a user,
I want to read comments on any post and post my own comments when logged in,
So that I can engage in discussion around content.

**Acceptance Criteria:**

**Given** I visit any post detail page at `/posts/:id`
**When** the page loads
**Then** I see all comments in chronological order, each showing author username, formatted date, and comment body — loaded via Lucid eager loading

**Given** I am logged in and submit a non-empty comment on a post
**When** the form is processed
**Then** my comment is saved and the page reloads (via Inertia redirect) showing my new comment at the end of the list

**Given** I submit an empty comment
**When** the form is processed
**Then** I see an inline validation error without a full page reload

**Given** I am not logged in
**When** I view the comments section
**Then** I see existing comments but the comment form is not shown (or I see a prompt to log in)

**Given** I am not logged in and attempt to POST to the comments endpoint directly
**When** the request is processed
**Then** I am redirected to `/login` by `auth_middleware`

**Given** I am the author of a comment
**When** I view the post detail page
**Then** I see a Delete button on my comment that other users do not see

**Given** I click Delete on my own comment
**When** the action is processed
**Then** the comment is deleted and the page refreshes with the comment removed

**Given** I attempt to delete a comment I do not own (via direct request)
**When** the request is processed
**Then** `CommentPolicy` via Bouncer rejects the action with a 403

### Story 4.2: Likes on Posts & Comments

As a user,
I want to like and unlike posts and comments,
So that I can express appreciation for content I find valuable.

**Acceptance Criteria:**

**Given** I visit any post detail page
**When** the page loads
**Then** I see a like count on the post and on each comment, visible to all users

**Given** I am logged in and click the Like button on a post I have not yet liked
**When** the action is processed
**Then** a `post_likes` record is created for my user + that post, and the updated like count is reflected on the page

**Given** I am logged in and click the Like button on a post I have already liked
**When** the action is processed
**Then** the `post_likes` record is deleted (toggle), and the updated like count is reflected on the page

**Given** I am logged in
**When** I view a post or comment I have already liked
**Then** the Like button shows a visually distinct "liked" state (e.g. filled/active) — `user_has_liked` is true

**Given** I am logged in and like or unlike a comment
**When** the action is processed
**Then** the `comment_likes` table is used (not `post_likes`), and the comment's like count updates correctly

**Given** I am not logged in and click the Like button
**When** the request is processed
**Then** I am redirected to `/login` by `auth_middleware`

**Given** I am logged in and attempt to like the same post twice via direct requests
**When** the second request is processed
**Then** no duplicate `post_likes` record is created (unique constraint on `post_id` + `user_id`)

---

## Epic 5: Seed Data, Tests & Documentation

The application ships with rich demo content, a functional Japa test suite demonstrating AdonisJS testing patterns, and a README that gets any developer running locally in under 15 minutes.

### Story 5.1: Seed Data

As a developer exploring or demoing AdonisLog,
I want the application pre-loaded with realistic sample content,
So that I can immediately explore all features without manually creating data.

**Acceptance Criteria:**

**Given** I run `node ace db:seed` on a fresh database
**When** the seeding completes
**Then** the database contains: at least 2 sample users, at least 5 sample posts with varied tags, at least 3 sample comments across posts, and at least a few likes on posts and comments

**Given** the seed data is loaded
**When** I browse the post list
**Then** posts show realistic content with tags, author names, dates, and like/comment counts

**Given** the seed data is loaded
**When** I visit a user profile
**Then** the profile shows the seeded bio, social links, and authored posts

**Given** I run `node ace db:seed` more than once on the same database
**When** seeding completes
**Then** duplicate records are avoided (idempotent seeding or clear docs on running with a fresh DB)

### Story 5.2: Functional Test Suite

As a developer learning AdonisJS testing patterns,
I want a functional test suite covering all major feature areas,
So that I can see how Japa HTTP tests work for real-world AdonisJS features.

**Acceptance Criteria:**

**Given** I run `node ace test`
**When** the test suite executes
**Then** all tests pass with no failures on a freshly seeded database

**Given** the `tests/functional/auth.spec.ts` file exists
**When** I read it
**Then** it covers: registration with valid data, registration with duplicate email, login with valid credentials, login with invalid credentials, logout, and redirect to login for protected routes

**Given** `tests/functional/posts.spec.ts` exists
**When** I read it
**Then** it covers: public post list, post detail view, create post (authenticated), create post (unauthenticated → redirect), edit own post, attempt to edit another user's post (→ 403), delete own post

**Given** `tests/functional/comments.spec.ts` exists
**When** I read it
**Then** it covers: comment on a post (authenticated), empty comment validation, delete own comment, attempt to delete another user's comment (→ 403)

**Given** `tests/functional/likes.spec.ts` exists
**When** I read it
**Then** it covers: like a post, unlike a post (toggle), like a comment, unauthenticated like attempt (→ redirect)

**Given** `tests/functional/users.spec.ts` exists
**When** I read it
**Then** it covers: view public profile, view own profile edit form, update bio and social links, attempt to edit another user's profile (→ redirect)

### Story 5.3: README & Architecture Documentation

As a developer discovering AdonisLog on GitHub,
I want a clear README with setup instructions and an architectural walkthrough,
So that I can get the project running locally in under 15 minutes and understand how it demonstrates AdonisJS capabilities.

**Acceptance Criteria:**

**Given** I find the repository on GitHub
**When** I read `README.md`
**Then** I find: project description, prerequisites (Node.js version, etc.), step-by-step local setup commands (`git clone`, `npm install`, `cp .env.example .env`, `node ace migration:run`, `node ace db:seed`, `node ace serve --hmr`), and a note that the app is available at `http://localhost:3333`

**Given** I follow the README setup steps exactly
**When** I run `node ace serve --hmr`
**Then** the application starts without errors and I can browse the post list in a browser

**Given** I read the architectural section of the README
**When** I review it
**Then** it documents: the AdonisJS capabilities demonstrated (auth, Lucid ORM, Inertia.js, Bouncer, VineJS), key architectural decisions (no polymorphic likes, Inertia shared data shape, Bouncer Policies for authorization), and a brief project structure overview
