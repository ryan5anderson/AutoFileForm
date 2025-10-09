/**
 * Pack size configuration for different product categories and shirt versions
 * This defines the minimum purchase quantity (pack size) for each category
 */

export interface PackSizeConfig {
  [categoryPath: string]: number | VersionPackSizes;
}

export interface VersionPackSizes {
  tshirt?: number;
  longsleeve?: number;
  crewneck?: number;
  hoodie?: number;
  default?: number;
}

/**
 * Pack sizes by category path and shirt version
 * You can customize these values as needed for your business requirements
 */
export const PACK_SIZES: PackSizeConfig = {
  // T-Shirts (Unisex) - different sizes by version
  'tshirt/men': {
    tshirt: 7,
    longsleeve: 7,
    crewneck: 6,
    hoodie: 8,
    default: 7,
  },
  
  // Women's T-Shirts - all multiples of 8
  'tshirt/women': 8,
  
  // Outerwear
  'jacket': 6,
  'flannels': 8,
  
  // Bottoms
  'pants': 6,        // Sweatpants/Joggers handled via pantOptions
  'shorts': 8,
  
  // Caps
  'hat': 6,
  'beanie': 6,
  
  // Accessories
  'socks': 6,
  'bottle': 1,       // Any quantity allowed
  'sticker': 20,
  'plush': 6,
  'card': 1,         // Display cards - any quantity allowed
  'shelf magnets': 1, // Shelf magnets - any quantity allowed

  // Default fallback
  'default': 7,
};

/**
 * Pack sizes for special product types (detected by name)
 */
export const SPECIAL_PACK_SIZES: { [key: string]: number } = {
  'applique': 6,
  'tie-dye': 8,
  'fleece': 6,
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
 * Get pack size validation message
 * @param packSize - The pack size to validate against
 * @returns Formatted message for validation errors
 */
export const getPackSizeMessage = (packSize: number): string => {
  return `Please ensure all selected garment sizes total to multiples of ${packSize}.`;
};

