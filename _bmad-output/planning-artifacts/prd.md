---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional]
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-adonis-blog.md
  - _bmad-output/planning-artifacts/product-brief-adonis-blog-distillate.md
workflowType: 'prd'
briefCount: 2
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
---

# Product Requirements Document - AdonisLog

**Author:** Vitalie
**Date:** 2026-05-14

## Executive Summary

AdonisLog is a full-featured community blogging platform built as the definitive reference implementation for AdonisJS — a Node.js framework designed for developer productivity and full-stack elegance. The platform enables registered users to publish posts, engage via comments, express appreciation through likes, and organize content with tags, within a clean open community free from paywalls and algorithmic noise.

The project serves a dual purpose: a functional demo that showcases real-world AdonisJS patterns end-to-end, and a structured learning resource for developers who need to see how authentication, relational data modeling, and Inertia.js/React integration work together in a realistic domain-complete application. The technical stack — AdonisJS + Lucid ORM + Inertia.js + React + Bootstrap — is production-valid but deliberately kept cohesive and teachable.

### What Makes This Special

Most framework learners hit a wall between isolated tutorials and real-world application architecture. AdonisLog bridges that gap: every feature is deliberately scoped to exercise a specific AdonisJS capability (auth, ORM relationships, route middleware, form validation, Inertia bridging), making the codebase a learning resource in itself — not a toy example, not an over-engineered showcase. Scope discipline is a core design decision: no search, no file uploads, no deployment complexity. The result is a project completable by a solo developer that still covers the full framework surface area.

## Project Classification

- **Project Type:** Web Application (SPA-like via Inertia.js)
- **Domain:** General — Developer/Community Platform
- **Complexity:** Low — no regulated domain, no compliance requirements, single user tier
- **Project Context:** Greenfield

## Success Criteria

### User Success
- A developer studying AdonisJS can read the codebase and understand how each feature maps to a specific framework capability without needing additional documentation
- A new AdonisJS learner can fork the repo, follow the README, and have a running local instance within 15 minutes
- Any developer reviewing the code as a portfolio piece can clearly see production-valid AdonisJS patterns

### Business Success
- All 6 core feature areas fully implemented and functional: auth, posts, comments, likes, tags, user profiles
- README documents setup instructions and key architectural decisions
- Codebase is idiomatic AdonisJS — no antipatterns that would mislead learners

### Technical Success
- All AdonisJS learning goals covered: auth & session management, Lucid ORM (models, relationships, migrations, hooks), Inertia.js + React integration, route middleware, form validation
- Application runs correctly in local development (SQLite)
- Seed data present for demo purposes

### Measurable Outcomes
- Zero antipatterns that would actively mislead a developer learning AdonisJS
- Every core AdonisJS capability demonstrated by at least one feature
- Local `node ace serve` works out of the box after following README

## User Journeys

### Journey 1: Alex — AdonisJS Learner (Primary User, Happy Path)

Alex is a mid-level Node.js developer who's been building Express apps for two years. He's heard about AdonisJS and wants to understand how its full-stack story hangs together. He finds AdonisLog on GitHub, clones it, runs the setup, and immediately starts exploring.

He creates an account, writes his first post, tags it `#adonisjs`, and publishes it. He gets a comment from the seed user and likes it back. Within an hour, he's traced the entire auth flow — from route middleware to session guard to the Inertia controller — by following real working code. He forks the repo and starts his own project using AdonisLog's architecture as a template. His "aha!" moment: seeing a `HasMany` relationship in Lucid and immediately understanding how it maps to a real feature.

*Capabilities revealed: auth, post CRUD, tags, comments, likes, Inertia/React pages, Lucid ORM models & relationships*

### Journey 2: Alex — Edge Case (Error Recovery)

Alex attempts to submit a post with a blank title. The form validation fires — server-side, via AdonisJS validators — and the error is returned through Inertia back to the React form without a full page reload. Alex sees exactly how AdonisJS validation errors surface in a React component. This isn't a bug — it's a learning moment the app intentionally delivers.

*Capabilities revealed: form validation, Inertia error handling, React form state*

### Journey 3: Maria — Portfolio Reviewer (Secondary User)

Maria is a hiring manager at a Node.js shop. A candidate sends her an AdonisLog link as a portfolio piece. She browses public posts without logging in, checks the GitHub README, and scans the folder structure. She's looking for code quality and architectural decisions. The README's architecture walkthrough and the clean separation of controllers, models, and Inertia pages give her confidence the developer understands full-stack patterns.

*Capabilities revealed: public read-only access, README quality, project structure clarity*

### Journey 4: Vitalie — Author (Content Creator)

Vitalie (the developer) uses AdonisLog to publish posts about what he's learning. He logs in, creates posts with tags, edits them, and checks his own profile page showing all his published posts. He also visits other users' profiles from the seed data to verify the profile feature works end-to-end.

*Capabilities revealed: auth session persistence, post edit/delete, user profile page, post listing by author*

### Journey Requirements Summary

| Capability Area | Journeys That Require It |
|---|---|
| Auth (register, login, logout, session guard) | 1, 2, 4 |
| Post CRUD (create, read, update, delete) | 1, 2, 4 |
| Tags (many-to-many) | 1, 4 |
| Comments | 1 |
| Likes (posts + comments) | 1 |
| User profiles | 1, 3, 4 |
| Public read-only access | 3 |
| Form validation + error display | 2 |
| Seed data | 1, 3 |
| README + architecture docs | 3 |

## Web Application Specific Requirements

### Project-Type Overview

AdonisLog is an SPA-like web application delivered via Inertia.js — server-side routing with client-side navigation, no full page reloads. There is no separate REST API; Inertia bridges the AdonisJS backend directly to React components.

### Technical Architecture Considerations

- **Rendering:** Server-side route handling (AdonisJS controllers) + Inertia.js page components (React). No SSR hydration complexity — Inertia handles the bridge.
- **State management:** Inertia props as page state; no Redux or global state store needed
- **Navigation:** Inertia `<Link>` components for client-side transitions; browser back/forward works natively
- **No WebSocket / real-time:** All data is loaded on page navigation; no live updates, polling, or push notifications

### Browser Matrix

- **Supported:** Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- **Not supported:** Internet Explorer, legacy mobile browsers
- No browser-specific polyfills required

### Responsive Design

- Twitter Bootstrap grid system handles responsive layout
- Mobile-friendly by default via Bootstrap's responsive utilities
- No custom CSS breakpoints — Bootstrap defaults sufficient for a learning demo

### Performance Targets

- No strict SLA; local development only
- Pages should feel snappy — no unnecessary N+1 queries (Lucid eager loading where needed)
- No caching layer required for v1

### SEO Strategy

- Not applicable — this is a local development demo, not a public-facing indexed platform

### Accessibility Level

- Best-effort via Bootstrap's built-in ARIA attributes and semantic HTML
- No WCAG compliance target for v1

### Implementation Considerations

- No file upload handling (no multipart form processing)
- No email sending (no mailer configuration needed)
- No background jobs or queues
- SQLite for local development — no production DB configuration needed for v1

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Completeness-first — the project succeeds when every planned feature area is implemented and demonstrates the target AdonisJS capability. There is no "ship early and iterate" dynamic; this is a learning project where partial completion doesn't deliver the learning value.

**Resource Requirements:** Single developer (Vitalie). No external dependencies, no deployment, no team coordination.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:** All 4 journeys (learner happy path, error recovery, portfolio review, author content creation)

**Must-Have Capabilities:**
- User registration, login, logout (session-based auth with AdonisJS auth guards)
- Route middleware protecting write actions
- Post create, read, update, delete (author-only edit/delete)
- Tag posts with multiple tags (many-to-many via Lucid pivot)
- Comment on posts (auth required)
- Like posts and comments (auth required, toggle behavior)
- User profile page (bio, social links, authored posts list)
- Public read-only access for unauthenticated users
- Form validation with Inertia error surfacing in React
- Seed data (sample users, posts, comments, tags)
- README with setup instructions and architecture walkthrough

### Post-MVP Features

**Phase 2 (Post-MVP):**
- Post search / filtering by tag
- Email notifications (new comments, likes)
- Post drafts / scheduling

**Phase 3 (Expansion):**
- Production deployment guide
- Admin panel
- Rich text editor
- Custom user domains

### Risk Mitigation Strategy

**Technical Risks:** Lucid ORM relationship complexity (polymorphic likes) — mitigate by using two separate like tables (`post_likes`, `comment_likes`) instead of a polymorphic pattern, keeping the ORM usage clear and learnable.

**Market Risks:** N/A — not a market-facing product.

**Resource Risks:** Single developer; if scope feels too large, social links can be deferred to Phase 2, but all other features are core to the learning goal.

## Functional Requirements

### User Management & Authentication

- FR1: Unauthenticated visitors can browse and read all published posts
- FR2: Unauthenticated visitors can view user profiles
- FR3: Unauthenticated visitors can read comments on posts
- FR4: Users can register a new account with username, email, and password
- FR5: Users can log in with email and password
- FR6: Users can log out
- FR7: Unauthenticated users who attempt write actions are redirected to login

### User Profiles

- FR8: Users can view their own profile page
- FR9: Users can view any other user's profile page
- FR10: Users can update their profile bio
- FR11: Users can add/update social site links on their profile (e.g., Twitter, GitHub, LinkedIn)
- FR12: A user's profile page displays all posts authored by that user

### Post Management

- FR13: Authenticated users can create a new post with a title and body
- FR14: Authenticated users can attach one or more tags to a post
- FR15: Authenticated users can edit their own posts
- FR16: Authenticated users can delete their own posts
- FR17: All users can view a list of all published posts
- FR18: All users can view a single post with its full content, tags, comments, and like count
- FR19: Posts are listed in reverse chronological order

### Tagging

- FR20: Authenticated users can tag posts with existing tags
- FR21: Authenticated users can create new tags when tagging a post
- FR22: All users can view posts filtered by a specific tag
- FR23: Tags are displayed on the post detail view and post list

### Comments

- FR24: Authenticated users can post a comment on any post
- FR25: Authenticated users can delete their own comments
- FR26: All users can read comments on a post
- FR27: Comments are displayed in chronological order on the post detail view

### Likes

- FR28: Authenticated users can like a post
- FR29: Authenticated users can unlike a post they previously liked
- FR30: Authenticated users can like a comment
- FR31: Authenticated users can unlike a comment they previously liked
- FR32: All users can see the like count on posts and comments
- FR33: Authenticated users can see whether they have liked a given post or comment

### Form Validation & Error Handling

- FR34: Form submissions with invalid data return field-level validation errors
- FR35: Validation errors are displayed inline in the relevant form without a full page reload
- FR36: Successful form submissions redirect to the appropriate page

### Seed Data & Demo Content

- FR37: The application ships with seed data including sample users, posts, comments, and tags
- FR38: Seed data can be loaded via a single CLI command (`node ace db:seed`)

### Documentation

- FR39: A README provides step-by-step local setup instructions
- FR40: The README documents key architectural decisions and the AdonisJS capabilities demonstrated

## Non-Functional Requirements

### Security

- Passwords are hashed using bcrypt via AdonisJS auth — never stored in plain text
- User sessions are invalidated on logout
- All write routes (create/edit/delete post, comment, like) are protected by auth middleware; unauthenticated requests are redirected to login
- Users may only edit or delete their own posts and comments — no cross-user mutation permitted
- All form inputs are validated server-side; client-side validation is an optional enhancement only

### Performance

- Relationship data (posts + tags, comments, like counts) loaded via Lucid eager loading to eliminate N+1 query patterns
- No strict response time SLA required — local development only
- No caching, CDN, or performance infrastructure required for v1

### Maintainability

- Code follows idiomatic AdonisJS patterns — no framework workarounds or antipatterns that would mislead learners
- Each feature area is traceable end-to-end: controller → model → migration → Inertia page component
- No dead code or unused dependencies in the final codebase
