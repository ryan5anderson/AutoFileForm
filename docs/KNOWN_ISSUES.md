# Known Issues

Open defects and fragile areas in the local-catalog app. Details live in [V0_SYSTEM_REFERENCE.md](./V0_SYSTEM_REFERENCE.md).

---

## Submit

1. **`emailSent` is hardcoded `true`** in `firebaseOrderService.addOrder` before EmailJS actually succeeds. A failed send still looks sent in Firestore.
2. **Firebase write happens before email.** If the email fails, the order is already saved and the user sees an error with no automatic retry.

## Security

3. **Admin password is in the client bundle** — compared in the browser; 15-minute `sessionStorage`; admin sub-routes are not re-gated.
4. **Firestore is open to the client SDK** — no Auth. Deployed rules must allow the unauthenticated reads and writes the app performs.
5. **Public receipts** — `/receipt/:orderId` shows the full stored order to anyone with the id.

## Rules and data

6. **Legacy pant path** — `sweatpantJoggerOptions` is still in validation, email, and receipt alongside `pantOptions`.
7. **Dead Order fields** — `products` and `adminNotes` are declared on `Order` and never written.
8. **Pack sizes disagree across layers** — forced overrides, Firebase ratios, `garment_ratios_final.json`, and `packSizes.ts` can conflict (flannels, sweatpants, stickers, crewneck). See [GARMENT_RULES_REFERENCE.md](./GARMENT_RULES_REFERENCE.md).
9. **Display options are not validated** — the validation block is empty despite a "max 4" business rule.
10. **Unknown college image folders fall back to Arizona State** — `getCollegeFolderName` in `src/utils/asset.ts`.
11. **Old non-catalog orders** — a Firestore `college` value that is not one of the seven keys (for example a historical `api-school:…` id) is rendered from stored `emailTemplateParams` on `/receipt/:orderId`, not from the live catalog.

## Tooling

12. **Peer dependencies** — `.npmrc` and the Vercel install command use `--legacy-peer-deps` for React Router 7 with Create React App 5.
13. **No automated tests** — the Jest suites that existed covered the removed catalog API. Nothing runs in CI.
