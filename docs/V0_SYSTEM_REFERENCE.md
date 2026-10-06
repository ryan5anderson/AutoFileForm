# System Reference — AutoFileForm ("College Order Form")

Technical reference for the local-catalog app. Paths are relative to the repo root.

Production: `https://ohiopylecollege.com`

---

## 1. Architecture

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18.2 + TypeScript 4.9.5, Create React App (`react-scripts` 5.0.1) | |
| Routing | `react-router-dom` 7.7, `BrowserRouter` | SPA rewrites in `vercel.json` |
| State | `OrderFormContext` + `useOrderForm` | No Redux or zustand |
| Database | Firebase Firestore client SDK | Collections `orders` and `garmentRatios`. No Admin SDK. |
| Email | EmailJS (`emailjs-com`) | Templates and recipients are in the EmailJS dashboard. An HTML copy is at `src/services/templates/email_template.html`. |
| Hosting | Vercel static build | Auto-deploy on push to `main`. No serverless functions. |

```
src/
  index.tsx                 AppShell: header, sidebar, routes
  app/layout/               Header, Footer, CollapsibleSidebar
  app/routes/               form, productDetail, summary, receipt, thankyou, admin, about, contact
  components/               CollegeSelector, CollegeRouteWrapper, OrderFormPage, ProductDetailPageWrapper, ui/
  config/
    colleges/*.json         Seven school catalogs
    index.ts                College registry
    garment_ratios_final.json
    packSizes.ts            Forced and fallback pack sizes
    garmentRatios.ts        Firebase override, then JSON, then packSizes
    env.ts                  Required env vars; throws at startup if any are missing
    firebase.ts             Firebase app + Firestore
  contexts/OrderFormContext.tsx
  features/hooks/useOrderForm.ts
  features/components/      CategorySection, StoreInfoForm, panels, GarmentRatioEditor
  features/utils/           calculations, emailTemplate, naming, sanitize
  services/                 emailService, firebaseOrderService, firebaseGarmentRatioService
public/{CollegeName}/       Product images and manifest.csv
scripts/                    PDF art-approval ingest
```

Schools registered in `src/config/index.ts`: `michiganstate`, `arizonastate`, `oregonuniversity`, `westvirginiauniversity`, `pittsburghuniversity`, `alabamauniversity`, `indianauniversity`.

### Build and deploy

- No in-repo CI. Vercel builds on push to `main`.
- `vercel.json`: `npm run build`, `npm install --legacy-peer-deps`, output `build`. Rewrite `/((?!static).*)` → `/index.html`. Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`.
- Local: `npm start` (port 3000). `npm run build` for a production bundle.

### Environment variables

Validated in `src/config/env.ts`. No fallbacks.

| Variable | Purpose |
|---|---|
| `REACT_APP_EMAILJS_SERVICE_ID` | EmailJS service |
| `REACT_APP_EMAILJS_TEMPLATE_ID_PROD` | Used when hostname is `ohiopylecollege.com` |
| `REACT_APP_EMAILJS_TEMPLATE_ID_DEV` | Used on localhost and every other host |
| `REACT_APP_EMAILJS_USER_ID` | EmailJS public key |
| `REACT_APP_PROVIDER_EMAIL` | Footer text in the email body, not the recipient |
| `REACT_APP_FIREBASE_*` | Firestore client config (bundled into JS) |
| `REACT_APP_ADMIN_PASSWORD` | Admin gate (bundled into JS) |

---

## 2. Routes and UI

| Route | Component |
|---|---|
| `/` | `CollegeSelector` — searchable list of the seven schools |
| `/local-schools` | Redirect to `/` |
| `/about`, `/contact` | Static pages |
| `/admin` | Password gate, recent orders, status, delete, link to receipt |
| `/admin/colleges` | Pick a local catalog |
| `/admin/college/:collegeKey` | Catalog preview |
| `/admin/college/:collegeKey/product/:category/:productId` | Product preview and garment-ratio editor |
| `/receipt/:orderId` | Stored-order receipt |
| `/:college` | Order form |
| `/:college/summary`, `/receipt`, `/thankyou` | Same `OrderFormPage`, page chosen from the URL |
| `/:college/product/:category/:productId` | Product detail |

The global sidebar is hidden on the form root (`/{college}`) and on the admin college view, which have their own navigation. Sidebar links: Back to Colleges (always `/`), Categories (on a college route), About, Contact, Admin. The header logo also goes to `/`.

College colors are set in `CollegeRouteWrapper` by writing `--color-primary` on `document.documentElement`.

### User flow

`/` → `/{college}` (store info + category cards) → product detail when the product has options → `/{college}/summary` → confirmation modal → Firestore + EmailJS → `/{college}/receipt` → `/{college}/thankyou`.

Drafts persist in `localStorage` under `orderFormData_{college}`. On load, `date` resets to today and `poNumber` defaults to `"verbal"`. The draft is cleared after a successful submit.

---

## 3. Order submission

`useOrderForm.handleConfirmSubmit`:

1. Sanitize text fields.
2. `createTemplateParams(formData, categories, schoolName)` builds the EmailJS payload (`src/features/utils/emailTemplate.ts`).
3. `firebaseOrderService.addOrder` saves `college` (the route key), store fields, `formData`, and `emailTemplateParams`. `storeManager` is set to `orderedBy`. Status is `pending`. `emailSent` is written as `true` inside `addOrder` before the send.
4. `sendOrderEmail` calls `emailjs.send`. Template id is chosen by hostname in `emailService.ts`.
5. Clear the localStorage draft and navigate to `/{college}/receipt`.

Recipients are configured in the EmailJS template, not in this repo.

If the college key on a stored order is not in `src/config/index.ts`, `/receipt/:orderId` renders from `emailTemplateParams.receipt_categories` (or `receipt_text`) instead of the live catalog. That covers older orders whose college id is not one of the seven schools.

---

## 4. Firebase

Initialized in `src/config/firebase.ts`. Security rules are not in this repo. The app does not sign users in, so deployed rules must allow the client reads and writes below.

### `orders`

```ts
{
  college: string;          // route key, e.g. "michiganstate"
  storeNumber: string;
  storeManager: string;     // written as orderedBy
  orderedBy: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  totalItems: number;
  orderNotes?: string;
  createdAt: string;
  updatedAt: string;
  emailSent: boolean;       // hardcoded true in addOrder
  adminNotes?: string;      // declared, never written
  products?: OrderProduct[]; // declared, never written
  formData?: FormData;
  emailTemplateParams?: TemplateParams;
}
```

| Operation | Where |
|---|---|
| Create | `useOrderForm` → `addOrder` |
| List / subscribe | Admin dashboard |
| Update status, delete | Admin dashboard |
| Receipt | `/receipt/:orderId` loads all orders and finds the id |

### `garmentRatios`

Document id `default`, plus optional per-college override docs. Shape matches `garment_ratios_final.json`. First read of a missing `default` doc seeds it from that JSON (`initializeDefaultRatios`). The admin product page edits overrides through `GarmentRatioEditor`.

Catalogs, images, and email templates are not stored in Firebase.

---

## 5. Packs and sizes

Resolution order (first match wins):

1. Forced overrides in `src/config/packSizes.ts` and early returns in `garmentRatios.ts` / `getCorrectPackSize` in `calculations.ts`.
2. Firebase college override (async paths).
3. `garment_ratios_final.json` `"Set Pack"`.
4. Name-based fallbacks in `packSizes.ts`.

`validateQuantities` runs on form changes and again before submit. Categories that allow any quantity (`tshirt/men` shirt versions, `signage`) only require quantity ≥ 1. Other garments must meet the pack multiple (and the set-pack minimum when a set pack exists). Display options are not validated.

Full tables and known conflicts: [GARMENT_RULES_REFERENCE.md](./GARMENT_RULES_REFERENCE.md).

---

## 6. Auth

There is no user authentication.

- `/admin` compares the typed password to `REACT_APP_ADMIN_PASSWORD` in the browser and stores `admin_auth_ts` for 15 minutes. Sub-routes do not re-check it.
- Order pages and `/receipt/:orderId` are public.

---

## 7. Adding a school

1. `src/config/colleges/{key}.json`
2. Register the import in `src/config/index.ts`
3. Images in `public/{FolderName}/` and a row in `getCollegeFolderName` (`src/utils/asset.ts`)
4. Theme color in `CollegeRouteWrapper`

Or ingest an art-approval PDF with `scripts/extract_pdf_images_with_captions.py` (see `scripts/README.md`). The script currently prompts for Arizona State, Michigan State, West Virginia, or Pittsburgh; other schools are maintained by hand.
