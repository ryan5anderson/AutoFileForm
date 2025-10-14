# Pack Size Configuration

This document explains how to configure different pack sizes for different product categories, shirt versions, and special product types.

## Overview

The pack size system allows you to set different minimum purchase quantities for:
- Different product categories (e.g., shorts, jackets)
- Different shirt versions within a category (e.g., t-shirt vs hoodie)
- Special product types (e.g., applique, tie-dye)

## Configuration File

Edit `src/config/packSizes.ts` to customize pack sizes for your products.

### Current Pack Size Configuration

```typescript
{
  // T-Shirts (Unisex) - version-specific packs
  'tshirt/men': {
    tshirt: 7,       // Regular t-shirts
    longsleeve: 7,   // Long sleeve
    crewneck: 6,     // Crewneck sweatshirts
    hoodie: 8,       // Hoodies
  },
  
  // Women's T-Shirts - all versions use same pack size
  'tshirt/women': 8,
  
  // Outerwear
  'jacket': 6,
  'flannels': 8,
  
  // Bottoms
  'pants': 6,        // Sweatpants/Joggers
  'shorts': 8,
  
  // Caps
  'hat': 6,
  'beanie': 6,
  
  // Accessories
  'socks': 6,        // Packs of 6
  'bottle': 1,       // Any quantity
  'sticker': 20,
  'plush': 6,
}

// Special products (detected by name)
SPECIAL_PACK_SIZES = {
  'applique': 6,
  'tie-dye': 8,
  'fleece': 6,
}
```

## How to Change Pack Sizes

### Example 1: Simple category with one pack size

```typescript
export const PACK_SIZES: PackSizeConfig = {
  'shorts': 8,  // All shorts use pack of 8
};
```

### Example 2: Category with version-specific pack sizes

```typescript
export const PACK_SIZES: PackSizeConfig = {
  'tshirt/men': {
    tshirt: 7,       // T-shirts in packs of 7
    hoodie: 8,       // Hoodies in packs of 8
    crewneck: 6,     // Crewnecks in packs of 6
    default: 7,      // Fallback for other versions
  },
};
```

### Example 3: Add special product type

```typescript
export const SPECIAL_PACK_SIZES = {
  'applique': 6,    // Any product with "applique" in name
  'tie-dye': 8,     // Any product with "tie-dye" in name
};
```

### Example 4: Change the default for all unlisted categories

```typescript
export const PACK_SIZES: PackSizeConfig = {
  // ... existing configurations
  'default': 10,  // Changed default from 7 to 10
};
```

## How It Works

1. **Category Matching**: The system matches the category path from your JSON configs (e.g., `tshirt/men`, `shorts`, `jacket`)
2. **Pack Size Assignment**: Each product in that category will use the configured pack size
3. **Validation**: When users select sizes, the total must be a multiple of the pack size
4. **Helper Text**: The UI automatically shows "Add X more to complete a pack of Y"

## Category Paths

The category path comes from the `path` field in your college JSON configurations:

```json
{
  "name": "Shorts",
  "path": "shorts",  // <-- This is what's used for pack size lookup
  "hasShirtVersions": true,
  // ...
}
```

## Testing

After changing pack sizes:

1. Clear your browser cache or do a hard refresh
2. Navigate to a product in the affected category
3. Try adding sizes - the validation should reflect your new pack size
4. The "Split evenly" button will distribute based on the new pack size

## Priority Order

The system checks pack sizes in this order:

1. **Special product name** (e.g., "applique", "tie-dye", "fleece short")
2. **Version-specific** (e.g., hoodie within tshirt/men category)
3. **Category path** (e.g., shorts, jacket)
4. **Default** fallback

## Notes

- Pack sizes apply to products with size selectors (S, M, L, XL, XXL)
- Sweatpants/Joggers use step increments (steppers increase by pack size)
- Bottles have pack size of 1 (any quantity allowed)
- Special product detection is case-insensitive
- Display options and other special categories use their own logic

## Current Business Rules

Based on your requirements:
- T-shirts: 7 (unisex), 8 (women)
- Long sleeve: 7
- Crewneck: 6
- Hoodie: 8
- Sweatpants/Joggers: 6
- Shorts: 8 (regular), 4 (fleece shorts)
- Flannels: 8
- Jackets: 6
- Caps: 6
- Socks: 6
- Stickers: 20
- Plush: 6
- Applique: 6
- Tie-dye: 8

