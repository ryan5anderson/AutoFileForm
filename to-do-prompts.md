# College Order Form — Implementation Prompts

---

## Prompt 1: Multi-Level Caching Strategy

**Goal:** Implement a hierarchical caching system for colleges and their associated products to optimize performance and resource usage.

**Requirements:**

- Cache the main colleges list for 30 minutes after first load
- When a user selects a college, cache that college's product catalog for 30 minutes
- Allow users to navigate back to previously loaded products within the same college without reloading from the API
- When a user navigates away to a different college, clear the previous college's cache to free up resources
- Display loading states while fetching from the API (not from cache)
- Implement timestamp-based expiration logic that automatically removes stale data

**Technical Details:**

- Determine whether to use browser storage (if client-side) or session state
- Define cache key structure for colleges vs. products separately
- Create a mechanism to track which college is currently "active" to know when to clear previous cache
- Add expiration checks on every cache read

**Success Criteria:**

- Switching between colleges clears old cache but keeps current college data in memory
- Second load of the same college is instant (from cache)
- User can browse back/forward within a college without triggering API calls
- Switching colleges clears old data to prevent memory bloat

---

## Prompt 2: Shopping Cart Visual Display + Input Persistence

**Goal:** Save user size/quantity selections into form state as they type, then surface that saved state visually on each product card using the three-layer indicator system from `CategorySection.tsx`.

---

### Part A — Input persistence (must be built first)

This is the foundation. The cart visual is meaningless without it.

**When a user changes a size input or quantity field on a product card, that value must be written into `formData` immediately.** The mechanism should mirror how the local school flow saves inputs — tie each input's `onChange` into the same `formData` update path used by `useOrderForm` / `OrderFormContext`.

Specifically:

- Each size/variant input on a product card must be a controlled input whose value reads from `formData`
- On change, update the matching size/variant node inside `formData` for that product
- This must work for all input types present in the API product cards: numeric qty fields, size selectors, color/variant combos — whatever the API schema surfaces
- `formData` is the single source of truth; do not maintain a separate local cart state
- Persistence across navigation within the same college session should come naturally from `formData` living in `OrderFormContext` (or localStorage as a fallback, matching the local school pattern)

---

### Part B — Cart visual indicators (driven by saved formData)

Once inputs are wired into `formData`, each product card reads back from it to determine its display state. Three UI layers, all derived from `formData`:

**1. Badge (top-right corner)**

~40×40px circular badge, absolutely positioned top-right of the card:

- **Cart badge** — when `hasValidQty` is true and no validation error:
  - Background: `#2563eb`, white 🛒 icon centered
- **Error badge** — when a validation error exists (always overrides cart badge):
  - Background: `#dc2626`, white `!` centered
- Only one badge shown at a time; error wins

**2. "In Cart" bar (bottom of card)**

Shown only when `hasValidQty` is true and the view is editable:

- Anchored 8px from bottom and both sides of the card
- Background: `rgba(37, 99, 235, 0.85)`, `backdrop-filter: blur(4px)`, light shadow
- Label: `"In Cart:"` bold at `~0.75rem`
- One pill per size/variant that has a qty > 0:
  - Format: `Qty: X` or `Size / Color: X` depending on variant type
  - Pill background: `rgba(255, 255, 255, 0.2)`, border radius `4px`, font `~0.65rem`

**3. Error overlay (full card)**

When validation errors exist:

- Full-card tint: `rgba(220, 38, 38, 0.15)`
- Rounded with `var(--radius-lg)`
- `pointer-events: none`

**State logic:**

- `hasValidQty` → cart badge + "In Cart" bar
- `hasError` → error badge + red overlay, suppress cart badge and bar
- `hasValidQty && hasError` → error wins on badge; overlay shows; bar hidden
- Neither → nothing shown

**Cart data passed to the bar** is derived directly from `formData` for that product — an array of `{ label: string, qty: number }` for every size/variant node where qty > 0.

**Success Criteria:**

- Inputs are controlled and write to `formData` on every change
- Navigating away and back within the college session preserves all entered quantities
- Badge and bar reflect live `formData` state, not a derived copy
- Error overlay is purely visual and never blocks interaction
- All three layers work on API-driven product cards

---

## Prompt 3: "View Order JSON" Button

**Goal:** Expandable JSON view that reflects the exact payload received from the API, with user size/quantity inputs merged in — plus copy and send options.

**Core principle:** The JSON displayed and sent is not a separately constructed object. It is the original product JSON received from the on-prem API, with the user's size selections and quantities written directly into it. No reformatting, no reshaping — the server gets back what it gave you, plus the filled-in inputs.

**Mutation logic:**

When a user fills in a size/quantity on a product card, write those values into the corresponding field(s) on the original API response object for that product. The structure of where quantities live depends on your API's schema — but the rule is: find the size/variant node in the received JSON and set its quantity field there, in place.

**Button behavior:**

- Sits at the bottom of the order form
- Clicking toggles an expanded panel open/closed
- Button label updates: `"View Order JSON"` → `"Hide Order JSON"` when open

**Expanded panel contents:**

- Formatted `<pre>` block showing the full mutated JSON (pretty-printed, `JSON.stringify(payload, null, 2)`)
- The JSON includes the full original API structure plus:
  - All products with user-entered quantities written into their size/variant nodes
  - A `subtotal` field appended at the root level
  - A `total` field appended at the root level
- **"Copy JSON"** button — copies raw JSON to clipboard, brief "Copied!" confirmation
- **"Send Order"** button — POSTs the exact same JSON object to the backend API endpoint

**Send behavior:**

- Loading state on "Send Order" while in flight
- On success: green inline confirmation, keep panel open
- On error: red inline error with failure reason, keep panel open
- Do not close or reset the panel automatically after send

**Success Criteria:**

- The JSON in the panel is the API-received object, not a rebuilt one
- Size/qty inputs are reflected live in the displayed JSON as the user edits
- Copy and Send both use the exact same object
- No data is lost or restructured between receive, display, and send

---

## Prompt 4: Send Email → Summary → Receipt Flow

**Goal:** Implement the order completion flow matching the existing local school pattern: Summary Page review → Confirmation Modal → Email send + Firebase write → Receipt Page.

**This flow already exists for local schools. Mirror it exactly for the API-driven colleges, using the same components and services.**

---

### Summary Page (`summary.tsx`)

Reuse the existing `SummaryPage` component. For API colleges it should:

- Render store info at the top (college name, relevant metadata)
- Render one `CategorySection` per category with `readOnly={true}`
- Each `CategorySection` renders an `OrderSummaryCard` per product showing quantities, sizes, and options as saved in `formData`
- Show order notes section if present
- **"Back to Form"** → `handleBack()` → navigates to `/{college}`
- **"Send Order"** → opens `ConfirmationModal`

---

### Confirmation Modal + Send sequence

Reuse `ConfirmationModal`. On "Yes, Send Order", `handleConfirmSubmit` runs:

1. `firebaseOrderService.addOrder()` saves the order to Firestore and dispatches `new-order`
2. `createTemplateParams()` builds EmailJS template params from `formData` and categories
3. `sendOrderEmail(templateParams)` sends via EmailJS using `email_template.html` placeholders
4. On success: clear localStorage, close modal, navigate to `/{college}/receipt`
5. On error: keep modal open, show error message inline

The modal shows `"Processing..."` with a loading state during send.

---

### Receipt Page (`receipt.tsx`)

Reuse the existing `ReceiptPage`. For API colleges it should render:

- Store info: company, college name, manager, ordered by, date
- Categories and products with all quantities — supporting the same variant types as the local version: Display Options, Sweatpants/Joggers, Pant Options, Infant sizes, Shirt Versions, Size Options, Color Options, simple quantities
- Order notes if present
- **"Back to Summary"** → `/{college}/summary`
- **"Exit"** → `/{college}/thankyou`
- **"Print Receipt"** → `window.print()`

---

### Data flow

`OrderFormContext` wraps the entire flow. `formData` from context is the single source of truth read by Summary, passed into `createTemplateParams`, written to Firebase, and rendered on the Receipt. No data should be re-fetched or reconstructed at the Summary or Receipt stage — it all comes from `formData`.

**Success Criteria:**

- Summary renders a correct read-only view of all entered quantities before send
- Confirmation modal shows loading and surfaces errors without closing prematurely
- Firebase write and EmailJS send both complete before navigating to Receipt
- Receipt matches the submitted order exactly and is printable
- The flow is route-consistent with local schools: `/{college}` → `/{college}/summary` → `/{college}/receipt` → `/{college}/thankyou`

