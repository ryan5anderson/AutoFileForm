# AutoFileForm ("College Order Form")

College apparel ordering SPA for Ohiopyle Prints. Store runners and internal staff browse school catalogs, build cart orders with pack-size rules, and submit them. Production: [ohiopylecollege.com](https://ohiopylecollege.com).

Two catalog modes:

| Mode | Routes | Catalog | On submit |
|---|---|---|---|
| **API schools** (default home) | `/api-school/:orderTemplateId` | Live on-prem catalog via Vercel proxies | Firestore write → EmailJS → POST to on-prem |
| **Local schools** (7 hardcoded) | `/{college}` via `/local-schools` | JSON in `src/config/colleges/` + images in `public/` | Firestore write → EmailJS only (no on-prem POST) |

Repo: [ryan5anderson/AutoFileForm](https://github.com/ryan5anderson/AutoFileForm.git)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.2 + TypeScript 4.9.5, Create React App (`react-scripts` 5.0.1) |
| Routing | `react-router-dom` 7.7, `BrowserRouter` (SPA rewrites in `vercel.json`) |
| State | React Context + hooks (`OrderFormContext`, `ApiCollegeOrderContext`) — no Redux/zustand |
| Serverless | Vercel Node functions in `/api` (ESM via `api/package.json`) |
| Database | Firebase Firestore client SDK (`orders`, `garmentRatios`) — browser only, no Admin SDK |
| Email | EmailJS (client-side; templates/recipients live in the EmailJS dashboard) |
| Hosting | Vercel (static CRA build + `/api` functions); auto-deploy on push to `main` |
| On-prem backends | `ohiopyleprints.com` (catalog), `mytownoriginals.com` (order submit, images) — plain HTTP |

---

## Repo structure

```
api/                        Vercel serverless proxies (colleges, college, school-page, submitorder, proxy-image, health)
src/
  index.tsx                 Entry + all route definitions (AppShell)
  app/layout/               Header, Footer, CollapsibleSidebar
  app/routes/               Local flow, API flow, admin, test pages
  components/               CollegeSelector, ApiCollegeOrderPage, wrappers, ui/
  config/                   College JSONs, garment ratios, env validation, Firebase init
  contexts/                 Local + API order form contexts
  features/                 Order form hook, category UI, validation, email/naming utils
  services/                 collegeApiService, EmailJS, Firestore order/ratio services
  types/                    Shared TypeScript types
public/{CollegeName}/       Product images for local schools
scripts/                    PDF → image/JSON ingest for local catalogs
vercel.json                 Build, SPA rewrites, CORS/security headers
docs/                       System reference + v1 plan (see below)
```

---

## Local development

```bash
npm install          # .npmrc sets legacy-peer-deps=true
```

Copy env vars into a local `.env` (see table below). The app **throws at startup** if any required `REACT_APP_*` var is missing (`src/config/env.ts`).

| Command | What runs | What works |
|---|---|---|
| `npm start` | CRA only (port 3000) | Local-school flow (`/local-schools`, `/{college}`). `/api-school/*` and `/test-api/*` fail — no serverless proxies. |
| `npm run dev:local` | `vercel dev` (port 3001) + CRA (port 3000); `src/setupProxy.js` proxies `/api/*` → 3001 | Full app: API schools, submit proxy, image proxy, health check. |
| `npm run dev:vercel` | `vercel dev` alone | Serverless functions only. |
| `npm run build` | Production CRA build → `build/` | Same as Vercel build. |
| `npm test` | Jest (CRA) | Categorization + serialization unit tests exist; nothing runs them in CI. |

---

## Environment variables

Validated at boot by `src/config/env.ts` (no fallbacks for the client vars).

| Variable | Purpose |
|---|---|
| `REACT_APP_EMAILJS_SERVICE_ID` | EmailJS service id |
| `REACT_APP_EMAILJS_TEMPLATE_ID_PROD` | Template when hostname is `ohiopylecollege.com` |
| `REACT_APP_EMAILJS_TEMPLATE_ID_DEV` | Template on localhost and other hosts |
| `REACT_APP_EMAILJS_USER_ID` | EmailJS public key |
| `REACT_APP_PROVIDER_EMAIL` | Shown in email footer only — **not** the delivery address (recipients are set in the EmailJS template) |
| `REACT_APP_FIREBASE_API_KEY` | Firestore client config |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | |
| `REACT_APP_FIREBASE_PROJECT_ID` | |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | |
| `REACT_APP_FIREBASE_APP_ID` | |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | |
| `REACT_APP_ADMIN_PASSWORD` | Client-side admin gate (bundled into public JS) |
| `REACT_APP_API_BASE_URL` | Frontend API prefix; defaults `/api`; set in `vercel.json` |
| `TARGET_API_URL` | Server-side catalog base URL; default `http://ohiopyleprints.com` |
| `VERCEL_DEV_PORT` | Dev only — port of `vercel dev`, default `3001` |

Set client vars in Vercel project settings (and locally in `.env`). `TARGET_API_URL` is server-only for the `/api` functions.

---

## Deploy

- **Host:** Vercel Git integration builds on push to `main`. No in-repo CI.
- **`vercel.json`:** `npm run build`, `npm install --legacy-peer-deps`, output `build`, framework `create-react-app`. SPA rewrite sends non-`/api` / non-`/static` paths to `index.html`.
- **Domain:** `ohiopylecollege.com`.
- **External deps not in this repo:** EmailJS dashboard templates/recipients, Firebase project + Firestore rules, on-prem APIs at `ohiopyleprints.com` / `mytownoriginals.com`.

---

## Documentation

| Doc | Contents |
|---|---|
| [docs/V0_SYSTEM_REFERENCE.md](docs/V0_SYSTEM_REFERENCE.md) | Full technical reference for this codebase (architecture, data flows, routes, Firebase, pack rules, known issues) |
| [docs/V1_PLAN.md](docs/V1_PLAN.md) | Ordered plan for the v1 rewrite |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | On-prem / proxy API notes |
| [GARMENT_RULES_REFERENCE.md](GARMENT_RULES_REFERENCE.md) | Pack and size-rule reference |
| [LOCAL_ORDER_REVIEW_PLAN.md](LOCAL_ORDER_REVIEW_PLAN.md) | Unimplemented local-order → on-prem review flow |
