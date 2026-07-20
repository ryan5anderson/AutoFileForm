# V0 Cleanup Plan — Remaining Phases

Phases 1 (repo hygiene) and 2 (documentation) are complete. This covers the rest.

Guiding rule: v0 is live in production and slated for replacement by v1. Remove what's dead, protect what runs, and don't refactor anything scheduled to be rebuilt. One commit per numbered item so anything that breaks is trivially bisectable.

---

## Phase 3 — Dead Code Removal (low risk, verify nothing imports it)

### 3.1 Remove legacy diagnostic routes
- Delete `/test-api`, `/test-api/:orderTemplateId`, and `/test-api/:orderTemplateId/product/:itemId` route definitions from `src/index.tsx`.
- Delete the `TestApiPage` components in `src/app/routes/`.
- Delete `fetchCollegeOrder` and the deprecated `checkProxyHealth` alias in `src/services/collegeApiService.ts` (~lines 347-382, 480-484).
- After removal, `/api/college` may have no remaining production callers — if so, note it in KNOWN_ISSUES rather than deleting the serverless function (zero-risk to leave, and v1 may reference the contract).

### 3.2 Remove dead type fields
- Delete `Order.products` and `Order.adminNotes` from `src/types/index.ts` — declared but never written anywhere.

### 3.3 Legacy sweatpant/jogger path — check before removing
- `sweatpantJoggerOptions` (`SweatpantJoggerOption`) is superseded by `pantOptions` but still supported in validation, email, and receipt rendering.
- **Precondition:** query the Firebase `orders` collection and confirm no stored orders contain `sweatpantJoggerOptions`. Receipts re-render from stored data, so removing the path while old orders reference it breaks `/receipt/:orderId` for those orders.
- If any exist or you can't confirm: leave the path in place and record it in `docs/KNOWN_ISSUES.md` instead.

### 3.4 Run the existing dead-code tooling
- `npm run check:unused` (ts-prune) — remove or justify each reported dead export.
- `npm run check:deps` (depcheck) — remove unused dependencies it flags.
- Treat output as a checklist; don't chase items inside code that step 3.1/3.3 already deletes.

### 3.5 Fix mislocated dependencies
- Move `@types/react`, `@types/react-dom`, and `@testing-library/jest-dom` from `dependencies` to `devDependencies` in `package.json`.
- Verify `npm run build` still succeeds on Vercel afterward (CRA builds need types at build time; Vercel installs devDependencies by default, so this should be safe).

---

## Phase 4 — Small Behavior-Safe Fixes (optional, judgment calls)

### 4.1 Remove production payload logging
- Delete the full-order `console.info` on every submit (`src/services/collegeApiService.ts` ~lines 1377-1382). It runs in production and leaks order data to the browser console.
- The dev-only style-`3930R` trace logging (~lines 1170-1181) can stay — it's gated to dev — or be removed for tidiness.

### 4.2 Add minimal CI
- Add a GitHub Action that runs on PR and push to `main`:
  - `npm ci --legacy-peer-deps`
  - The two existing test suites (`apiCollegeCategorization.test.ts`, `collegeApiService.serialization.test.ts`)
  - `npm run lint` / `npm run lint:css` if configured
- Purpose: protect v0 during the v1 parallel-run period, and prove the ported-core tests are green before the v1 port (V1 Plan step 4 depends on these tests).

### 4.3 Explicitly out of scope — do not touch in v0
- Submit ordering (Firebase/email before on-prem POST)
- Auth of any kind (admin password, Firestore rules, open API routes)
- Pack-rule consolidation (the four conflicting layers)
- EmailJS replacement
- Hardcoded `mytownoriginals.com` submit URL
- Any refactor of `collegeApiService` internals

All of the above are v1 work per `V1_PLAN.md`. Changing them in v0 adds production risk with no payoff, and clean ports depend on v0 staying frozen and well-understood.

---

## Definition of Done

- `/test-api` routes and legacy fetchers gone; app builds and both flows work in production.
- ts-prune and depcheck outputs clean (or remaining items justified in a comment).
- No production console logging of order payloads.
- CI green on `main` with the two test suites passing.
- Every deviation (e.g., sweatpant path retained) recorded in `docs/KNOWN_ISSUES.md`.
