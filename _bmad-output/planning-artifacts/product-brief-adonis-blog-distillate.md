---
title: "Product Brief Distillate: AdonisLog"
type: llm-distillate
source: "product-brief-adonis-blog.md"
created: "2026-05-13"
purpose: "Token-efficient context for downstream PRD creation"
---

# Product Brief Distillate: AdonisLog

## Project Identity

- **Name:** AdonisLog (working title)
- **Type:** Demo / learning project — NOT a production SaaS
- **Primary goal:** Learn AdonisJS framework deeply through a realistic full-stack app
- **Secondary goal:** Portfolio / demo piece for technical showcase

## Technical Stack (Confirmed)

- **Backend:** AdonisJS (Node.js) — already scaffolded in project root
- **Frontend:** React via Inertia.js (already configured — `inertia/` folder present)
- **UI Styling:** Twitter Bootstrap
- **ORM:** Lucid ORM (AdonisJS built-in)
- **Auth:** AdonisJS session-based authentication
- **Database:** SQLite (dev) — no specific production DB required
- **No REST API layer** — Inertia.js bridges backend and frontend directly

## AdonisJS Learning Goals (All Must Be Covered)

- Authentication & session management
- Lucid ORM: model definitions, relationships, migrations, model hooks
- Inertia.js + React integration (SSR-like, no separate API)
- Route middleware (auth guards)
- Form validation (AdonisJS validators)
- *(Explicitly excluded: file uploads)*

## Feature Set (Confirmed In Scope)

- User registration & login (session auth)
- Create / read / update / delete posts
- Tag posts (many-to-many: posts ↔ tags)
- Comment on posts
- Like posts (users can like a post)
- Like comments (users can like a comment)
- User profile: bio + social site links (e.g., Twitter, GitHub, LinkedIn)
- Seed data for demo purposes (sample users, posts, comments)
- README: setup instructions + architecture walkthrough

## Explicitly Out of Scope

- Search functionality — rejected, keep scope tight
- File / image uploads — rejected, not a learning priority
- Email notifications — out of scope
- Admin panel — out of scope
- Deployment / hosting — local development only for now
- Monetization / premium features — not applicable to demo

## Data Model Hints (Requirements Signals)

- **User:** id, username, email, password, bio, social_links (JSON or separate table), timestamps
- **Post:** id, user_id (author), title, body, timestamps
- **Tag:** id, name; pivot: post_tags (post_id, tag_id)
- **Comment:** id, post_id, user_id, body, timestamps
- **Like (polymorphic or two tables):** likeable_type (post|comment), likeable_id, user_id — OR separate post_likes / comment_likes tables
- Relationships: User hasMany Posts, Post hasMany Comments, Post belongsToMany Tags, Post hasMany Likes, Comment hasMany Likes

## User Types

- **Single user type** — no roles, no admin, no premium tier
- All registered users have identical capabilities
- Unauthenticated users: read-only (view posts, profiles, comments)
- Authenticated users: full write access (create posts, comment, like, edit own content)

## UX / UI Signals

- Twitter Bootstrap for all UI components — no custom CSS framework
- SPA-like navigation via Inertia.js (no full page reloads)
- Clean, uncluttered interface — no algorithmic feed, no paywall UI
- No search UI required

## Open Questions for PRD Phase

- Should users be able to edit/delete their own comments?
- Should post likes show a count publicly, or just a liked/not-liked state?
- Should tags be free-form (user-created) or from a predefined list?
- Should user profiles be publicly visible without login?
- Pagination strategy for post lists and comment threads?

## Competitive Context (Brief)

- **Medium:** Polished writing UX, but aggressive paywall frustrates readers/writers
- **Dev.to:** Developer-focused, open, but dated UX
- **Hashnode:** Dev blogging with custom domains, isolated community feel
- **AdonisLog differentiator:** Open, no paywall, clean Bootstrap UI — but primary value is as a framework demo, not market competition

## Rejected Ideas (Do Not Re-Propose)

- File/image uploads — explicitly excluded to simplify scope
- Search — excluded to keep project completable as a solo learning project
- Deployment pipeline — deferred; local dev only for this phase
- Email notifications — out of scope for v1
