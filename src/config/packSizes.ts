/**
 * Pack size configuration for different product categories and shirt versions
 * This defines the minimum purchase quantity (pack size) for each category
 */

interface PackSizeConfig {
  [categoryPath: string]: number | VersionPackSizes;
}

interface VersionPackSizes {
  tshirt?: number;
  longsleeve?: number;
  crewneck?: number;
  hoodie?: number;
  jacket?: number;
  sweatpants?: number;
  shorts?: number;
  flannels?: number;
  default?: number;
}

/**
 * Pack sizes by category path and shirt version
 * You can customize these values as needed for your business requirements
 */
const PACK_SIZES: PackSizeConfig = {
  // T-Shirts (Unisex) - 6 or any quantity allowed for t-shirts and longsleeve
  'tshirt/men': {
    tshirt: 6,        // 6 or any quantity allowed
    longsleeve: 6,    // 6 or any quantity allowed
    crewneck: 6,      // 6 or any quantity allowed
    hoodie: 6,        // 6 or any quantity allowed
    default: 6,       // 6 or any quantity allowed
  },

  // Women's T-Shirts - multiples of 4
  'tshirt/women': 4,

  // Outerwear
  'jacket': 6,       // Multiples of 6
  'flannels': 8,     // Multiples of 8

  // Bottoms
  'pants': 4,        // Sweatpants - multiples of 4
  'shorts': 4,       // Shorts - multiples of 4

  // Caps
  'hat': 6,
  'beanie': 6,

  // Accessories
  'socks': 6,       // Packs of 6
  'bottle': 1,       // Any quantity allowed
  'sticker': 6,
  'plush': 6,
  'signage': 1,      // Signage items - any quantity allowed

  // Youth & Infant
  'youth&infant': 6, // Packs of 6

  // Default fallback
  'default': 7,
};

/**
 * Pack sizes for special product types (detected by name)
 */
const SPECIAL_PACK_SIZES: { [key: string]: number } = {
  'applique': 6,
  'tie-dye': 8,
  'fleece': 6,
  'infant': 6,
  'onsie': 6,
};

/**
 * Get pack size for a given category path and optional shirt version
 * @param categoryPath - The category path (e.g., 'shorts', 'tshirt/men')
 * @param version - Optional shirt version (e.g., 'tshirt', 'hoodie')
 * @param productName - Optional product name to check for special types
 * @returns The pack size for that category/version
 */
export const getPackSize = (categoryPath: string, version?: string, productName?: string): number => {
  // Check for special product types first
  if (productName) {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('applique')) return SPECIAL_PACK_SIZES['applique'];
    if (lowerName.includes('tie-dye') || lowerName.includes('tie dye')) return SPECIAL_PACK_SIZES['tie-dye'];
    if (lowerName.includes('fleece short')) return 4; // Fleece shorts are special case
    if (lowerName.includes('fleece zip') || lowerName.includes('fleece_zip')) return 6;
    if (lowerName.includes('infant') || lowerName.includes('onsie')) return SPECIAL_PACK_SIZES['infant'];
  }

  const config = PACK_SIZES[categoryPath];

  // If config is a number, return it directly
  if (typeof config === 'number') {
    return config;
  }

  // If config is an object with version-specific sizes
  if (config && typeof config === 'object') {
    if (version && version in config) {
      return config[version as keyof VersionPackSizes] ?? config.default ?? PACK_SIZES['default'] as number;
    }
    return config.default ?? PACK_SIZES['default'] as number;
  }

  // Fallback to default
  return PACK_SIZES['default'] as number;
};

/**
 * Check if a category/version allows "pack size or any" (i.e., any quantity OR multiples of pack size)
 * @param categoryPath - The category path (e.g., 'shorts', 'tshirt/men')
 * @param version - Optional shirt version (e.g., 'tshirt', 'hoodie')
 * @param productName - Optional product name to check for special types
 * @returns true if the category/version allows any quantity OR multiples of pack size
 */
export const allowsAnyQuantity = (categoryPath: string, version?: string, productName?: string): boolean => {
  // Unisex t-shirts and longsleeve allow any quantity OR multiples of 6
  if (categoryPath === 'tshirt/men' && (version === 'tshirt' || version === 'longsleeve' || version === 'hoodie' || version === 'crewneck')) {
    return true;
  }

  return false;
};

/**
 * Get pack size validation message
 * @param packSize - The pack size to validate against
 * @param allowsAny - Whether any quantity is also allowed
 * @returns Formatted message for validation errors
 */
// getPackSizeMessage removed - no external usage found

