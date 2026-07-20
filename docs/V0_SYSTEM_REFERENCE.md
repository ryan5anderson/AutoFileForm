# V0 System Reference — AutoFileForm ("College Order Form")

Technical reference for the version-0 codebase, written for the v1 rewrite team. This documents **what exists**, not what should exist. All file paths are relative to the repo root; line numbers refer to the current `main` branch (`a9d78dc`).

Repo: `https://github.com/ryan5anderson/AutoFileForm.git` · Production domain: `https://ohiopylecollege.com`

---

## 1. High-Level Architecture

### 1.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18.2 + TypeScript 4.9.5, Create React App (`react-scripts` 5.0.1) | The README claims "React 19.1.0 / TS 5.9.3" — that is **wrong**; `package.json` pins `react@^18.2.0` and `typescript@^4.9.5`. |
| Routing | `react-router-dom@^7.7.0`, `BrowserRouter` | SPA rewrites handled by `vercel.json`. |
| Serverless | Vercel Node functions in `/api` (`@vercel/node@^2.3.0`, ESM via `api/package.json` → `{"type":"module"}`) | Pure proxies to the on-prem API; no business logic except caching in `school-page`. |
| Database | Firebase Firestore (client SDK `firebase@^12.4.0`) | Used **only** from the browser; no Firebase Admin SDK anywhere. Two collections: `orders`, `garmentRatios` (§4). |
| Email | EmailJS (`emailjs-com@^3.2.0`) | Client-side send; templates live in the EmailJS dashboard, not in this repo (an HTML copy is at `src/services/templates/email_template.html`). |
| Hosting | Vercel (frontend static build + serverless functions) | Auto-deploy on push to `main`. |
| On-prem backend | `http://ohiopyleprints.com` (catalog reads) and `http://mytownoriginals.com` (order submit, images) | Plain HTTP (no TLS). These front the on-prem SQL Server; this repo never talks to SQL directly. |

### 1.2 Repo structure

```
api/                        Vercel serverless functions (colleges, college, school-page, submitorder, proxy-image, health)
api/package.json            {"type":"module"} — makes /api compile as ESM
src/
  index.tsx                 Entry point + ALL route definitions (AppShell)
  app/layout/               Header, Footer, CollapsibleSidebar
  app/routes/               Page components (local flow, API flow, admin, test pages)
  components/               CollegeSelector, CollegeRouteWrapper, ApiCollegeOrderPage, wrappers, ui/
  config/
    colleges/*.json         7 hardcoded "local school" catalogs (Michigan St, Arizona St, Oregon, WVU, Pitt, Alabama, Indiana)
    garment_ratios_final.json  Default pack sizes / size scales / distributions
    packSizes.ts            Fallback + forced pack sizes
    garmentRatios.ts        Ratio lookup (Firebase override → JSON fallback) + size-scale parsing
    env.ts                  Env-var validation (throws at startup if any missing)
    firebase.ts             Firebase app + Firestore init
  contexts/                 OrderFormContext (local flow), ApiCollegeOrderContext (API flow)
  features/
    hooks/useOrderForm.ts   Local-flow state machine (form → summary → receipt → thankyou)
    components/             CategorySection, StoreInfoForm, GarmentRatioEditor, panels/ (size/color/pant/display selectors)
    utils/                  calculations.ts (validation), emailTemplate.ts, naming.ts, sanitize.ts,
                            apiOrderState.ts (API-flow cart state + localStorage), storeManagerLink.ts
  services/
    collegeApiService.ts    All API-school logic: fetch, cache, categorize, group, serialize, submit
    apiCollegeCategorization.ts  Keyword/style-number → category rules
    emailService.ts         EmailJS wrapper
    firebaseOrderService.ts orders CRUD + realtime subscriptions
    firebaseGarmentRatioService.ts  garmentRatios CRUD
  types/index.ts            All shared types
  utils/                    asset.ts, collegeBranding.ts, initializeGarmentRatios.ts
  setupProxy.js             CRA dev proxy: /api/* → http://localhost:3001 (vercel dev)
public/{CollegeName}/       Product PNGs for local schools, organized by category folder; manifest.csv per college
public/logo/                Local-school logos
scripts/extract_pdf_images_with_captions.py  Ingest pipeline: art-approval PDF → public images + college JSON update
scripts/*.pdf               Source art-approval flyers
build/404.html              Committed build artifact (stale)
vercel.json                 Build/rewrite/header config
API_DOCUMENTATION.md, GARMENT_RULES_REFERENCE.md, LOCAL_ORDER_REVIEW_PLAN.md  Existing docs (mostly accurate)
dadNotes.txt, review.txt, version-notes.txt, to-do-prompts.md  Working notes (partially stale)
productconfigs.csv          Garment-code snapshot (mostly empty; only tshirt/womens rows filled)
```

### 1.3 Build & deploy

- **CI/CD:** none in-repo (no GitHub Actions, no tests in CI). Vercel Git integration builds on push to `main`.
- **`vercel.json`:**
  - `buildCommand: npm run build`, `installCommand: npm install --legacy-peer-deps` (also enforced by `.npmrc` → `legacy-peer-deps=true`), `outputDirectory: build`, `framework: create-react-app`.
  - Rewrite `/((?!api|static).*)` → `/index.html` (SPA routing).
  - Headers: `/api/(.*)` gets `Access-Control-Allow-Origin: *`, methods `GET, POST, PUT, DELETE, OPTIONS`; all routes get `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`.
  - `env.REACT_APP_API_BASE_URL = "/api"`.
- **Local dev:** `npm start` = frontend only (local-school config flow works; `/api-school/*` and `/test-api/*` fail). `npm run dev:local` = `concurrently "vercel dev --yes"` (port 3001) + CRA (port 3000) with `src/setupProxy.js` proxying `/api/*` → 3001.

### 1.4 Environment variables

All validated at startup by `src/config/env.ts` (lines 36–85; the app **throws on boot** if any is missing — no fallbacks).

| Variable | Where used | Purpose |
|---|---|---|
| `REACT_APP_EMAILJS_SERVICE_ID` | `src/constants/index.ts` → `emailService.ts` | EmailJS service id |
| `REACT_APP_EMAILJS_TEMPLATE_ID_PROD` | `emailService.ts:18-20` | Template used when hostname is `ohiopylecollege.com` |
| `REACT_APP_EMAILJS_TEMPLATE_ID_DEV` | `emailService.ts:13-23` | Template used on localhost and any other host |
| `REACT_APP_EMAILJS_USER_ID` | `emailService.ts` | EmailJS public key |
| `REACT_APP_PROVIDER_EMAIL` | `emailTemplate.ts` (`provider_email` param) | Displayed in email footer ("Sent automatically ... to {{provider_email}}"); **not** the delivery mechanism — recipients are configured inside the EmailJS template itself |
| `REACT_APP_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`, `_MEASUREMENT_ID` | `src/config/firebase.ts` | Firestore client config (all bundled into the JS) |
| `REACT_APP_ADMIN_PASSWORD` | `src/app/routes/admin.tsx:115` | Plain-text admin password compare (bundled into the JS — see §6) |
| `REACT_APP_API_BASE_URL` | `collegeApiService.ts:19` | Frontend API prefix; defaults `/api`; set by `vercel.json` |
| `TARGET_API_URL` (server-side) | `api/colleges.ts:22`, `api/college.ts:28`, `api/school-page.ts:45`, `api/health.ts:28` | On-prem catalog base URL; default `http://ohiopyleprints.com` |
| `VERCEL_DEV_PORT` (dev only) | `src/setupProxy.js:19` | Port of `vercel dev`, default 3001 |

---

## 2. Data Flow: College/Product Payloads

### 2.1 Topology

**Live, request-time proxying — nothing is synced into Firebase.** Every catalog read goes: browser → Vercel serverless function → on-prem HTTP API (which fronts the SQL Server). The only caching is a 30-minute in-memory cache inside the `school-page` function plus 30-minute client caches (localStorage/in-memory). Firebase only ever receives *submitted orders* and *garment ratio configs* (§4).

There are also **7 fully hardcoded "local school" catalogs** (`src/config/colleges/*.json` + images in `public/`) that never touch the API at all. Those JSONs are generated by `scripts/extract_pdf_images_with_captions.py` from art-approval PDF flyers.

### 2.2 External API endpoints (on-prem)

| # | Endpoint | Method | Called by |
|---|---|---|---|
| 1 | `{TARGET_API_URL}/api/colleges` (default `http://ohiopyleprints.com/api/colleges`) | GET | `api/colleges.ts:30-42`, `api/school-page.ts:49-52,197-200` |
| 2 | `{TARGET_API_URL}/api/college?id={orderTemplateId}` | GET | `api/college.ts:34-49`, `api/school-page.ts:54-60,211-214` |
| 3 | `http://mytownoriginals.com/api/submitorder` (**hardcoded**, `api/submitorder.ts:29`) | POST | `api/submitorder.ts:35-42` |
| 4 | Arbitrary image URLs on `ohiopyleprints.com` / `mytownoriginals.com` | GET | `api/proxy-image.ts:46-51` (domain whitelist at lines 28-41) |

**Endpoint 1 response** — array of school records (fields observed in `api/school-page.ts:5-11` and `collegeApiService.ts:32-40`):

```json
[
  {
    "school_ID": "123",
    "schoolName": "Alabama University",
    "logoUrl": "http://.../logo.png",
    "schoolColors": "CCR/WHT",        // slash-separated 3-letter color codes, mapped in src/utils/collegeBranding.ts:1-33
    "mascot": "Crimson Tide",
    "orderNumTemplate": "AL-001 "      // often has trailing spaces (see normalizeApiOrderTemplateId)
  }
]
```

**Endpoint 2 response** — array of order-template rows, one row per (design × garment style). Typed as `OrderItem` in `src/services/collegeApiService.ts:129-146`:

```ts
interface OrderItem {
  Expr1?: string | null;        // free text; often contains the mockup number "M12345678"
  ORDER_NUM: string;
  DESIGN_NUM: string;
  ITEM_ID: string;              // frequently BLANK in api-school payloads
  SHIRTNAME?: string | null;    // used for categorization; rows containing "ORDER REVIEW" are filtered out
  DESCRIPT?: string | null;
  productUrl?: string | null;   // image URL (sometimes malformed "http:..." without //)
  size1..size5?: string | null; // the 5 size slots this row can be ordered in (e.g. "S","M","L","XL" or "2XL","3XL")
  STYLE_NUM?: string | null;    // garment style, e.g. "3930R", "3930R2X", "3930R3X", "4930R", "240MS"
  COLOR_INIT?: string | null;
  UNITPRICE?: number | null;
  LIN?: ...                     // line number, read dynamically (getApiOrderProductKey, line 495)
  "M#"/M_NUM/MNUM/M_NUMBER/M?: ...  // mockup number, read dynamically (getMockupGroupToken, lines 623-652)
  [key: string]: unknown;
}
```

Both proxy functions unwrap `{data: [...]}` / `{items: [...]}` wrappers and insist on an array. `api/school-page.ts:107-167` additionally has a *lenient* parser (`parseItemsResponseLenient`) that tolerates empty bodies, wrong `Content-Type`, and unwraps `data|items|products|orderItems|order_items|lines` — added because the on-prem host sometimes returns JSON with `text/html` content-type or HTML error pages.

**Endpoint 3 request** — the `ApiOrderPayload` (see §3.1). Response handling is lenient: non-JSON bodies containing "success" or empty bodies are treated as success (`api/submitorder.ts:89-96`).

### 2.3 Vercel serverless endpoints (this repo)

| Route | File | Behavior |
|---|---|---|
| `GET /api/health` | `api/health.ts` | Returns `{status, timestamp, environment, targetApi}` |
| `GET /api/colleges` | `api/colleges.ts` | Proxy of on-prem `/api/colleges`; unwraps `data` wrapper; returns array |
| `GET /api/college?id=` | `api/college.ts` | Proxy of on-prem `/api/college?id=`; unwraps `data`/`items` |
| `GET /api/school-page?id=` | `api/school-page.ts` | **Composite**: fetches colleges list, matches the school by `orderNumTemplate` or `school_ID` (case-insensitive, trimmed — `findCollegeForTemplate`, lines 171-186), then fetches its items. Returns `{orderTemplateId, school:{schoolId, schoolName, logoUrl, orderTemplateId}, items, fetchedAt, expiresAt}`. Caches per-id in module-global `Map`s for 30 min with in-flight request dedupe (lines 31-42, 257-281); `X-Cache-Status: HIT/MISS` header. |
| `POST /api/submitorder` | `api/submitorder.ts` | Forwards body verbatim to `http://mytownoriginals.com/api/submitorder` |
| `GET /api/proxy-image?url=` | `api/proxy-image.ts` | CORS-bypass image proxy; whitelist `ohiopyleprints.com`, `mytownoriginals.com`; 403 otherwise; `Cache-Control: public, max-age=86400` |

All handle `OPTIONS` preflight and set `Access-Control-Allow-Origin: *` themselves (in addition to `vercel.json`).

Note: the production API-school UI uses **`/api/school-page`** (via `fetchApiSchoolPageData`, `collegeApiService.ts:269-342`). `/api/colleges` is used by the home page school list and `sendOrderUrl`; `/api/college` is only used by the legacy `/test-api/*` routes (`fetchCollegeOrder`, lines 347-382).

### 2.4 Client-side caching

- Colleges list: localStorage key `api_colleges_cache_v1`, 30-min TTL, plus in-memory mirror (`collegeApiService.ts:20-104`).
- School page (catalog): in-memory `Map`, 30-min TTL, **cleared when the user switches to a different college** (`collegeApiService.ts:148-172, 276-280`).
- Images: 24 h browser cache via proxy header.

### 2.5 Parsing, categorization, grouping (API schools)

All in `src/services/collegeApiService.ts` (`buildApiOrderCategoryModel`, lines 857-1141) + `src/services/apiCollegeCategorization.ts`.

**Step 1 — filter:** drop rows where `SHIRTNAME` is empty or contains `ORDER REVIEW` (uppercased substring match, lines 858-860; repeated in the serializer at 1183-1185).

**Step 2 — categorize** each row via `categorizeApiCollegeProduct({SHIRT_NAME, DESCRIPT, DESIGN_NUM, STYL_NUM})`. First-match-wins ordered rule list (`API_COLLEGE_CATEGORY_RULES`, `apiCollegeCategorization.ts:177-271`), matching normalized phrases/words and exact/prefix style numbers:

| Order | Category (display name) | Path | Match examples |
|---|---|---|---|
| 1 | Water Bottles / Water Bottle | `bottle` | "WATER BOTTLE", "UV WB"; styles SSBOT, H20BTL, H20BTL2 |
| 2 | Plush | `plush` | "PLUSH", "BEAR", "PREPAK"; styles BPBB, BEARSHI, prefix BEAR |
| 3 | Signage | `signage` | "HEADER CARD", "SPINNER HEADER"; styles SPINSIG, PFDHEAD |
| 4 | Stickers | `sticker` | "STICKER", "DECAL" |
| 5 | Backpack | `backpack` | strong: "BACKPACK","BOOKBAG"; weak "BAG"/"PACK" only in SHIRT_NAME, excluded if "PREPAK"/"CASE PACK"/... |
| 6 | Socks | `socks` | "SOCK", "CREW 8"; style S8052 |
| 7 | Knit Caps / Beanie | `knit-cap` | "BEANIE","KNIT"; styles SP08, 4753, 7341, 7342 (evaluated before hats) |
| 8 | Caps / Hat | `cap` | "CAP","HAT"; styles VC300, VC300D, VC300M2, 4517 |
| 9 | Jackets / Jacket | `jacket` | "JACKET"; style 5617 |
| 10 | Flannel Pajama Pants / Flannels | `flannels` | "FLANNEL","FLA","PAJAMA PANT"; styles F15, F15P (before pants) |
| 11 | Sweatpants & Joggers / Pants | `pants` | "JOGGER","SWEATPANTS","PANTS" (unless shorts phrase present); style prefixes 974, 975 |
| 12 | Shorts | `shorts` | "SHORT","FLEECE SHORT"; style 4890P |
| 13 | Youth & Infant | `youth&infant` | "YOUTH","YTH","TODDLER","INFANT","ONESIE","BABY" |
| 14 | Ladies Tops | `tshirt/women` | "WOMENS","LADIES","GIRLS"; DESCRIPT phrases "GIRL","MOM"; DESIGN_NUM "SDFAMS"; styles 560WVR, IC47WR, prefix 88MR |
| 15 | Unisex T-shirt | `tshirt/men` | style 240MS (incl. 2X/3X/4X/5X suffix), prefix 996E; fallback phrases "TEE","T SHIRT","HOOD","HOODIE","SWEATSHIRT","CREW","TRI BLEND" etc. |
| — | **Unclassified** | `api-products` | anything unmatched |

Unit tests for these rules: `src/services/apiCollegeCategorization.test.ts`.

**Step 3 — group rows into product families** (lines 875-899). Grouping key:
- If a **mockup token** is found (explicit `M#`/`M_NUM`/... field, or an `M\d{5,}` token embedded in `Expr1`/`DESCRIPT`/`SHIRTNAME`): key = `mockup|DESIGN_NUM|COLOR_INIT`.
- Else: key = `DESIGN_NUM|COLOR_INIT|Expr1|productUrl|categoryPath|baseStyleNum`.

**Step 4 — garment-style handling within a family.** `normalizeStyleNum` (lines 713-739) strips extended-size suffixes `2X|3X|4X|5X|2XL|...|5XL` from `STYLE_NUM`, so `3930R`, `3930R2X`, `3930R3X` share base style `3930R`; `4930R` likewise. Rows in a family are then sub-grouped by base style (lines 930-950); each base style becomes a **variant tab** on the product card, labeled with the base style number (`variantDisplayNameByKey`, line 965). For each variant:
- Selectable sizes = union of the rows' `size1..5` values, normalized to canonical tokens (`S→SM, M→MD, L→LG, XXL/2X→2XL, XXXL/3X→3XL`, `CANONICAL_SIZE_BY_TOKEN`, lines 657-676) and sorted by `SIZE_SORT_ORDER`. **API sizes are the source of truth** — 2XL/3XL only appear if a suffixed row exists (comment at lines 815-817; test `collegeApiService.serialization.test.ts:182-209`).
- Each size remembers which raw row it came from (`sizeSourceByVariant`), with a priority scoring that prefers the suffixed row for extended sizes and the base row for regular sizes (`getSourcePriorityScore`, lines 746-756).
- Pack size per variant from `getPackSizeSync(categoryPath, variant, sourceText)` (line 825); `allowAnyQuantity` = true for `tshirt/men`, `signage`, `sticker`, `plush`, `backpack` (lines 589-599).

**Step 5 — category model.** Output: `{categories: Category[], productMap: Record<groupKey, ApiOrderProduct>, sourceToGroupKeyMap}` with a fixed category display order (lines 1095-1112: tshirt/men, tshirt/women, cap, knit-cap, jacket, flannels, pants, shorts, socks, bottle, plush, sticker, backpack, signage, youth&infant, api-products/Unclassified last).

Product keys are deterministic slugs of `ORDER_NUM_DESIGN_NUM_(ITEM_ID|STYLE_NUM|LIN)_Expr1...` (`getApiOrderProductKey`, lines 492-508; ITEM_ID is often blank, hence STYLE_NUM+LIN in the key).

---

## 3. Order Submission Paths

### 3.1 API-school ("internal / college") orders

"Goes directly to on-prem" means: **an HTTPS POST from the browser to the Vercel function `/api/submitorder`, which forwards the JSON verbatim over plain HTTP to `http://mytownoriginals.com/api/submitorder`** (`api/submitorder.ts:29-42`). No file drop, no queue.

**Trigger:** `ApiCollegeSummaryPage.handleConfirmSubmit` (`src/app/routes/ApiCollegeSummaryPage.tsx:143-199`), after the confirmation modal. The sequence is:

1. `firebaseOrderService.addOrder(...)` — order saved to Firestore with `college: "api-school:{orderTemplateId}"` (lines 163-174).
2. `sendOrderEmail(templateParams)` — EmailJS confirmation email (line 175) — **yes, API-school orders also send the email**.
3. `submitApiOrder(orderPayload)` — POST to `/api/submitorder` (line 176; implementation `collegeApiService.ts:1374-1421`). Failure here throws *after* Firebase+email already succeeded.
4. Clear localStorage draft, navigate to `/api-school/{id}/receipt`.

**Payload construction** (`buildApiOrderPayload`, `collegeApiService.ts:1161-1369`): the payload is deliberately **the original API rows echoed back** with quantities written in — "the server gets back what it gave you" (design stated in `to-do-prompts.md`, Prompt 3):

```ts
interface ApiOrderPayload {                       // collegeApiService.ts:1143-1155
  orderTemplateId: string;
  school: { schoolId, schoolName, logoUrl, orderTemplateId } | null;
  items: Array<OrderItem & {                      // EVERY filtered raw row, including ones with all zeros
    ORDERED1: string; ORDERED2: string; ORDERED3: string; ORDERED4: string; ORDERED5: string;  // string quantities
  }>;
  storeInfo: { storeName; storeNumber; poNumber; date };   // storeName = formData.company (5-digit account #)
  subtotal: number;   // Σ qty × UNITPRICE, rounded to cents
  total: number;      // same as subtotal (no tax/shipping)
}
```

Cart → row mapping: for each raw row, user selections are looked up by group key; each selected `(variant, size)` is mapped back to *its* source row via `sizeSourceByVariant` (sizes chosen from a 2X/3X row must serialize onto that row, not the base row — mismatches are skipped, lines 1227-1243), then to the right `ORDEREDn` slot by matching the canonical size against the row's `size1..5` (`getOrderedFieldForRawRowSize`, lines 773-793). Quantities accumulate as strings. Extensive `console.debug` tracing exists for style `3930R` in non-production builds (lines 1170-1181 and onward). Serialization is unit-tested in `src/services/collegeApiService.serialization.test.ts`.

The exact payload is user-visible via the "View Order JSON" panel on both the order form (`ApiCollegeOrderForm.tsx:101-120`) and summary page (`ApiCollegeSummaryPage.tsx:268-306`), with copy-to-clipboard.

**Validation before submit** (`ApiCollegeSummaryPage.tsx:121-141`): store info required; **API schools require `company` (account name) and `storeNumber` to each be exactly 5 digits** (`validateStoreInfo` + `isFiveDigitNumber`, `calculations.ts:198-236`); non-empty cart; no pack-size violations.

### 3.2 Local-school ("external / store runner") orders

**No on-prem POST at all.** Submission = Firebase write + EmailJS email. This gap is explicitly documented in `LOCAL_ORDER_REVIEW_PLAN.md` (lines 7-11: "Nothing is sent to the downstream internal server") along with an unimplemented plan for a review/edit link (`/local-order/:orderId`) that would forward to `mytownoriginals.com`.

**Trigger:** `useOrderForm.handleConfirmSubmit` (`src/features/hooks/useOrderForm.ts:312-366`):

1. Sanitize form text (`sanitizeFormDataTextFields`).
2. `createTemplateParams(formData, categories, schoolName)` (`src/features/utils/emailTemplate.ts:439-467`) builds the EmailJS params.
3. `firebaseOrderService.addOrder({college, storeNumber, storeManager: orderedBy, orderedBy, date, status:'pending', totalItems, orderNotes, formData, emailTemplateParams})` — full form data and template params are persisted so receipts can be regenerated.
4. `sendOrderEmail(templateParams)` (`src/services/emailService.ts:26-40`) — `emailjs.send(SERVICE_ID, templateId, params, USER_ID)`.
5. Clear localStorage draft `orderFormData_{college}`; navigate to `/{college}/receipt`.

**What sends the email:** the **`emailjs-com` v3 library, entirely client-side** — no SendGrid/Nodemailer/serverless mailer. Template selection is hostname-based (`emailService.ts:9-24`): `localhost*` → `REACT_APP_EMAILJS_TEMPLATE_ID_DEV`; `ohiopylecollege.com` → `..._PROD`; anything else → DEV.

**Recipients:** configured **inside the EmailJS template in the EmailJS dashboard** (external to this repo). Nothing in code sets a "to" address. `REACT_APP_PROVIDER_EMAIL` is only interpolated into the email body footer.

**Email contents** (template copy: `src/services/templates/email_template.html`; params: `TemplateParams`, `src/types/index.ts:174-187`): store name/number/manager/ordered-by/date/school, then `{{#receipt_categories}}` loop of product cards (`name`, multi-line `details`, `total_qty`), `{{order_notes}}`, `{{total_units}}`, `{{provider_email}}`. Line items are built by `createEmailCategories` (`emailTemplate.ts:136-437`) which handles every local variant type (shirt versions, colors, pants, infant, display options, plain quantities).

### 3.3 Side-by-side

| | Local schools (`/{college}`) | API schools (`/api-school/{orderTemplateId}`) |
|---|---|---|
| Catalog source | Hardcoded `src/config/colleges/*.json` + `public/` images | Live on-prem API via `/api/school-page` |
| Product identity | Image filename (`M#_code_name.png`) | `ORDER_NUM/DESIGN_NUM/STYLE_NUM/LIN` group keys |
| State container | `OrderFormContext` / `useOrderForm` | `ApiCollegeOrderContext` |
| Draft persistence | localStorage `orderFormData_{college}` | localStorage `apiSchoolOrder_{orderTemplateId}` |
| Store fields | company, storeNumber (free text), poNumber (default `"verbal"`), orderedBy, date | company + storeNumber must be 5-digit numbers; poNumber; orderedBy; date; optionally pre-filled via store-manager link (§7) |
| Validation | `validateQuantities` (`calculations.ts:331-721`) per variant/color path | `validateApiOrder` (`ApiCollegeOrderContext.tsx:33-85`): per-variant total % packSize |
| On submit | Firebase `addOrder` → EmailJS. **No on-prem POST.** | Firebase `addOrder` → EmailJS → **POST `/api/submitorder` → `mytownoriginals.com`** |
| Firebase `college` field | e.g. `"michiganstate"` | `"api-school:{orderTemplateId}"` |
| Pricing | none | subtotal/total from `UNITPRICE` |
| Receipt | rendered from `formData` (`receipt.tsx`) | rendered from cart state (`ApiCollegeReceiptPage.tsx`); admin re-render uses stored `emailTemplateParams.receipt_categories` (`orderReceipt.tsx:13-30`) |

Failure-ordering caveat: in the API flow, if the on-prem POST fails, the Firebase order and email already went out (order status stays `pending`; there is no rollback or retry).

---

## 4. Firebase Usage

Firestore only (no Auth, Storage, or Functions). Initialized in `src/config/firebase.ts`. Firestore security rules are **not in this repo**; the README (lines 423-439) *suggests* rules requiring `request.auth != null`, but the app never authenticates, so the real deployed rules must allow unauthenticated read/write for the app to function at all.

### 4.1 Collection `orders`

Document schema (`Order`, `src/services/firebaseOrderService.ts:31-48`):

```ts
{
  college: string;               // 'michiganstate' | ... | 'api-school:{templateId}' | 'default'
  storeNumber: string;
  storeManager: string;          // always set = orderedBy at write time (useOrderForm.ts:329, ApiCollegeSummaryPage.tsx:166)
  orderedBy: string;
  date: string;                  // yyyy-mm-dd from the form
  status: 'pending' | 'completed' | 'cancelled';   // written as 'pending'; changed only via admin UI
  totalItems: number;
  orderNotes?: string;
  createdAt: string;             // ISO, set in addOrder
  updatedAt: string;
  emailSent: boolean;            // hardcoded true in addOrder (line 60) — written BEFORE the email is actually sent
  adminNotes?: string;           // declared, never written anywhere
  products?: OrderProduct[];     // declared (lines 17-29), never written anywhere
  formData?: FormData;           // full form snapshot (local flow: real FormData; API flow: formData + derived quantities map)
  emailTemplateParams?: TemplateParams;  // exact EmailJS params, used to re-render receipts
}
```

Readers/writers:

| Operation | Code |
|---|---|
| Create | `firebaseOrderService.addOrder` (`firebaseOrderService.ts:54-78`) called from `useOrderForm.ts:326-337` (local) and `ApiCollegeSummaryPage.tsx:163-174` (API). Dispatches DOM event `new-order`. |
| Read all / recent | `getAllOrders` (84-95), `getRecentOrders` (98-116); realtime `subscribeToOrders` (165-179), `subscribeToRecentOrders` (182-200) |
| Update status | `updateOrderStatus` (119-134) — admin dashboard status dropdown |
| Delete | `deleteOrder` (137-149) — admin dashboard; `clearAllOrders` (203-215, testing helper, no UI) |
| By-college filter | `getOrdersByCollege` (152-162) — client-side filter over getAllOrders (currently unused by UI) |
| Receipt lookup | `src/app/routes/orderReceipt.tsx` (route `/receipt/:orderId`) loads via getAllOrders + find |
| Connection check | `admin.tsx:73-88` — `getDocs(query(collection(db,'orders'), limit(1)))` |

### 4.2 Collection `garmentRatios`

Document per scope: doc id `default` plus optional per-college docs keyed by college key. Shape (`firebaseGarmentRatioService.ts:15-32, 118-123`):

```ts
// doc: garmentRatios/{'default' | collegeKey}
{
  ratios: GarmentRatio[];        // full array of garment entries (same shape as garment_ratios_final.json)
  createdAt?, updatedAt: string;
  collegeKey?: string;           // present on college override docs
}

interface GarmentRatio {
  Name: string;                  // 'tshirt' | 'longsleeve' | 'crewneck' | 'hoodie' | 'jacket' | 'womens-tshirt'
                                 // | 'joggers' | 'sweatpants' | 'flannels' | 'shorts' | 'youth' | 'infant'
                                 // | 'socks' | 'sticker' | 'plush' | 'bottle' | 'signage'
  "Set Pack": number | null;
  XS?, Small?, Medium?, Large?, XL?, "2X"?, "3X"?: number | 'some';
  "Size Scale": string;          // 'S-XXXL' | 'S-XXL' | 'S-XL' | 'XS-XL' | '6M-12M' | 'SM-XL' | 'N/A'
  "6M"?, "12M"?: number;         // infant
  Sizes?: { SM?: number; LXL?: number };  // socks
}
```

Readers/writers:

| Operation | Code |
|---|---|
| Read (college → default fallback) | `getGarmentRatios` (`firebaseGarmentRatioService.ts:41-71`); consumed via the in-memory cache in `src/config/garmentRatios.ts:11-40` |
| Auto-seed | `initializeDefaultRatios` (173-190): first read of a missing `default` doc writes `garment_ratios_final.json` into Firestore. Also exposed via `src/utils/initializeGarmentRatios.ts`. |
| Update (creates college override doc) | `updateGarmentRatio` (88-128) — called from the admin garment-ratio editor (`src/features/components/GarmentRatioEditor.tsx` via `src/app/routes/adminProductDetail.tsx`) |
| Delete override | `deleteGarmentRatioOverride` (134-167) |
| List colleges with overrides | `getCollegesWithCustomRatios` (195-209) |

### 4.3 What is NOT in Firebase

School configs, product catalogs, product→category mappings, images, pack curation, email templates, store lists — none of these are in Firebase. Catalog data is either hardcoded JSON (local schools) or fetched live from the on-prem API (API schools).

---

## 5. Packs and Size Constraints

### 5.1 Where definitions live (resolution order)

Pack size for a given category/variant is resolved through **four layers**, first hit wins:

1. **Forced overrides (hardcoded, cannot be overridden by Firebase):** `FORCED_PACK_SIZES` / `FORCED_PACK_SIZES_BY_VERSION` in `src/config/packSizes.ts:78-109` — hat/cap/beanie/knit-cap: 6, jacket: 6, flannels: 8, pants: 4, bottle: 3, version `sweatpants`: 4. Plus a hardcoded early return in `garmentRatios.ts:177-179 & 191-193`: `tshirt/men` with no/`tshirt` version → **12**. Plus `getCorrectPackSize` in `calculations.ts:72-155` hardcodes hat/beanie/jacket→6, flannel→8, sweatpants/pants→4, bottle→3 *before* consulting ratios (local-flow validation only).
2. **Firebase `garmentRatios` college override** (async paths only: `getPackSizeFromRatios(categoryPath, version, collegeKey)`, `garmentRatios.ts:170-182`; the sync path used by most UI reads only the default cache).
3. **`src/config/garment_ratios_final.json` `"Set Pack"`** (the default ratios, auto-seeded into Firebase).
4. **`PACK_SIZES` / `SPECIAL_PACK_SIZES` fallback** in `packSizes.ts:28-76` (name-based: applique 6, tie-dye 8, fleece short 4, fleece zip 6, infant/onsie 6; default fallback 7).

**Nothing pack-related is derived from the SQL payload.** For API schools, only the *available sizes* come from the payload (`size1..5`); pack sizes still come from the layers above via `getPackSizeSync` (`collegeApiService.ts:823-826`).

### 5.2 Effective values

From `garment_ratios_final.json` (defaults; per-college Firebase docs can override for the *local* admin flow):

| Garment | Set Pack | Size Scale | Distribution per pack |
|---|---|---|---|
| tshirt | 12 | S-XXXL | S1 M2 L3 XL3 2X2 3X1 (the curated "Pack of 12") |
| longsleeve | 7 | S-XXXL | S1 M1 L2 XL2 2X1 |
| crewneck | 5 | S-XXL | S1 M1 L1 XL1 2X1 |
| hoodie | 8 | S-XXXL | S1 M2 L2 XL2 2X1 |
| jacket | 6 | S-XXL | S"some" M1 L2 XL2 2X1 |
| womens-tshirt | 5 | S-XXL | S1 M1 L1 XL1 2X1 |
| joggers | 6 | S-XXL | S1 M2 L2 XL1 2X0 |
| sweatpants | 6 | S-XL | S1 M2 L2 XL1 2X0 |
| flannels | 6 | S-XL | S1 M2 L2 XL1 2X0 |
| shorts | 4 | S-XL | S1 M1 L1 XL1 |
| youth | 10 | XS-XL | XS1 S3 M3 L3 XL0 |
| infant | 6 | 6M-12M | 6M:3 12M:3 |
| socks | 6 | SM-XL (→ sizes SM, L/XL) | SM3 LXL3 |
| sticker / plush / bottle / signage | null | N/A | — (packSizes.ts fallbacks apply: sticker 7, plush 6, bottle 3 forced, signage 1) |

Note the forced overrides **win over** ratio values where they conflict: flannels effectively validate as multiples of **8** (forced) even though the ratio says Set Pack 6; sweatpants validate as multiples of **4** (forced) though ratio says 6. Size scales are parsed by `parseSizeScale` (`garmentRatios.ts:362-388`; special cases: `SM-XL` → `['SM','L/XL']`, `6M…` → `['6M','12M']`).

### 5.3 "Any quantity" categories

- Local flow (`getAllowsAnyQuantity`, `calculations.ts:164-181`): `tshirt/men` in versions tshirt/longsleeve/hoodie/crewneck, and `signage` → any quantity ≥ 1. (Also `packSizes.ts:249-256` mirrors the tshirt rule.)
- API flow (`allowsAnyQuantityForVariant`, `collegeApiService.ts:589-599`): `tshirt/men`, `signage`, `sticker`, `plush`, `backpack`.

### 5.4 Where rules are enforced

- **Local flow:** `validateQuantities(formData, categories)` (`calculations.ts:331-721`), run live on every form change (`useOrderForm.ts:80-122`) and again on submit. Rule per selection bucket (simple qty, per-version sizes, per-color, per-version-per-color, pants, sweatpant/jogger legacy, infant): if `allowsAny` → min 1; else if garment has a `Set Pack` → `qty ≥ SetPack` **and** `qty % packSize === 0`; else → `qty % packSize === 0`. Display options have **no** min/max/pack validation (lines 601-612 are an empty block). No global max quantity anywhere.
- **API flow:** `validateApiOrder` (`ApiCollegeOrderContext.tsx:33-85`): per product per variant, if `variantTotal > 0 && !allowAny && total % packSize !== 0` → invalid. (No Set-Pack minimum check in the API flow, only multiples.) Re-checked at submit (`ApiCollegeSummaryPage.tsx:132-135`).
- **UI helpers:** `calcTotals` (packs/remainder/needed, `calculations.ts:747-757`), `getQuantityMultiples` (dropdown suggestions of 1–6 packs, lines 759-788), pack-progress hints in `SizePackSelector` / `CategorySection`.

Historical intent (partly divergent from code) is recorded in `dadNotes.txt` (e.g. "sticker multiples of 20" — code says 7; "T-shirt multiples of 7" — superseded by 12) and `productconfigs.csv` (garment codes 4930R, 3930R, 240MS, 88MR, 996G, etc. mapped to tshirt/womens-tshirt rows only; other rows empty). `GARMENT_RULES_REFERENCE.md` §9 acknowledges the inconsistencies and states runtime priority is ratios/Firebase first.

---

## 6. Auth and Access Control

**There is effectively no authentication.**

- **Admin dashboard (`/admin`):** client-side password gate (`src/app/routes/admin.tsx:112-123`). The entered password is string-compared against `adminConfig.password` = `REACT_APP_ADMIN_PASSWORD`, which is **compiled into the public JS bundle** (any visitor can extract it). On success, `sessionStorage['admin_auth_ts'] = Date.now()`; the session is valid for 15 minutes (`SESSION_KEY`/`SESSION_DURATION`, lines 9-16). No server-side check of any kind; all admin Firestore operations run with the same unauthenticated client SDK as the public app. Admin sub-pages (`/admin/colleges`, `/admin/college/:key`, `/admin/college/:key/product/...`) do not re-check the gate — they rely on navigation flow.
- **Order pages:** all public. Store-manager deep links (`/api-school/{id}?sm=1&company=..&storeNumber=..&poNumber=..`, built by `/send-order-url`, `src/features/utils/storeManagerLink.ts:14-29`) are **URL-obscurity only** — the flag simply pre-fills and locks the store fields (`ApiCollegeOrderContext.tsx:176-182`, `StoreInfoForm`).
- **Receipts:** `/receipt/:orderId` is public; anyone with an order id can view the full order (`orderReceipt.tsx`).
- **Firestore:** rules not in repo; app behavior requires open (or key-only) read/write for `orders` and `garmentRatios`.
- **Serverless functions:** no auth, `Access-Control-Allow-Origin: *`; `/api/submitorder` will forward any POSTed JSON to the on-prem system; `/api/proxy-image` is the only endpoint with any restriction (domain whitelist).

---

## 7. Frontend Flow and State

### 7.1 Route table (`src/index.tsx:103-125`)

| Route | Component | Notes |
|---|---|---|
| `/` | `CollegeSelector` | Shows **API schools** by default (fetches `/api/colleges`), themed cards via `schoolColors` palette (`collegeBranding.ts`) |
| `/local-schools` | `CollegeSelector localOnly` | The 7 hardcoded schools |
| `/about`, `/contact` | static pages |
| `/send-order-url` | `SendOrderUrlPage` | Internal tool: pick API school + 5-digit account/store + PO → copyable store-manager link |
| `/api-school/:orderTemplateId` (+ `/summary`, `/receipt`, `/thankyou` — all rendered by `ApiCollegeOrderPage` switch; `/product/:productId` → `ApiCollegeProductDetail`) | wrapped in `ApiCollegeOrderProvider` | API-school flow |
| `/test-api`, `/test-api/:orderTemplateId`, `/test-api/:orderTemplateId/product/:itemId` | `TestApiPage` etc. | Legacy/diagnostic pages using `/api/colleges` + `/api/college` directly, with health-check + debug panels |
| `/admin` | `AdminPage` | Password gate + recent-10 orders table (realtime), status dropdown, delete, link to `/receipt/:id`, Firebase status indicator |
| `/admin/colleges`, `/admin/college/:collegeKey`, `/admin/college/:collegeKey/product/:category/:productId` | Admin browse of local-school catalogs; product page shows/edits garment ratios (`GarmentRatioEditor` → Firebase college override) |
| `/receipt/:orderId` | `OrderReceiptPage` | Public stored-order receipt; API-school orders re-render from stored `emailTemplateParams.receipt_categories` (`orderReceipt.tsx:13-30`) |
| `/:college/*` | `CollegeRouteWrapper` | Local-school flow; sub-routes `""` (form), `summary`, `receipt`, `thankyou` (all `OrderFormPage` driven by `page` state), `product/:category/:productId` (`ProductDetailPageWrapper`) |

`AppShell` (`index.tsx:45-128`) also manages the global `CollapsibleSidebar` (hidden on form root, admin college view, and api-school routes, which render their own) and college theming decisions. Local-school primary colors are hardcoded per college in `CollegeRouteWrapper.tsx:17-35` by mutating the `--color-primary` CSS custom property on `document.documentElement`; API schools compute a palette from `schoolColors` codes (`src/utils/collegeBranding.ts`).

### 7.2 User flow

**Local school:** `/` → `/local-schools` → `/{college}` (StoreInfoForm at top + `CategorySection` grid per category; complex products link to `/{college}/product/{category}/{productId}` with version tabs / size steppers / color panels) → submit → `/{college}/summary` (read-only review) → ConfirmationModal → Firebase+EmailJS → `/{college}/receipt` (printable) → `/{college}/thankyou`.

**API school:** `/` → `/api-school/{id}` (loading screen while `/api/school-page` fetches; store info with 5-digit constraints; grouped product cards with cart badges/"In Cart" bars per `to-do-prompts.md` Prompt 2; product detail at `/api-school/{id}/product/{groupKey}` with per-style-variant tabs and `SizePackSelector`) → `/api-school/{id}/summary` (review + View Order JSON) → modal → Firebase + EmailJS + on-prem POST → `/api-school/{id}/receipt` → `/thankyou`. Store-manager links carry `?sm=1&company&storeNumber&poNumber` through all navigation (`appendSearchToPath`).

### 7.3 State management & persistence

| Concern | Mechanism | Persistence key | Survives refresh? |
|---|---|---|---|
| Local-school cart + store info | `useOrderForm` hook state exposed through `OrderFormContext` | localStorage `orderFormData_{college}` (write-on-change, `useOrderForm.ts:124-132`) | Yes; on load, `date` is reset to today and `poNumber` defaults to `"verbal"` (lines 17-32). Cleared on successful submit. |
| API-school cart + store info | `ApiCollegeOrderContext` state | localStorage `apiSchoolOrder_{orderTemplateId}` (`apiOrderState.ts:23-53`); shape `{formData:{company,storeNumber,poNumber,storeManager,orderedBy,date}, orderedByProduct:{[groupKey]:{activeVariant, variantQuantities:{variant:{size:qty}}}}}`; legacy `ORDERED1..5` entries migrated on read (lines 92-106) | Yes. Cleared on successful submit. |
| API catalog | in-memory cache (30 min) in `collegeApiService` | — | No (refetch after refresh; server-side `school-page` cache usually makes it fast) |
| Colleges list | localStorage `api_colleges_cache_v1` (30 min) | Yes |
| Admin session | sessionStorage `admin_auth_ts` (15 min) | Per-tab |
| Page position when returning from product detail | router `location.state.returnScrollY` (`ApiCollegeOrderForm.tsx:65-73`) | No |
| Cross-component notifications | DOM `CustomEvent`s: `new-order`, `order-updated`, `order-deleted`, `orders-cleared`, `admin-login` | — | No |

No Redux/zustand (a stale `review.txt` claims zustand is a dep — it is not in `package.json`). The `page` state (`'form'|'summary'|'receipt'|'thankyou'`) in `useOrderForm` is synced with the URL both ways (`useOrderForm.ts:61-77`).

---

## 8. Template / Consolidation Logic

### 8.1 API-school consolidation (the important one)

Implemented in `buildApiOrderCategoryModel` (`collegeApiService.ts:857-1141`); described step-by-step in §2.5. Summary of rules:

1. **Dedupe/group by mockup:** rows sharing an `M#` token (explicit field or `M\d{5,}` embedded in `Expr1`/`DESCRIPT`/`SHIRTNAME`) + same `DESIGN_NUM` + `COLOR_INIT` collapse to **one product card**. Without a mockup token, the fallback identity is `DESIGN_NUM|COLOR_INIT|Expr1|productUrl|categoryPath|baseStyleNum`.
2. **Garment styles become variant tabs:** within a card, rows are sub-grouped by base `STYLE_NUM` after stripping `2X/3X/4X/5X(L)` suffixes (`normalizeStyleNum`, lines 713-739). E.g. rows `3930R` (S–XL), `3930R2X` (2XL), `3930R3X` (3XL) render as one tab "3930R" with sizes S…3XL; a separate `4930R` row family in the same mockup becomes a second tab "4930R".
3. **Size-to-row provenance:** every selectable size remembers its source row (`sizeSourceByVariant`, `availableSizes[].sourceImageKey/sourceStyleNum/sourceItemId`), scored so extended sizes bind to their suffixed row (`getSourcePriorityScore`, lines 746-756). The serializer uses this to write each quantity back to the correct raw row and `ORDEREDn` slot (§3.1).
4. **Card naming:** single-row cards use `STYLE_NUM DESIGN_NUM COLOR_INIT Expr1`; grouped cards drop the style number (`DESIGN_NUM COLOR_INIT Expr1`, lines 1070-1078).
5. **Primary record:** the earliest un-suffixed row wins as the card's image/identity (lines 905-907).

### 8.2 Local-school "template" rules (filename-driven)

- **Version filtering** (`getFilteredShirtVersions`, `src/features/utils/index.ts:8-42`): `crewOnlyImages` → crewneck only; `hoodOnlyImages` OR filename containing `hood` OR `CM7031` → hoodie only (takes precedence over applique); filename containing `lst_only` → longsleeve only; `applique` → crewneck+hoodie; `tieDyeImages` → exclude crewneck. Per-college lists live in the college JSON (`tieDyeImages`, `crewOnlyImages`, `hoodOnlyImages`).
- **Category → garment mapping** (`getGarmentName`, `garmentRatios.ts:56-122`): `tshirt/men`+version → tshirt/longsleeve/crewneck/hoodie; `tshirt/women` → womens-tshirt; jacket/flannel/shorts/socks/youth/infant/sticker/plush/bottle by substring; `pants` → joggers vs sweatpants by version; `signage|display` → signage; hats/beanies return null (fall to packSizes).
- **Color extraction from filenames** (`naming.ts:115-188`): `on_Color1_or_Color2(_or_Color3)` patterns, WVU special `WhiteGrayor_Navy`, plus a hardcoded `explicitColorOptions` map of ~15 exact filenames.
- **Display-name cleanup** (`naming.ts:17-83`): strips `M#_code_` prefix, underscores → spaces, removes color words before "Pants/Jogger(s)".
- **Pant colors:** sweatpants = steel/black/darkNavy; joggers = steel/darkHeather (types `PantOption`, `types/index.ts:98-108`; UI `PantOptionsPanel`).
- **Receipt/email consolidation:** categories sorted with "display" categories last (`emailTemplate.ts:55-62`); per-product line items collapse versions/colors/sizes into `"Version S: 1, M: 2"`-style strings (both local `createEmailCategories` and API `buildApiReceiptCategories`, `emailTemplate.ts:96-134`).

---

## 9. Known Issues and Fragile Areas

**Architecture / correctness**

1. **API submit ordering:** Firebase write and email happen *before* the on-prem POST (`ApiCollegeSummaryPage.tsx:163-179`); a failed POST leaves a saved+emailed order that never reached the on-prem system, with no retry/rollback. `emailSent: true` is hardcoded at write time regardless of the actual email outcome (`firebaseOrderService.ts:60`).
2. **Local orders never reach on-prem** — known gap with an unimplemented plan (`LOCAL_ORDER_REVIEW_PLAN.md`).
3. **`http://mytownoriginals.com/api/submitorder` is hardcoded** (`api/submitorder.ts:29`) while the read endpoints use `TARGET_API_URL`. Both on-prem hosts are plain HTTP.
4. **"ORDER REVIEW" rows** are filtered by uppercase substring on `SHIRTNAME` in two places that must stay in sync (`collegeApiService.ts:858-860` and `1183-1185`).
5. **Trailing-space template IDs:** `orderNumTemplate` values from the API often carry trailing whitespace; `normalizeApiOrderTemplateId` trims them and URLs encode them as `%20` (`storeManagerLink.ts:7-12`) — a data-quality workaround that any v1 must replicate or fix upstream.
6. **Malformed image URLs:** `getProxiedImageUrl` patches `http:` → `http://` (`collegeApiService.ts:397-401`).
7. **Lenient response parsing in `school-page`** exists because the on-prem host returns JSON with wrong content-types / HTML error pages (`api/school-page.ts:104-167`).
8. **CORS workarounds everywhere:** all `/api/*` responses use `Access-Control-Allow-Origin: *` (both `vercel.json` and per-function); images must round-trip through `/api/proxy-image` (adds 100-300 ms first load, per `API_DOCUMENTATION.md:116`).

**Security**

9. **Admin password shipped in the client bundle** and compared client-side; sessionStorage 15-min "session"; admin sub-routes not gated (§6).
10. **Firestore effectively open** (client SDK, no auth); anyone can read/write orders and garment ratios with the bundled config.
11. `/receipt/:orderId` publicly exposes full order details.
12. `/api/submitorder` forwards arbitrary JSON from anyone to the on-prem system.

**Dead / legacy / inconsistent code**

13. `sweatpantJoggerOptions` (`SweatpantJoggerOption`) is a legacy pant path still supported in validation/email/receipt but superseded by `pantOptions`.
14. `/test-api/*` routes + `fetchCollegeOrder` + `checkProxyHealth` (deprecated alias, `collegeApiService.ts:480-484`) are legacy diagnostics.
15. README/`review.txt` inaccuracies: claims React 19 / TS 5.9 (actually 18 / 4.9.5), zustand+classnames deps (absent), HashRouter (actually BrowserRouter), an `allOrders.tsx` route (deleted — admin shows only the 10 most recent orders with no "view all" page), `Field.tsx`/`ButtonIcon.tsx` (absent).
16. `Order.products` and `Order.adminNotes` fields declared but never written.
17. Pack-size truth is split across four layers with real conflicts (flannels 8-forced vs ratio 6; sweatpants 4-forced vs ratio 6; sticker 7 in code vs 20 in `dadNotes.txt`; crewneck 5 vs older note 6). `getQuantityMultiples` uses `require()` inside a function (`calculations.ts:765-768`).
18. Debug scaffolding left in production paths: style-`3930R` trace logging (`collegeApiService.ts:1170-1181` etc., dev-only), full order payload `console.info` on every submit (lines 1377-1382, **runs in production**).
19. Committed artifacts: `build/404.html`, `assets/*.png` (cursor workspace screenshots), `.claude/settings.local.json`, scratch notes (`dadNotes.txt`, `review.txt`, `version-notes.txt`, `to-do-prompts.md`).
20. Hardcoded per-college theming and folder mapping (`CollegeRouteWrapper.tsx:17-35`, `asset.ts:15-26` — unknown college silently falls back to `ArizonaState`), explicit filename→color maps (`naming.ts:118-137`), rack display-name maps for MSU only (`naming.ts:86-101`).
21. `.npmrc legacy-peer-deps=true` + `installCommand --legacy-peer-deps` paper over peer conflicts (router 7 / CRA 5 era).
22. Tests exist only for API categorization and serialization (`apiCollegeCategorization.test.ts`, `collegeApiService.serialization.test.ts`); nothing runs them in CI.
23. Store-manager links put account/store/PO numbers in plain query strings (shared via copy/paste).
24. `localStorage` drafts have no schema versioning beyond the `ORDERED1..5` legacy migration; colleges cache key is manually versioned (`_v1`).
25. Display options have no validation at all (empty block, `calculations.ts:601-612`) despite the noted business rule "only 4 display options max" (`version-notes.txt:28`, `GARMENT_RULES_REFERENCE.md:126-129`).

---

## 10. Dependencies

### Runtime (`package.json` dependencies)

| Package | Version | Used for |
|---|---|---|
| `react`, `react-dom` | ^18.2.0 | UI framework |
| `react-router-dom` | ^7.7.0 | Routing (BrowserRouter, nested routes, search params) |
| `react-scripts` | ^5.0.1 | CRA build/dev tooling (webpack, jest, eslint) |
| `firebase` | ^12.4.0 | Firestore client (orders, garmentRatios) |
| `emailjs-com` | ^3.2.0 | Client-side order confirmation emails (imported with `@ts-ignore`) |
| `@vercel/node` | ^2.3.0 | Types/runtime for the `/api` serverless functions |
| `@types/react`, `@types/react-dom` | ^18.2.0 | TS types (listed under dependencies, not devDependencies) |
| `@testing-library/jest-dom` | ^6.6.3 | Jest DOM matchers (also mislocated in dependencies) |
| `web-vitals` | ^2.1.4 | CRA boilerplate perf metrics (effectively unused) |

### Dev (`devDependencies`)

| Package | Used for |
|---|---|
| `vercel` ^56.2.0 | `vercel dev` local serverless runtime |
| `concurrently` ^8.2.2, `wait-on` ^7.2.0 | `npm run dev:local` orchestration |
| `http-proxy-middleware` ^2.0.6 | `src/setupProxy.js` CRA→vercel-dev proxy |
| `typescript` ^4.9.5 | Type checking |
| `eslint-config-react-app`, `eslint-plugin-import`, `eslint-plugin-jsx-a11y` | Linting (`.eslintrc.json` extends react-app) |
| `stylelint` ^16 + `stylelint-config-standard`/`-css-modules`/`-prettier`, `stylelint-declaration-strict-value`, `stylelint-order` | `npm run lint:css` for `src/**/*.css` |
| `ts-prune` ^0.10.3 | `npm run check:unused` dead-export scan |
| `depcheck` ^1.4.7 | `npm run check:deps` dependency audit |

### External (not in package.json)

- **EmailJS dashboard**: service + DEV/PROD templates + recipient configuration (delivery depends entirely on this external state).
- **Firebase project**: Firestore instance + security rules (rules not in repo).
- **Vercel project**: env vars, domain `ohiopylecollege.com`, Git integration.
- **On-prem APIs**: `ohiopyleprints.com` (catalog), `mytownoriginals.com` (submit, images) — contracts documented in §2/§3.
- **Python ingest script deps**: `PyMuPDF`, `pandas` (`scripts/extract_pdf_images_with_captions.py`, local-school catalog generation only).
