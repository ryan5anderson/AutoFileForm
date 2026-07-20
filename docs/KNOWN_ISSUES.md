# Known Issues — V0 / V1 Fix List

Distilled from [`V0_SYSTEM_REFERENCE.md`](./V0_SYSTEM_REFERENCE.md) §9. Each item is a v0 defect or fragile area that v1 should close (or deliberately drop). Details and file references live in the system reference.

---

## Architecture / correctness

1. **Submit ordering** — Firebase write + email run before the on-prem POST; a failed POST leaves a saved/emailed orphan with no retry. `emailSent: true` is hardcoded regardless of send outcome.
2. **Local orders never reach on-prem** — known gap (`LOCAL_ORDER_REVIEW_PLAN.md`); v1 drops local schools entirely.
3. **Hardcoded submit URL** — `mytownoriginals.com` is baked into `api/submitorder.ts` while reads use `TARGET_API_URL`. Both on-prem hosts are plain HTTP.
4. **"ORDER REVIEW" filter** — uppercase `SHIRTNAME` substring check duplicated in two places that must stay in sync.
5. **Trailing-space template IDs** — API values often need trim/`%20` encoding; v1 must replicate or fix upstream.
6. **Malformed image URLs** — `http:` patched to `http://` in the proxy helper.
7. **Lenient `school-page` parsing** — on-prem returns wrong content-types / HTML error pages.
8. **CORS / image proxy** — `Access-Control-Allow-Origin: *` everywhere; images round-trip through `/api/proxy-image`.

## Security

9. **Admin password in the client bundle** — compared client-side; 15-min sessionStorage; admin sub-routes not gated.
10. **Firestore effectively open** — client SDK, no auth; anyone can read/write orders and ratios.
11. **Public receipts** — `/receipt/:orderId` exposes full order details.
12. **Open submit proxy** — `/api/submitorder` forwards arbitrary JSON to on-prem.

## Dead / legacy / inconsistent

13. **Legacy pant path** — `sweatpantJoggerOptions` still in validation/email/receipt; superseded by `pantOptions`.
14. **Diagnostic leftovers** — `/test-api/*`, `fetchCollegeOrder`, deprecated `checkProxyHealth`.
15. **Stale docs** — README/`review.txt` claim wrong React/TS versions, missing deps, HashRouter, deleted routes/components.
16. **Dead Order fields** — `products` and `adminNotes` declared but never written.
17. **Pack-size truth split across four layers** — real conflicts (flannels 8 vs 6, sweatpants 4 vs 6, sticker 7 vs 20, crewneck 5 vs 6). See also `GARMENT_RULES_REFERENCE.md` §9.
18. **Debug noise in production** — style-`3930R` traces (dev-only) plus full-order `console.info` on every submit (production).
19. **Committed junk** — `build/404.html`, workspace screenshot assets, `.claude/settings.local.json`, scratch notes.
20. **Hardcoded college maps** — theming/folder fallbacks, filename→color, MSU-only rack names; unknown college → ArizonaState.
21. **Peer-dep papering** — `.npmrc` / install `--legacy-peer-deps` for router 7 / CRA 5.
22. **Tests not in CI** — only categorization + serialization suites exist; nothing runs them automatically.
23. **Store-manager links leak IDs** — account/store/PO in plain query strings.
24. **No draft schema versioning** — beyond `ORDERED1..5` migration; colleges cache key manually `_v1`.
25. **Display options unvalidated** — empty validation block despite “max 4” business rule.

---

When an item is fixed or intentionally dropped in v1, strike it here and note the ruling in `V1_SPEC.md` / `V1_PLAN.md`.
