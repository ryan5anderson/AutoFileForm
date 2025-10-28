# Unused Exports Review

## Verification Results

Based on import graph analysis, here are the findings for each candidate export:

| Path | Identifier | External refs count | Action |
|------|------------|-------------------|---------|
| `src/reportWebVitals.ts` | default | 0 | **DELETE** - No imports found |
| `src/components/index.ts` | CollegeSelector | 1 | **REMOVE-FROM-BARREL** - Imported directly in src/index.tsx |
| `src/components/index.ts` | OrderFormPage | 0 | **REMOVE-FROM-BARREL** - No external imports |
| `src/config/firebase.ts` | analytics | 0 | **DELETE** - No imports found |
| `src/config/firebase.ts` | default | 0 | **DELETE** - No imports found |
| `src/config/index.ts` | CollegeKey | 0 | **DELETE** - No external imports |
| `src/config/packSizes.ts` | PackSizeConfig | 0 | **KEEP-INTERNAL** - Used in module only |
| `src/config/packSizes.ts` | VersionPackSizes | 0 | **KEEP-INTERNAL** - Used in module only |
| `src/config/packSizes.ts` | PACK_SIZES | 0 | **KEEP-INTERNAL** - Used in module only |
| `src/config/packSizes.ts` | SPECIAL_PACK_SIZES | 0 | **KEEP-INTERNAL** - Used in module only |
| `src/config/packSizes.ts` | getPackSizeMessage | 0 | **DELETE** - No external imports |
| `src/services/orderStorage.ts` | Order | 0 | **KEEP-INTERNAL** - Used in module only |
| `src/services/orderStorage.ts` | orderStorage | 0 | **DELETE** - No external imports |
| `src/utils/index.ts` | asset | 8 | **KEEP** - Used in multiple files |
| `src/utils/index.ts` | getCollegeFolderName | 5 | **KEEP** - Used in multiple files |
| `src/components/ui/index.ts` | ButtonIcon | 0 | **REMOVE-FROM-BARREL** - No external imports |
| `src/features/utils/index.ts` | ValidationResult | 0 | **DELETE** - No external imports |
| `src/features/utils/index.ts` | calculateTotalUnits | 1 | **KEEP** - Used in emailTemplate.ts |
| `src/features/utils/index.ts` | Totals | 1 | **KEEP** - Used in SizePackSelector.tsx |
| `src/features/utils/index.ts` | createEmailCategories | 0 | **DELETE** - No external imports |
| `src/features/components/panels/ShirtVersionPanel.tsx` | default | 0 | **DELETE** - No imports found |
| `src/features/components/panels/SizePackSelector.tsx` | SizePackSelector | 0 | **KEEP-INTERNAL** - Used in module only |

## Detailed Analysis

### Files to Delete Completely
- `src/reportWebVitals.ts` - CRA scaffold file, not imported anywhere
- `src/services/orderStorage.ts` - No external usage, admin functionality unused

### Exports to Remove from Barrels
- `CollegeSelector` from `src/components/index.ts` - Imported directly in index.tsx
- `OrderFormPage` from `src/components/index.ts` - No external imports
- `ButtonIcon` from `src/components/ui/index.ts` - No external imports

### Exports to Make Internal (remove export keyword)
- `PackSizeConfig`, `VersionPackSizes`, `PACK_SIZES`, `SPECIAL_PACK_SIZES` in `src/config/packSizes.ts`
- `Order` in `src/services/orderStorage.ts`
- `SizePackSelector` in `src/features/components/panels/SizePackSelector.tsx`

### Exports to Delete (but keep file)
- `analytics`, `default` from `src/config/firebase.ts`
- `CollegeKey` from `src/config/index.ts`
- `getPackSizeMessage` from `src/config/packSizes.ts`
- `ValidationResult`, `createEmailCategories` from `src/features/utils/index.ts`

### Files to Delete
- `src/features/components/panels/ShirtVersionPanel.tsx` - No imports found

### Exports to Keep (verified usage)
- `asset`, `getCollegeFolderName` from `src/utils/index.ts` - Used in multiple files
- `calculateTotalUnits`, `Totals` from `src/features/utils/index.ts` - Used internally

## Import Graph Summary

The analysis shows:
- Most unused exports are from configuration files or utility modules
- Some components are imported directly rather than through barrel exports
- Several exports are only used within their defining modules
- No circular dependencies detected
- All external usage verified through AST analysis
