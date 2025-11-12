import { firebaseGarmentRatioService, GarmentRatio } from '../services/firebaseGarmentRatioService';

import garmentRatiosData from './garment_ratios_final.json';

// Cache for ratios to avoid repeated Firebase calls
let ratiosCache: { [key: string]: GarmentRatio[] } = {};

/**
 * Initialize ratios cache from Firebase or fallback to JSON
 */
async function initializeRatiosCache(collegeKey?: string): Promise<void> {
  const cacheKey = collegeKey || 'default';
  
  if (ratiosCache[cacheKey]) {
    return; // Already cached
  }

  try {
    // Try to get from Firebase
    const firebaseRatios = await firebaseGarmentRatioService.getGarmentRatios(collegeKey);
    if (firebaseRatios && firebaseRatios.length > 0) {
      ratiosCache[cacheKey] = firebaseRatios;
      return;
    }
  } catch (error) {
    console.warn('Could not load ratios from Firebase, using JSON fallback:', error);
  }

  // Fallback to JSON file
  ratiosCache[cacheKey] = garmentRatiosData as GarmentRatio[];
}

/**
 * Get garment ratios for a college (with caching)
 */
async function getRatiosForCollege(collegeKey?: string): Promise<GarmentRatio[]> {
  await initializeRatiosCache(collegeKey);
  const cacheKey = collegeKey || 'default';
  return ratiosCache[cacheKey] || [];
}

/**
 * Clear the cache (useful after updates)
 */
export function clearRatiosCache(collegeKey?: string): void {
  if (collegeKey) {
    delete ratiosCache[collegeKey];
  } else {
    ratiosCache = {};
  }
}

/**
 * Map category path and version to garment name in JSON
 */
export function getGarmentName(categoryPath: string, version?: string): string | null {
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
 * Now supports college-specific overrides via Firebase
 * Falls back to default if college-specific override doesn't exist
 */
export async function getGarmentRatio(
  categoryPath: string, 
  version?: string, 
  collegeKey?: string
): Promise<GarmentRatio | null> {
  const garmentName = getGarmentName(categoryPath, version);
  if (!garmentName) return null;
  
  // If college key provided, try college-specific first, then fall back to default
  if (collegeKey) {
    const collegeRatios = await getRatiosForCollege(collegeKey);
    const collegeRatio = collegeRatios.find(ratio => ratio.Name.toLowerCase() === garmentName.toLowerCase());
    if (collegeRatio) {
      return collegeRatio;
    }
    // Fall back to default if not found in college-specific
    const defaultRatios = await getRatiosForCollege();
    return defaultRatios.find(ratio => ratio.Name.toLowerCase() === garmentName.toLowerCase()) || null;
  }
  
  // No college key, just get default
  const ratios = await getRatiosForCollege();
  return ratios.find(ratio => ratio.Name.toLowerCase() === garmentName.toLowerCase()) || null;
}

/**
 * Synchronous version for backward compatibility (uses default ratios)
 * Use async version when college-specific ratios are needed
 */
export function getGarmentRatioSync(categoryPath: string, version?: string): GarmentRatio | null {
  const garmentName = getGarmentName(categoryPath, version);
  if (!garmentName) return null;
  
  const defaultRatios = ratiosCache['default'] || (garmentRatiosData as GarmentRatio[]);
  return defaultRatios.find(ratio => ratio.Name.toLowerCase() === garmentName.toLowerCase()) || null;
}

/**
 * Get pack size from ratios (Set Pack value)
 * Supports college-specific overrides
 */
export async function getPackSizeFromRatios(
  categoryPath: string, 
  version?: string, 
  collegeKey?: string
): Promise<number | null> {
  const ratio = await getGarmentRatio(categoryPath, version, collegeKey);
  return ratio?.["Set Pack"] ?? null;
}

/**
 * Synchronous version for backward compatibility
 * Supports college-specific ratios if collegeKey is provided and cache is available
 */
export function getPackSizeFromRatiosSync(categoryPath: string, version?: string, collegeKey?: string): number | null {
  // If college key provided, try to get from college-specific cache
  if (collegeKey && ratiosCache[collegeKey]) {
    const garmentName = getGarmentName(categoryPath, version);
    if (garmentName) {
      const collegeRatio = ratiosCache[collegeKey].find(ratio => ratio.Name.toLowerCase() === garmentName.toLowerCase());
      if (collegeRatio?.["Set Pack"] !== null && collegeRatio?.["Set Pack"] !== undefined) {
        return collegeRatio["Set Pack"];
      }
    }
  }
  
  // Fall back to default
  const ratio = getGarmentRatioSync(categoryPath, version);
  return ratio?.["Set Pack"] ?? null;
}

/**
 * Get size scale from ratios
 * Supports college-specific overrides
 */
export async function getSizeScaleFromRatios(
  categoryPath: string, 
  version?: string, 
  collegeKey?: string
): Promise<string | null> {
  const ratio = await getGarmentRatio(categoryPath, version, collegeKey);
  return ratio?.["Size Scale"] ?? null;
}

/**
 * Synchronous version for backward compatibility
 * Supports college-specific ratios if collegeKey is provided and cache is available
 */
export function getSizeScaleFromRatiosSync(categoryPath: string, version?: string, collegeKey?: string): string | null {
  // If college key provided, try to get from college-specific cache
  if (collegeKey && ratiosCache[collegeKey]) {
    const garmentName = getGarmentName(categoryPath, version);
    if (garmentName) {
      const collegeRatio = ratiosCache[collegeKey].find(ratio => ratio.Name.toLowerCase() === garmentName.toLowerCase());
      if (collegeRatio?.["Size Scale"]) {
        return collegeRatio["Size Scale"];
      }
    }
  }
  
  // Fall back to default
  const ratio = getGarmentRatioSync(categoryPath, version);
  return ratio?.["Size Scale"] ?? null;
}

/**
 * Get size distribution ratios for a pack
 * Returns an object mapping size codes to quantities
 * Supports college-specific overrides
 */
export async function getSizeDistributionRatios(
  categoryPath: string, 
  version?: string, 
  collegeKey?: string
): Promise<Record<string, number> | null> {
  const ratio = await getGarmentRatio(categoryPath, version, collegeKey);
  if (!ratio) return null;

  const distribution: Record<string, number> = {};

  // Handle socks (special case with SM/LXL)
  if (ratio.Sizes) {
    if (ratio.Sizes.SM !== undefined) distribution['SM'] = ratio.Sizes.SM;
    if (ratio.Sizes.LXL !== undefined) distribution['L/XL'] = ratio.Sizes.LXL;
    return distribution;
  }

  // Handle infant sizes (6M, 12M)
  if (ratio["6M"] !== undefined) {
    distribution['6M'] = typeof ratio["6M"] === 'number' ? ratio["6M"] : 0;
  }
  if (ratio["12M"] !== undefined) {
    distribution['12M'] = typeof ratio["12M"] === 'number' ? ratio["12M"] : 0;
  }
  if (ratio["6M"] !== undefined || ratio["12M"] !== undefined) {
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
 * Synchronous version of getSizeDistributionRatios for backward compatibility
 */
export function getSizeDistributionRatiosSync(
  categoryPath: string, 
  version?: string
): Record<string, number> | null {
  const ratio = getGarmentRatioSync(categoryPath, version);
  if (!ratio) return null;

  const distribution: Record<string, number> = {};

  // Handle socks (special case with SM/LXL)
  if (ratio.Sizes) {
    if (ratio.Sizes.SM !== undefined) distribution['SM'] = ratio.Sizes.SM;
    if (ratio.Sizes.LXL !== undefined) distribution['L/XL'] = ratio.Sizes.LXL;
    return distribution;
  }

  // Handle infant sizes (6M, 12M)
  if (ratio["6M"] !== undefined) {
    distribution['6M'] = typeof ratio["6M"] === 'number' ? ratio["6M"] : 0;
  }
  if (ratio["12M"] !== undefined) {
    distribution['12M'] = typeof ratio["12M"] === 'number' ? ratio["12M"] : 0;
  }
  if (ratio["6M"] !== undefined || ratio["12M"] !== undefined) {
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
  
  // Handle infant sizes special case
  if (sizeScale.includes('6M')) {
    return ['6M', '12M'];
  }
  
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

