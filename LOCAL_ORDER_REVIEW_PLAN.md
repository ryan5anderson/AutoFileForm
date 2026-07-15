# Local-School Order Review/Edit Link → Internal Server Submission

> Planning document only — no feature code has been written yet. This captures the
> agreed approach and the open decisions so the work can be picked up later on this branch.

## Context

Today, when a **local-school** order is submitted, the app does two things: sends a
confirmation email (EmailJS) and saves the order to Firebase. Nothing is sent to the
downstream "internal server." **API schools**, by contrast, additionally POST the order
to the internal server (`mytownoriginals.com/api/submitorder`) at submit time.

The goal is to bring local schools closer to the API-school flow, but with a manual
review step. After a local order is submitted, the confirmation email should contain a
**link to a new web page**. That page re-renders the exact order the user submitted,
**pre-filled and editable**. Whoever opens the link can either submit it as-is or edit it
first, and submitting **POSTs the order to the internal server**.

Intended outcome: local orders can be reviewed/corrected and pushed into the same
downstream system that API-school orders already reach, without changing the customer's
initial submit experience.

## Open decisions (must be resolved before/while implementing)

These were surfaced as questions but not yet answered — capture answers here before coding:

1. **Internal-server payload contract for local orders (the main blocker).** Local
   products have no `ITEM_ID` / `ORDER_NUM` / `DESIGN_NUM` / unit-price catalog fields like
   API schools — only image-filename SKUs, per-size quantities, and loose garment codes
   (`productconfigs.csv`). Decide one:
   - (a) Remote accepts a **new local payload shape** (`source: 'local-school'`, store info
     + product/size/qty line items). Adapt `mytownoriginals` to accept it.
   - (b) Remote **requires the existing `ApiOrderPayload` shape** — then we must fabricate
     `ORDERED1..5` / best-effort `ITEM_ID` from garment codes (lossy).
   - (c) **Placeholder** for now — the submit button just re-sends the email / marks the
     order submitted, with no real POST yet.
2. **Who the link is for + access control.** Internal staff (gate behind admin password),
   the customer (open link like `/receipt/:orderId`), or fully open.
3. **After submit:** save edits back to Firebase and/or change order status
   (e.g. `completed` vs. a new `submitted-to-server`), or only forward to the remote.
4. **EmailJS template ownership.** The DEV + PROD EmailJS templates (external, not in this
   repo) must be edited to render the new `{{order_url}}` link variable.

## Approach (recommended)

Reuse the existing form + handlers wherever possible; isolate the only genuinely new/uncertain
piece (the internal-server payload) behind a single function.

### 1. New route
Add `/local-order/:orderId` in `src/index.tsx`, placed before the `/:college/*` catch-all
(mirrors the existing `/receipt/:orderId` → `OrderReceiptPage` precedent). Add a
`local-order` sidebar exclusion in `AppShell` (mirroring `isApiSchoolRoute`) so the global
sidebar doesn't double up with the form's own sidebar.

### 2. Load order by id
Add `getOrderById(orderId)` to `firebaseOrderService` using Firestore `doc`/`getDoc`
(cleaner than the current `getAllOrders().find()` used by `OrderReceiptPage`). The `getDoc`
import pattern already exists in `firebaseGarmentRatioService.ts`.

### 3. Re-render the form pre-filled (reuse, don't rebuild)
Reuse `useOrderForm` + `OrderFormProvider` + `FormPage` so all quantity/version/size/
display/pant/color/infant handlers and live validation (`invalidProductPaths`/
`validProductPaths`) come for free.
- Extend `useOrderForm(categories, options?)` with `{ initialFormData, mode, college }`.
  When `initialFormData` is provided, seed `formData` from it (don't reset date to today in
  edit mode) instead of from localStorage; when `mode === 'edit'`, skip the localStorage
  auto-save so editing doesn't clobber an in-progress order.
- Forward the same options through `OrderFormProvider` (`src/contexts/OrderFormContext.tsx`).
- New page `src/app/routes/localOrderEdit.tsx`: load order → resolve
  `categories = colleges[order.college].categories` → render the seeded provider + `FormPage`
  + a confirm step. Guard against API-school / unknown colleges (local-only page). Reuse
  `OrderReceiptPage`'s loading / not-found blocks.

### 4. Email link
In `useOrderForm.handleConfirmSubmit`, capture the `Order` returned by `addOrder` (it already
returns `id`), build `order_url = ${window.location.origin}/local-order/${savedOrder.id}`,
spread it into the template params, then `sendOrderEmail`. Add optional `order_url?: string`
to `TemplateParams` (`src/types/index.ts`). **External dependency:** the EmailJS templates
must be updated to render `{{order_url}}`.

### 5. Submit to internal server (isolated)
New file `src/services/localOrderService.ts`:
- `buildLocalOrderPayload(order)` — derive line items from
  `order.emailTemplateParams.receipt_categories` (already has per-product sku/details/total),
  falling back to recomputing via `createTemplateParams`. Gate with a `schemaVersion` so the
  contract can change in one place.
- `submitLocalOrder(order)` — POST to `/api/submitorder` reusing the same fetch/proxy +
  error handling as `submitApiOrder` (`collegeApiService.ts`). Consider extracting a shared
  `postOrder(path, body)` helper.
- On the page: rebuild an in-memory order reflecting edits, call `submitLocalOrder`, then per
  decision #3 optionally `updateOrderStatus(order.id, 'completed')` (already exists) and/or a
  new `updateOrder(orderId, partial)`. Show errors inline (reuse the `ConfirmationModal` /
  `confirmationError` pattern from `ApiCollegeSummaryPage`).

## Critical files
- `src/index.tsx` — new route + sidebar exclusion
- `src/features/hooks/useOrderForm.ts` — seed options + email `order_url`
- `src/contexts/OrderFormContext.tsx` — forward seed options
- `src/services/firebaseOrderService.ts` — `getOrderById` (+ optional `updateOrder`)
- `src/types/index.ts` — `order_url?` on `TemplateParams`
- **New:** `src/app/routes/localOrderEdit.tsx` (page), `src/services/localOrderService.ts`
  (`buildLocalOrderPayload` + `submitLocalOrder`)
- Reference only: `src/services/collegeApiService.ts` (`submitApiOrder` / `ApiOrderPayload`),
  `src/app/routes/orderReceipt.tsx` (load-by-id + page-shell pattern)

## Verification (end-to-end, local)
- `npm run dev:local` (runs `vercel dev` so `/api/submitorder` is served + CRA). Requires
  `REACT_APP_*` env vars and Vercel CLI auth.
- Submit a real local order (e.g. `/michiganstate`), grab its id, open `/local-order/<id>`,
  confirm it renders pre-filled (shirt versions, caps/color, etc.) with working validation;
  edit a quantity and re-validate.
- Inspect the outgoing payload without spamming the real remote: render
  `JSON.stringify(buildLocalOrderPayload(...))` on the page (reuse the "View Order JSON"
  pattern from `ApiCollegeSummaryPage`), and/or check the Network tab; temporarily point
  `api/submitorder.ts`'s hardcoded target at a stub/echo for a live test.
- Confirm `updateOrderStatus` flips the admin row; confirm `order_url` appears in the EmailJS
  send payload (Network tab) — visible in the email only after the template is updated.
- No automated tests exist for these flows; verification is manual.
