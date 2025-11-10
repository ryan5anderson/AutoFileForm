import garmentRatiosData from './garment_ratios_final.json';

interface GarmentRatio {
  Name: string;
  "Set Pack": number | null;
  XS?: number | string;
  Small?: number | string;
  Medium?: number | string;
  Large?: number | string;
  XL?: number | string;
  "2X"?: number | string;
  "3X"?: number | string;
  "Size Scale": string;
  Sizes?: {
    SM?: number;
    LXL?: number;
  };
}

const garmentRatios: GarmentRatio[] = garmentRatiosData as GarmentRatio[];

/**
 * Map category path and version to garment name in JSON
 */
function getGarmentName(categoryPath: string, version?: string): string | null {
  const normalizedCategory = categoryPath.toLowerCase().trim();
  const normalizedVersion = (version || '').toLowerCase().trim();

  // Map category paths and versions to JSON garment names
  if (normalizedCategory === 'tshirt/men') {
    if (normalizedVersion === 'tshirt') return 'tshirt';
    if (normalizedVersion === 'longsleeve') return 'longsleeve';
    if (normalizedVersion === 'crewneck') return 'crewneck';
    if (normalizedVersion === 'hoodie') return 'hoodie';
    // Default to tshirt if no version specified
    return 'tshirt';
  }
  
  if (normalizedCategory === 'tshirt/women') {
    return 'womens-tshirt';
  }
  
  if (normalizedCategory.includes('jacket')) {
    return 'jacket';
  }
  
  if (normalizedCategory.includes('flannel')) {
    return 'flannels';
  }
  
  if (normalizedCategory === 'pants' || normalizedCategory.includes('sweatpant')) {
    if (normalizedVersion === 'joggers' || normalizedVersion === 'jogger') {
      return 'joggers';
    }
    return 'sweatpants';
  }
  
  if (normalizedCategory.includes('short')) {
    return 'shorts';
  }
  
  if (normalizedCategory.includes('sock')) {
    return 'socks';
  }
  
  if (normalizedCategory.includes('youth')) {
    return 'youth';
  }
  
  if (normalizedCategory.includes('infant')) {
    return 'infant';
  }
  
  if (normalizedCategory.includes('sticker')) {
    return 'sticker';
  }
  
  if (normalizedCategory.includes('plush')) {
    return 'plush';
  }
  
  if (normalizedCategory.includes('bottle')) {
    return 'bottle';
  }
  
  if (normalizedCategory.includes('signage') || normalizedCategory.includes('display')) {
    return 'signage';
  }

  return null;
}

/**
 * Get garment ratio data for a category/version combination
 */
export function getGarmentRatio(categoryPath: string, version?: string): GarmentRatio | null {
  const garmentName = getGarmentName(categoryPath, version);
  if (!garmentName) return null;
  
  return garmentRatios.find(ratio => ratio.Name.toLowerCase() === garmentName.toLowerCase()) || null;
}

/**
 * Get pack size from JSON (Set Pack value)
 */
export function getPackSizeFromRatios(categoryPath: string, version?: string): number | null {
  const ratio = getGarmentRatio(categoryPath, version);
  return ratio?.["Set Pack"] ?? null;
}

/**
 * Get size scale from JSON
 */
export function getSizeScaleFromRatios(categoryPath: string, version?: string): string | null {
  const ratio = getGarmentRatio(categoryPath, version);
  return ratio?.["Size Scale"] ?? null;
}

/**
 * Get size distribution ratios for a pack
 * Returns an object mapping size codes to quantities
 */
export function getSizeDistributionRatios(categoryPath: string, version?: string): Record<string, number> | null {
  const ratio = getGarmentRatio(categoryPath, version);
  if (!ratio) return null;

  const distribution: Record<string, number> = {};

  // Handle socks (special case with SM/LXL)
  if (ratio.Sizes) {
    if (ratio.Sizes.SM !== undefined) distribution['SM'] = ratio.Sizes.SM;
    if (ratio.Sizes.LXL !== undefined) distribution['L/XL'] = ratio.Sizes.LXL;
    return distribution;
  }

  // Map JSON size fields to size codes
  if (ratio.XS !== undefined && ratio.XS !== 'some') {
    distribution['XS'] = typeof ratio.XS === 'number' ? ratio.XS : 0;
  }
  if (ratio.Small !== undefined && ratio.Small !== 'some') {
    distribution['S'] = typeof ratio.Small === 'number' ? ratio.Small : 0;
  }
  if (ratio.Medium !== undefined) {
    distribution['M'] = typeof ratio.Medium === 'number' ? ratio.Medium : 0;
  }
  if (ratio.Large !== undefined) {
    distribution['L'] = typeof ratio.Large === 'number' ? ratio.Large : 0;
  }
  if (ratio.XL !== undefined) {
    distribution['XL'] = typeof ratio.XL === 'number' ? ratio.XL : 0;
  }
  if (ratio["2X"] !== undefined) {
    distribution['XXL'] = typeof ratio["2X"] === 'number' ? ratio["2X"] : 0;
  }
  if (ratio["3X"] !== undefined) {
    distribution['XXXL'] = typeof ratio["3X"] === 'number' ? ratio["3X"] : 0;
  }

  return distribution;
}

/**
 * Parse size scale string (e.g., "S-XXXL") into array of sizes
 */
export function parseSizeScale(sizeScale: string): string[] {
  if (sizeScale === 'N/A' || !sizeScale) return [];
  
  // Handle socks special case
  if (sizeScale === 'SM-XL') {
    return ['SM', 'L/XL'];
  }
  
  const parts = sizeScale.split('-');
  if (parts.length !== 2) return [];
  
  const start = parts[0].trim();
  const end = parts[1].trim();
  
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const startIdx = sizeOrder.indexOf(start);
  const endIdx = sizeOrder.indexOf(end);
  
  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) return [];
  
  return sizeOrder.slice(startIdx, endIdx + 1);
}

