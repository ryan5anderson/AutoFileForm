# AutoFileForm ("College Order Form")

College apparel ordering app for Ohiopyle Prints. Store runners browse a local school catalog, build a cart with pack-size rules, and submit. Production: [ohiopylecollege.com](https://ohiopylecollege.com).

Catalogs are JSON in `src/config/colleges/` with images in `public/`. Submitting an order writes it to Firestore and sends an EmailJS confirmation. There is no live catalog API.

Repo: [ryan5anderson/AutoFileForm](https://github.com/ryan5anderson/AutoFileForm.git)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.2 + TypeScript 4.9.5, Create React App (`react-scripts` 5.0.1) |
| Routing | `react-router-dom` 7.7, `BrowserRouter` (SPA rewrites in `vercel.json`) |
| State | React Context + hooks (`OrderFormContext`) |
| Database | Firebase Firestore client SDK (`orders`, `garmentRatios`) — browser only |
| Email | EmailJS (client-side; templates and recipients live in the EmailJS dashboard) |
| Hosting | Vercel static CRA build; auto-deploy on push to `main` |

---

## Repo structure

```
src/
  index.tsx                 Entry + route definitions (AppShell)
  app/layout/               Header, Footer, CollapsibleSidebar
  app/routes/               Order flow, admin, about, contact
  components/               CollegeSelector, wrappers, ui/
  config/                   College JSONs, garment ratios, env validation, Firebase init
  contexts/                 Order form context
  features/                 Order form hook, category UI, validation, email helpers
  services/                 EmailJS, Firestore order and ratio services
  types/                    Shared TypeScript types
public/{CollegeName}/       Product images
scripts/                    PDF → image/JSON ingest for catalogs
vercel.json                 Build, SPA rewrites, security headers
docs/                       System reference, garment rules, known issues
```

---

## Routes

| Route | What it does |
|---|---|
| `/` | School list (searchable) |
| `/local-schools` | Redirects to `/` |
| `/{college}` | Order form |
| `/{college}/product/:category/:productId` | Product options |
| `/{college}/summary` | Review |
| `/{college}/receipt` | Printable receipt |
| `/{college}/thankyou` | Confirmation |
| `/about`, `/contact` | Static pages |
| `/admin` | Password gate and recent orders |
| `/admin/colleges` | Pick a catalog to preview |
| `/admin/college/:collegeKey` | Catalog preview and ratio editor entry |
| `/receipt/:orderId` | Stored order receipt |

Schools: Michigan State, Arizona State, Oregon, West Virginia, Pittsburgh, Alabama, Indiana.

---

## Local development

```bash
npm install          # .npmrc sets legacy-peer-deps=true
npm start            # http://localhost:3000
npm run build        # production build in build/
```

Copy env vars into a local `.env` (see `.env.example`). The app throws at startup if any required `REACT_APP_*` var is missing (`src/config/env.ts`).

| Variable | Purpose |
|---|---|
| `REACT_APP_EMAILJS_SERVICE_ID` | EmailJS service id |
| `REACT_APP_EMAILJS_TEMPLATE_ID_PROD` | Template when hostname is `ohiopylecollege.com` |
| `REACT_APP_EMAILJS_TEMPLATE_ID_DEV` | Template on localhost and other hosts |
| `REACT_APP_EMAILJS_USER_ID` | EmailJS public key |
| `REACT_APP_PROVIDER_EMAIL` | Shown in the email footer only — not the delivery address |
| `REACT_APP_FIREBASE_*` | Firestore client config |
| `REACT_APP_ADMIN_PASSWORD` | Client-side admin gate (bundled into public JS) |

Set the same client vars in Vercel project settings for production.

---

## Adding or updating a school

1. Add or edit `src/config/colleges/{key}.json` (`name`, `logo`, `categories`).
2. Register it in `src/config/index.ts`.
3. Put images under `public/{FolderName}/` and map the key in `src/utils/asset.ts` (`getCollegeFolderName`).
4. Set the theme color in `src/components/CollegeRouteWrapper.tsx`.

Art-approval PDFs can be ingested with `scripts/extract_pdf_images_with_captions.py`. See [scripts/README.md](scripts/README.md).

---

## Deploy

- **Host:** Vercel Git integration builds on push to `main`.
- **`vercel.json`:** `npm run build`, `npm install --legacy-peer-deps`, output `build`. Non-static paths rewrite to `index.html`.
- **Domain:** `ohiopylecollege.com`.
- **Outside this repo:** EmailJS dashboard templates and recipients, Firebase project and Firestore rules.

---

## Documentation

| Doc | Contents |
|---|---|
| [docs/V0_SYSTEM_REFERENCE.md](docs/V0_SYSTEM_REFERENCE.md) | Architecture, routes, submit flow, Firebase, pack rules |
| [docs/GARMENT_RULES_REFERENCE.md](docs/GARMENT_RULES_REFERENCE.md) | Pack and size-rule reference |
| [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) | Open defects and security notes |
