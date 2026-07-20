# AutoFileForm — Version 1 Plan

A rewrite of the v0 college apparel ordering platform as a separate codebase. Ordered by proven principles of software design, architecture, and AI-assisted development — decisions before code, boundaries before features, ported-and-tested before new, one vertical slice before breadth.

---

## What Changes in V1

| Area | V0 | V1 |
|---|---|---|
| Auth | None (URL obscurity, client-side admin password) | Firebase Auth, role-based accounts (admin / internal / external) |
| Users | Anonymous | Admin-created accounts, under 50 users total |
| Local schools | 7 hardcoded catalogs | Removed entirely |
| Catalogs | API schools (live on-prem proxy) | Same, shared identically by internal and external users |
| Internal orders | Firebase write → email → on-prem POST (orphan risk) | On-prem POST first, then persist + email on success |
| External orders | Email-only, never reach on-prem | Pending order entry → internal approval → auto-POST to on-prem |
| Email | Client-side EmailJS, dashboard-managed templates | Server-side send, templates in repo |
| Firestore | Open, client SDK everywhere | Security rules + Admin SDK behind authenticated API routes |
| Pack rules | Four conflicting layers | One consolidated source of truth |
| Stack | CRA (dead) + loose Vercel functions | Next.js (App Router) + TypeScript on Vercel |

## Roles

- **Admin** — creates accounts; full visibility.
- **Internal** (Ohiopyle employees / salespeople) — browse API schools, submit orders directly to on-prem, manage the approval queue (approve / modify / reject external orders).
- **External** (store runners in the field) — browse the same API schools, submit orders that land as pending entries, view status of their own orders (My Orders).

## Order State Machine

draft → pending → approved / rejected → submitted-to-onprem

- External submit → **pending** + email notification.
- Internal approve → on-prem POST; success → **submitted**; failure → stays **pending** with error flag and retry.
- Internal direct submit skips the queue: on-prem POST first, persist + email only on success.
- Modify = internal users edit items, quantities, and sizes on a pending order before approving.

---

## Ordered Steps

### 1. Spec first (spec-driven development)

Write `V1_SPEC.md` before any code: roles/permissions matrix, order state machine, Firestore data model, API contract, screen inventory per role. With AI-assisted coding this matters more, not less — the spec keeps Cursor generating consistent code across sessions instead of reinventing decisions each prompt. Inputs: `V0_SYSTEM_REFERENCE.md` and this plan.

### 2. Resolve domain ambiguity (single source of truth)

Settle the pack-size conflicts with stakeholders and write the ruling into one `packRules` definition in the spec. Known conflicts to rule on: flannels 8 (forced) vs 6 (ratio file), sweatpants 4 vs 6, sticker 7 (code) vs 20 (notes), crewneck 5 vs 6. Never encode a rule the business hasn't confirmed — v0's four conflicting layers exist because this step was skipped.

### 3. Walking skeleton (end-to-end first, features second)

Scaffold Next.js + TypeScript, deploy to Vercel, wire Firebase Auth with custom claims for roles, Firestore security rules, login page, one protected page per role, and a server route (Admin SDK) for admin user creation — no signup page. Thinnest possible slice that exercises the full stack (auth, routing, server, deploy) so integration risk is burned down before any feature code exists.

### 4. Port the proven core (don't rewrite what works)

Bring over as pure modules **with their existing tests**:

- `collegeApiService` grouping / consolidation / serialization (mockup grouping, style-variant tabs, size-to-row provenance, ORDERED1..5 mapping)
- Categorization rules (`apiCollegeCategorization`)
- On-prem workarounds: lenient response parsing, trailing-space template IDs, malformed image URLs, ORDER REVIEW row filtering

This logic is battle-tested against real on-prem data quirks; rewriting it is where an AI-assisted rebuild would silently break things. Tests passing in the new repo = ported correctly.

### 5. Data access behind the server (defense in depth)

On-prem proxies and all Firestore writes go through authenticated Next.js API routes using the Admin SDK. Submit URL becomes an env var (no hardcoded `mytownoriginals.com`). No client-side secrets, no open Firestore, no client-side email. This is a boundary decision, so it comes before features are built on top of it — retrofitting auth is what v0 proves you shouldn't do.

### 6. Internal ordering flow (simplest complete vertical slice)

Catalog browse → cart → pack validation (consolidated rules from step 2) → summary → submit. Internal path first because it has no approval dependency. Fix the transaction ordering here: on-prem POST, then persist + email on success. Failed POST = nothing persisted, user sees the error.

### 7. External flow + approval queue (build on the state machine)

- External submit: same slice, terminates in a pending order + email notification instead of an on-prem POST.
- Internal queue: list pending orders, open one, modify items/quantities/sizes, approve (POST + mark submitted) or reject.
- Runner "My Orders": read-only filtered view of the same orders collection showing pending / approved / rejected.
- Failed approval POSTs stay pending with an error flag and a retry button — the state machine handles this for free if specced right.

### 8. Admin parity, then cutover (strangler-fig style)

Admin dashboard (all orders, statuses, delete), migrate any v0 Firebase data worth keeping, run v1 in parallel with v0 while internal users validate against real orders, then point the domain at v1 and retire v0 and the local-schools flow.

---

## What Gets Dropped from V0

- Local schools (hardcoded catalogs, PDF ingest script, per-college theming maps)
- `/test-api/*` diagnostic routes and legacy fetch paths
- Legacy sweatpant/jogger option path
- Client-side EmailJS
- Client-side admin password gate
- Dead fields (`Order.products`, `Order.adminNotes`), committed build artifacts, scratch notes

## Key Decisions Already Made

- Fresh codebase, port selectively — not a clone of v0
- Next.js on Vercel, Firebase Auth + custom claims, Firestore + Admin SDK, server-side email (Resend or Nodemailer)
- Under 50 users; admin-created accounts only
- Store runners can order for any school
- Approval auto-POSTs to on-prem
- Email notification on every order
- On-prem API contracts are preserved as-is (not under our control)
