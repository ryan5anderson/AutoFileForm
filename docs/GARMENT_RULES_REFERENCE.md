# Garment Rules Reference

This file consolidates garment ordering rules currently implemented in this repo.

Primary sources used:
- `src/config/garment_ratios_final.json`
- `src/config/packSizes.ts`
- `src/config/garmentRatios.ts`
- `src/features/utils/calculations.ts`
- `src/features/utils/naming.ts`
- `src/features/utils/index.ts`
- `src/features/components/panels/PantOptionsPanel.tsx`
- `src/config/colleges/*.json`
- `productconfigs.csv`
- `version-notes.txt`

## 1) Category -> Garment Mapping Rules

Implemented in `getGarmentName(...)` (`src/config/garmentRatios.ts`):

- `tshirt/men`:
  - `tshirt` -> `tshirt`
  - `longsleeve` -> `longsleeve`
  - `crewneck` -> `crewneck`
  - `hoodie` -> `hoodie`
  - no version -> `tshirt` (default)
- `tshirt/women` -> `womens-tshirt`
- any `jacket` path -> `jacket`
- any `flannel` path -> `flannels`
- `pants` or paths containing `sweatpant`:
  - version `joggers`/`jogger` -> `joggers`
  - otherwise -> `sweatpants`
- any `short` path -> `shorts`
- any `sock` path -> `socks`
- any `youth` path -> `youth`
- any `infant` path -> `infant`
- any `sticker` path -> `sticker`
- any `plush` path -> `plush`
- any `bottle` path -> `bottle`
- any `signage` or `display` path -> `signage`

Additional image/category paths recognized in validation helpers:
- `hat`, `beanie`, `displays`, `youth&infant`

## 2) Shirt Versions and Version Filtering Rules

### Base shirt version sets from college category configs
- `tshirt/men`: `tshirt`, `longsleeve`, `hoodie`, `crewneck`
- `tshirt/women`: `tshirt`

### Version restriction logic (`getFilteredShirtVersions(...)`)
- `crewOnlyImages` -> only `crewneck`
- `hoodOnlyImages`, image names containing `hood`, or containing `CM7031` -> only `hoodie` (takes precedence)
- `applique` products -> only `crewneck` and `hoodie`
- tie-dye images (`tieDyeImages`) -> exclude `crewneck`

## 3) Pack Size / Set Pack Rules (Source of Truth)

Pack size is resolved in this order:
1. College-specific Firebase ratio override (if available)
2. `garment_ratios_final.json` `Set Pack`
3. `packSizes.ts` fallback logic

Current `Set Pack` values in `garment_ratios_final.json`:

| Garment | Set Pack |
|---|---:|
| tshirt | 12 |
| longsleeve | 7 |
| crewneck | 5 |
| hoodie | 8 |
| jacket | 6 |
| womens-tshirt | 5 |
| joggers | 6 |
| sweatpants | 6 |
| flannels | 6 |
| shorts | 4 |
| youth | 10 |
| infant | 6 |
| socks | 6 |
| sticker | null |
| plush | null |
| bottle | null |
| signage | null |

### Config fallback pack sizes (`packSizes.ts`)
- `tshirt/men` versions + default: `6`
- `tshirt/women`: `4`
- `jacket`: `6`
- `flannels`: `8`
- `pants`: `4`
- `shorts`: `4`
- `hat`: `6`
- `beanie`: `6`
- `socks`: `6`
- `bottle`: `1`
- `sticker`: `7`
- `plush`: `6`
- `signage`: `1`
- `youth&infant`: `6`
- default fallback: `7`

### Special product-name fallbacks
- `applique` -> `6`
- `tie-dye` / `tie dye` -> `8`
- `fleece short` -> `4`
- `fleece zip` / `fleece_zip` -> `6`
- `infant` / `onsie` -> `6`

## 4) Quantity Validation Rules

Validation is centralized in `validateQuantities(...)` (`src/features/utils/calculations.ts`).

- If quantity is entered (`> 0`), value must satisfy category/version rules.
- General behavior:
  - If a combo is marked `allowsAnyQuantity`: minimum `1` only.
  - Otherwise:
    - if `Set Pack` exists: quantity must be `>= Set Pack` and a multiple of pack size.
    - if `Set Pack` is null: quantity must be a multiple of pack size.

### Combos that allow any quantity
- `tshirt/men` versions: `tshirt`, `longsleeve`, `hoodie`, `crewneck`
- `bottle`
- `signage`

### Display options
- Display option fields (`displayOnly`, `displayStandardCasePack`) use non-negative numeric input.
- No pack-size multiple restriction is enforced for display options in current validation code.
- `version-notes.txt` mentions: "Only 4 display options max, no min. 1 mini, 1 premium, 1 inline, 1 spinner" as a product rule note.

### Maximum quantity
- No global hard max quantity is enforced in the current code.
- Inputs are effectively constrained to non-negative values (UI steppers and sanitization).

## 5) Size Scale Rules

Sizes are driven by ratio `Size Scale` first (`getSizeScaleFromRatiosSync` + `parseSizeScale`), then fallback rules.

Current ratio-defined size scales:

| Garment | Size Scale |
|---|---|
| tshirt | S-XXXL |
| longsleeve | S-XXXL |
| crewneck | S-XXL |
| hoodie | S-XXXL |
| jacket | S-XXL |
| womens-tshirt | S-XXL |
| joggers | S-XXL |
| sweatpants | S-XL |
| flannels | S-XL |
| shorts | S-XL |
| youth | XS-XL |
| infant | 6M-12M |
| socks | SM-XL |
| sticker | N/A |
| plush | N/A |
| bottle | N/A |
| signage | N/A |

Special parsing behavior:
- `SM-XL` socks map to sizes: `SM`, `L/XL`
- `6M-12M` infant maps to sizes: `6M`, `12M`

## 6) Size Distribution per Pack

Current ratio distributions:

- `tshirt` (12): S1 M2 L3 XL3 2X2 3X1
- `longsleeve` (7): S1 M1 L2 XL2 2X1
- `crewneck` (5): S1 M1 L1 XL1 2X1
- `hoodie` (8): S1 M2 L2 XL2 2X1
- `jacket` (6): S some, M1 L2 XL2 2X1
- `womens-tshirt` (5): S1 M1 L1 XL1 2X1
- `joggers` (6): S1 M2 L2 XL1 2X0
- `sweatpants` (6): S1 M2 L2 XL1 2X0
- `flannels` (6): S1 M2 L2 XL1 2X0
- `shorts` (4): S1 M1 L1 XL1
- `youth` (10): XS1 S3 M3 L3 XL0
- `infant` (6): 6M3 12M3
- `socks` (6): SM3 LXL3

## 7) Color Option Rules

### Filename-based color extraction for products with multiple colors
From `src/features/utils/naming.ts`:

- Multi-color is detected by `_or_` patterns.
- Supported patterns:
  - `on_Color1_or_Color2`
  - `on_Color1_or_Color2_or_Color3`
  - special WVU pattern `WhiteGrayor_Navy` -> `White`, `Gray`, `Navy`

### Pant color rules
From `PantOptionsPanel` and types:

- Sweatpants colors: `steel`, `black`, `darkNavy`
- Joggers colors: `steel`, `darkHeather`

`version-notes.txt` confirms:
- Jogger colors are steel and dark heather
- Sweatpant colors are steel, black, and dark navy

## 8) Product Config CSV Snapshot

`productconfigs.csv` includes these rule entries:

- tshirt: `S-XXXL`, quantity `6 or any`
- longsleeve: `S-XXL`, quantity `6 or any`
- crewneck: `S-XXL`, quantity `6 or any`
- hoodie: `S-XXXL`, quantity `6 or any`
- womens tshirt: `S-XXL`, quantity `4`
- sweatpants: `S-XL`, quantity `4`
- shorts: `S-XL`, quantity `4`
- flannels: `S-XL`, quantity `8`
- jackets: `S-XXL`, quantity `6`
- caps/knitcaps: `N/A`, quantity `6`
- socks: `SM-XL`, quantity `6`
- stickers: `N/A`, quantity `7`
- plush: `N/A`, quantity `6`
- bottle: `N/A`, quantity `N/A`
- display cards: `N/A`, quantity `N/A`
- shelf magnets: `N/A`, quantity `N/A`

## 9) Important Consistency Note

There are intentional/legacy differences between:
- ratio-driven `Set Pack` values (`garment_ratios_final.json`)
- fallback config values (`packSizes.ts`)
- csv snapshot values (`productconfigs.csv`)

Current runtime behavior prioritizes ratio/Firebase values first, then falls back.
