---
title: 'Show New Post Link on Post List for Authenticated Users'
type: 'feature'
created: '2026-05-17T19:52:01.764+03:00'
status: 'done'
baseline_commit: '57980950158d96aa9728ec248c0ee39a0eebc3f2'
context:
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
  - '{project-root}/_bmad-output/implementation-artifacts/2-2-create-publish-a-post.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Authenticated users can create posts via `/posts/create`, but the post list page does not expose a direct entry point. This forces unnecessary navigation and hides a core authoring action.

**Approach:** Add a visible "New Post" call-to-action on the posts index page only when a user is authenticated, while preserving the current anonymous experience.

## Boundaries & Constraints

**Always:** Keep post list behavior unchanged for guests; render the new link using existing Inertia/Link conventions; do not weaken route-level auth on `/posts/create`.

**Ask First:** Any request to change placement/styling beyond a small in-page CTA; any expansion to global navigation behavior.

**Never:** Do not expose create actions to unauthenticated users; do not add new backend endpoints or authorization policies for this change.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | Authenticated user loads `/posts` | Page shows clickable "New Post" link to `/posts/create` | N/A |
| GUEST_VIEW | Unauthenticated user loads `/posts` | "New Post" link is not rendered | N/A |
| EMPTY_LIST | Authenticated user loads `/posts` with zero posts | Empty-state message remains and "New Post" link is still rendered | N/A |

</frozen-after-approval>

## Code Map

- `inertia/pages/posts/PostIndex.tsx` -- Posts list UI where the authenticated CTA should be conditionally rendered.
- `tests/functional/posts.spec.ts` -- Functional coverage for `/posts`; add assertions for authenticated vs guest CTA visibility.
- `inertia/types.ts` -- Shared page prop typing source (`auth.user`) consumed by PostIndex.

## Tasks & Acceptance

**Execution:**
- [x] `inertia/pages/posts/PostIndex.tsx` -- Extend props typing to use `PageProps` auth shape and render a "New Post" link when `auth.user` exists -- makes create flow discoverable without changing guest UX.
- [x] `tests/functional/posts.spec.ts` -- Add functional assertions that `/posts` includes create CTA for logged-in users and excludes it for guests -- prevents regressions in visibility rules.

**Acceptance Criteria:**
- Given an authenticated user, when they open `/posts`, then they can see and click a "New Post" link pointing to `/posts/create`.
- Given an unauthenticated visitor, when they open `/posts`, then no "New Post" link is present.
- Given an authenticated user and zero posts, when `/posts` renders, then the empty-state text and "New Post" link are both visible.

## Spec Change Log

## Design Notes

Use a small top-of-page CTA aligned with the heading to keep hierarchy clear and avoid introducing navbar-level scope.

## Verification

**Commands:**
- `node ace test functional --files tests/functional/posts.spec.ts` -- expected: all posts functional tests pass with new CTA assertions.
- `npm run typecheck` -- expected: no TypeScript errors from updated page props usage.

## Suggested Review Order

**Post list entrypoint behavior**

- Shows authenticated-only authoring CTA beside the list heading.
  [`PostIndex.tsx:15`](../../inertia/pages/posts/PostIndex.tsx#L15)

- Uses null-safe auth access to avoid runtime crashes on missing props.
  [`PostIndex.tsx:17`](../../inertia/pages/posts/PostIndex.tsx#L17)

**Behavioral test coverage**

- Adds payload extraction utility for stable Inertia assertions.
  [`posts.spec.ts:6`](../../tests/functional/posts.spec.ts#L6)

- Verifies guest payload stays unauthenticated on `/posts`.
  [`posts.spec.ts:30`](../../tests/functional/posts.spec.ts#L30)

- Verifies authenticated empty-list payload on `/posts`.
  [`posts.spec.ts:37`](../../tests/functional/posts.spec.ts#L37)
