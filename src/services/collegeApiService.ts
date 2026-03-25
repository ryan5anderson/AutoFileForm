/**
 * College API Service - Vercel Edition
 * 
 * This service handles all communication with the college order API
 * through Vercel serverless functions.
 */

import { getSizeScaleFromRatiosSync, parseSizeScale } from '../config/garmentRatios';
import { getPackSizeSync } from '../config/packSizes';
import { ApiOrderCategoryModel, ApiOrderProduct, Category } from '../types';

import {
  API_COLLEGE_CATEGORIES,
  categorizeApiCollegeProduct,
  getCategoryPathForApiCollegeCategory,
} from './apiCollegeCategorization';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const COLLEGES_CACHE_TTL_MS = 30 * 60 * 1000;
const COLLEGES_CACHE_KEY = 'api_colleges_cache_v1';

let inMemoryCollegesCache: { data: CollegeData[]; expiresAt: number } | null = null;

export interface CollegeListItem {
  orderTemplateId: string;
  collegeName: string;
  // Add other fields as needed
}

// Type for the actual API response data structure
export interface CollegeData {
  school_ID: string;
  schoolName: string;
  logoUrl?: string | null;
  schoolColors?: string | null;
  mascot?: string | null;
  orderNumTemplate: string;
  [key: string]: unknown; // Allow for additional fields from the API
}

export interface CollegeOrder {
  orderTemplateId: string;
  collegeName: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    // Add other product fields
  }>;
  // Add other order fields
}

const readCollegesCache = (): CollegeData[] | null => {
  const now = Date.now();
  if (inMemoryCollegesCache && inMemoryCollegesCache.expiresAt > now) {
    return inMemoryCollegesCache.data;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(COLLEGES_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { data?: unknown; expiresAt?: unknown };
    if (!Array.isArray(parsed.data) || typeof parsed.expiresAt !== 'number' || parsed.expiresAt <= now) {
      window.localStorage.removeItem(COLLEGES_CACHE_KEY);
      return null;
    }
    inMemoryCollegesCache = {
      data: parsed.data as CollegeData[],
      expiresAt: parsed.expiresAt,
    };
    return inMemoryCollegesCache.data;
  } catch {
    return null;
  }
};

const writeCollegesCache = (data: CollegeData[]): void => {
  const expiresAt = Date.now() + COLLEGES_CACHE_TTL_MS;
  inMemoryCollegesCache = { data, expiresAt };

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      COLLEGES_CACHE_KEY,
      JSON.stringify({
        data,
        expiresAt,
      })
    );
  } catch {
    // Best effort cache write only.
  }
};

/**
 * Synchronous cache check for colleges list. Use before fetchColleges to avoid
 * showing loading state when data is already cached.
 */
export function getCollegesFromCache(): CollegeData[] | null {
  return readCollegesCache();
}

export interface ApiSchoolPageData {
  orderTemplateId: string;
  school: {
    schoolId: string | null;
    schoolName: string | null;
    logoUrl: string | null;
    schoolColors?: string | null;
    orderTemplateId: string;
  } | null;
  items: OrderItem[];
  fetchedAt: string;
  expiresAt: string;
}

// Type for individual order items returned from the API
export interface OrderItem {
  Expr1?: string;
  ORDER_NUM: string;
  DESIGN_NUM: string;
  ITEM_ID: string;
  SHIRTNAME?: string | null;
  DESCRIPT?: string | null;
  productUrl?: string | null;
  size1?: string | null;
  size2?: string | null;
  size3?: string | null;
  size4?: string | null;
  size5?: string | null;
  STYLE_NUM?: string | null;
  COLOR_INIT?: string | null;
  UNITPRICE?: number | null;
  [key: string]: unknown; // Allow for additional fields from the API
}

// --- Product catalog cache (in-memory, 30 min TTL, cleared on college switch) ---
const SCHOOL_PAGE_CACHE_TTL_MS = 30 * 60 * 1000;
const schoolPageCache = new Map<string, { data: ApiSchoolPageData; expiresAt: number }>();
let activeCollegeId: string | null = null;

function readSchoolPageCache(orderTemplateId: string): ApiSchoolPageData | null {
  const now = Date.now();
  const entry = schoolPageCache.get(orderTemplateId);
  if (!entry || entry.expiresAt <= now) {
    if (entry) {
      schoolPageCache.delete(orderTemplateId);
    }
    return null;
  }
  return entry.data;
}

function writeSchoolPageCache(orderTemplateId: string, data: ApiSchoolPageData): void {
  const expiresAt = Date.now() + SCHOOL_PAGE_CACHE_TTL_MS;
  schoolPageCache.set(orderTemplateId, { data, expiresAt });
}

function clearSchoolPageCacheForCollege(orderTemplateId: string): void {
  schoolPageCache.delete(orderTemplateId);
}

/**
 * Fetches the list of all available colleges
 */
export async function fetchColleges(): Promise<CollegeData[]> {
  const cached = readCollegesCache();
  if (cached) {
    return cached;
  }

  const collegesUrl = `${API_BASE_URL}/colleges`;
  try {
    const response = await fetch(collegesUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (e) {
        responseText = 'Could not read response';
      }

      const errorInfo: ApiErrorInfo = {
        message: `Failed to fetch colleges: ${response.status} ${response.statusText}`,
        status: response.status,
        statusText: response.statusText,
        url: collegesUrl,
        responseText: responseText.substring(0, 500),
      };

      const error = new Error(errorInfo.message) as Error & { apiError?: ApiErrorInfo };
      error.apiError = errorInfo;
      throw error;
    }

    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data)) {
      writeCollegesCache(data);
      return data;
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      writeCollegesCache(data.data);
      return data.data;
    } else if (data && typeof data === 'object' && Array.isArray(data.colleges)) {
      writeCollegesCache(data.colleges);
      return data.colleges;
    } else {
      console.warn('Unexpected response format:', data);
      // Return empty array if format is unexpected
      return [];
    }
  } catch (error) {
    console.error('Error fetching colleges:', error);
    
    // If it's already an error with apiError, re-throw it
    if (error instanceof Error && 'apiError' in error) {
      throw error;
    }

    // Otherwise, wrap it with API error info
    const errorMessage = error instanceof Error ? error.message : String(error);
    const apiError: ApiErrorInfo = {
      message: errorMessage,
      url: collegesUrl,
      error: errorMessage,
    };
    const wrappedError = new Error(`Failed to fetch colleges: ${errorMessage}`) as Error & { apiError?: ApiErrorInfo };
    wrappedError.apiError = apiError;
    throw wrappedError;
  }
}

/**
 * Synchronous cache check for a college's product catalog. Use before fetchApiSchoolPageData
 * to avoid showing loading state when data is already cached.
 */
export function getSchoolPageFromCache(orderTemplateId: string): ApiSchoolPageData | null {
  return readSchoolPageCache(orderTemplateId);
}

export interface FetchApiSchoolPageResult {
  data: ApiSchoolPageData;
  fromCache: boolean;
}

/**
 * Fetches all data required for an API school page.
 * Client-side cache: 30 min TTL, in-memory. When switching to a different college,
 * the previous college's cache is cleared to free resources.
 */
export async function fetchApiSchoolPageData(orderTemplateId: string): Promise<FetchApiSchoolPageResult> {
  if (!orderTemplateId) {
    throw new Error('Order template ID is required');
  }

  const now = Date.now();

  // When switching to a different college, clear the previous college's cache
  if (activeCollegeId !== null && activeCollegeId !== orderTemplateId) {
    clearSchoolPageCacheForCollege(activeCollegeId);
  }
  activeCollegeId = orderTemplateId;

  // Check cache on every read (timestamp-based expiration)
  const cached = readSchoolPageCache(orderTemplateId);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  const schoolPageUrl = `${API_BASE_URL}/school-page?id=${encodeURIComponent(orderTemplateId)}`;
  const response = await fetch(schoolPageUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch school page data: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  let result: ApiSchoolPageData;
  // Backward-compatible fallback if endpoint returns a bare array.
  if (Array.isArray(data)) {
    result = {
      orderTemplateId,
      school: null,
      items: data as OrderItem[],
      fetchedAt: new Date().toISOString(),
      expiresAt: new Date(now + SCHOOL_PAGE_CACHE_TTL_MS).toISOString(),
    };
  } else {
    const payload = data as Partial<ApiSchoolPageData>;
    const items = Array.isArray(payload.items) ? payload.items : [];
    result = {
      orderTemplateId: payload.orderTemplateId || orderTemplateId,
      school: payload.school || null,
      items: items as OrderItem[],
      fetchedAt: payload.fetchedAt || new Date().toISOString(),
      expiresAt: payload.expiresAt || new Date(now + SCHOOL_PAGE_CACHE_TTL_MS).toISOString(),
    };
  }

  writeSchoolPageCache(orderTemplateId, result);
  return { data: result, fromCache: false };
}

/**
 * Fetches a specific college order by ID
 */
export async function fetchCollegeOrder(orderTemplateId: string): Promise<OrderItem[]> {
  try {
    if (!orderTemplateId) {
      throw new Error('Order template ID is required');
    }

    const response = await fetch(`${API_BASE_URL}/college?id=${encodeURIComponent(orderTemplateId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch college order: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return data.data;
    } else if (data && typeof data === 'object' && Array.isArray(data.items)) {
      return data.items;
    } else {
      console.warn('Unexpected response format for college order:', data);
      // Return empty array if format is unexpected
      return [];
    }
  } catch (error) {
    console.error('Error fetching college order:', error);
    throw error;
  }
}

/**
 * Gets a proxied image URL to bypass CORS restrictions
 */
export function getProxiedImageUrl(originalUrl: string | null | undefined): string | null {
  if (!originalUrl) {
    return null;
  }

  const trimmedUrl = originalUrl.trim();
  if (trimmedUrl === '') {
    return null;
  }

  // Fix malformed URLs (http: instead of http://)
  let fixedUrl = trimmedUrl;
  if (trimmedUrl.startsWith('http:') && !trimmedUrl.startsWith('http://')) {
    fixedUrl = trimmedUrl.replace('http:', 'http://');
  }

  // If it's already a data URL or blob URL, return as-is
  if (fixedUrl.startsWith('data:') || fixedUrl.startsWith('blob:')) {
    return fixedUrl;
  }

  // If it's from the same origin, no need to proxy
  try {
    const urlObj = new URL(fixedUrl);
    if (urlObj.origin === window.location.origin) {
      return fixedUrl;
    }
  } catch (e) {
    // Invalid URL, try to proxy it anyway
  }

  // Use proxy for external images
  const encodedUrl = encodeURIComponent(fixedUrl);
  return `${API_BASE_URL}/proxy-image?url=${encodedUrl}`;
}

/**
 * Detailed API error information
 */
export interface ApiErrorInfo {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  responseText?: string;
  error?: string;
}

/**
 * Checks if the API is healthy and returns detailed error info if it fails
 */
export async function checkApiHealth(): Promise<{ healthy: boolean; error?: ApiErrorInfo }> {
  try {
    const healthUrl = `${API_BASE_URL}/health`;
    const response = await fetch(healthUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (e) {
        responseText = 'Could not read response';
      }

      return {
        healthy: false,
        error: {
          message: `API health check failed with status ${response.status}`,
          status: response.status,
          statusText: response.statusText,
          url: healthUrl,
          responseText: responseText.substring(0, 500), // Limit to 500 chars
        }
      };
    }

    return { healthy: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('API health check failed:', error);
    return {
      healthy: false,
      error: {
        message: 'Failed to connect to API',
        error: errorMessage,
        url: `${API_BASE_URL}/health`,
      }
    };
  }
}

/**
 * Legacy alias for checkApiHealth (for backward compatibility)
 * @deprecated Use checkApiHealth instead
 */
export const checkProxyHealth = checkApiHealth;

const sanitizeApiKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const getApiOrderProductKey = (item: OrderItem): string => {
  const base = [
    item.ORDER_NUM || '',
    item.DESIGN_NUM || '',
    item.ITEM_ID || '',
    item.Expr1 || '',
  ].join('_');
  return sanitizeApiKey(base || `${Date.now()}`);
};

export const getApiOrderImageKey = (item: OrderItem): string =>
  `${getApiOrderProductKey(item)}_image`;

const inferApparelVariantFromSource = (sourceText: string): string => {
  if (/\bhood(?:ie|ed)?\b/.test(sourceText)) return 'hoodie';
  if (/\bcrew[\s-]?neck\b/.test(sourceText) || /\bcrew\s+sweatshirt\b/.test(sourceText)) {
    return 'crewneck';
  }
  if (/\blong[\s-]?sleeve\b/.test(sourceText)) return 'longsleeve';
  return 'tshirt';
};

const getRuleSourceText = (item: OrderItem): string =>
  [
    item.productUrl || '',
    item.Expr1 || '',
    item.SHIRTNAME || '',
    item.DESCRIPT || '',
    item.STYLE_NUM || '',
    item.DESIGN_NUM || '',
    item.COLOR_INIT || '',
  ]
    .join(' ')
    .toLowerCase();

const getCategoryName = (categoryPath: string): string => {
  const names: Record<string, string> = {
    'tshirt/men': API_COLLEGE_CATEGORIES.UNISEX_TSHIRT,
    'tshirt/women': API_COLLEGE_CATEGORIES.LADIES_TOPS,
    cap: API_COLLEGE_CATEGORIES.CAPS_HAT,
    'knit-cap': API_COLLEGE_CATEGORIES.KNIT_CAPS_BEANIE,
    jacket: API_COLLEGE_CATEGORIES.JACKETS,
    flannels: API_COLLEGE_CATEGORIES.FLANNELS,
    pants: API_COLLEGE_CATEGORIES.PANTS,
    shorts: API_COLLEGE_CATEGORIES.SHORTS,
    socks: API_COLLEGE_CATEGORIES.SOCKS,
    bottle: API_COLLEGE_CATEGORIES.WATER_BOTTLES,
    plush: API_COLLEGE_CATEGORIES.PLUSH,
    sticker: API_COLLEGE_CATEGORIES.STICKERS,
    backpack: API_COLLEGE_CATEGORIES.BACKPACK,
    signage: API_COLLEGE_CATEGORIES.SIGNAGE,
    'youth&infant': API_COLLEGE_CATEGORIES.YOUTH_INFANT,
    'api-products': API_COLLEGE_CATEGORIES.UNCLASSIFIED,
  };
  return names[categoryPath] || API_COLLEGE_CATEGORIES.UNCLASSIFIED;
};

const inferVariantOptions = (categoryPath: string, sourceText: string): string[] => {
  if (categoryPath === 'tshirt/men') return ['tshirt'];

  if (categoryPath === 'pants') {
    return sourceText.includes('jogger') ? ['joggers'] : ['sweatpants'];
  }
  if (categoryPath === 'tshirt/women') return [inferApparelVariantFromSource(sourceText)];
  if (categoryPath === 'cap') return ['cap'];
  if (categoryPath === 'knit-cap') return ['beanie'];
  if (categoryPath === 'jacket') return ['jacket'];
  if (categoryPath === 'flannels') return ['flannels'];
  if (categoryPath === 'shorts') return ['shorts'];
  if (categoryPath === 'socks') return ['socks'];
  if (categoryPath === 'youth&infant') return sourceText.includes('infant') || sourceText.includes('onsie') || sourceText.includes('onesie') ? ['infant'] : ['youth'];
  if (categoryPath === 'sticker') return ['sticker'];
  if (categoryPath === 'plush') return ['plush'];
  if (categoryPath === 'backpack') return ['backpack'];
  if (categoryPath === 'bottle') return ['bottle'];
  if (categoryPath === 'signage') return ['signage'];
  return ['default'];
};

const getFallbackSizesForVariant = (variant: string): string[] => {
  if (variant === 'infant') return ['6M', '12M'];
  if (variant === 'socks') return ['SM', 'L/XL'];
  if (variant === 'youth') return ['XS', 'S', 'M', 'L', 'XL'];
  if (variant === 'shorts' || variant === 'flannels' || variant === 'sweatpants' || variant === 'joggers') return ['S', 'M', 'L', 'XL'];
  if (variant === 'jacket' || variant === 'crewneck' || variant === 'longsleeve' || variant === 'tshirt') return ['S', 'M', 'L', 'XL', 'XXL'];
  if (variant === 'hoodie') return ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  return [];
};

const allowsAnyQuantityForVariant = (categoryPath: string, _variant: string): boolean => {
  if (categoryPath === 'tshirt/men') {
    return true;
  }
  return (
    categoryPath === 'bottle' ||
    categoryPath === 'signage' ||
    categoryPath === 'sticker' ||
    categoryPath === 'plush' ||
    categoryPath === 'backpack'
  );
};

const STYLE_VARIANT_SUFFIX_REGEX = /(2X|3X|4X|5X|2XL|3XL|4XL|5XL)$/i;
const EXTENDED_SIZE_REGEX = /^(2X|3X|4X|5X|2XL|3XL|4XL|5XL)$/i;

export interface NormalizedStyleNum {
  rawStyleNum: string;
  baseStyleNum: string;
  variantSuffix: string | null;
}

const normalizeComparisonToken = (value: string | null | undefined): string =>
  (value || '').trim().toUpperCase();

const readFirstNonEmptyToken = (
  values: Array<string | number | null | undefined>
): string => {
  for (const value of values) {
    const normalized = normalizeComparisonToken(value == null ? '' : String(value));
    if (normalized) return normalized;
  }
  return '';
};

const getMockupGroupToken = (item: OrderItem): string => {
  const dynamicRecord = item as Record<string, unknown>;
  const explicitToken = readFirstNonEmptyToken([
    dynamicRecord['M#'] as string | null | undefined,
    dynamicRecord['M_NUM'] as string | null | undefined,
    dynamicRecord['MNUM'] as string | null | undefined,
    dynamicRecord['M_NUMBER'] as string | null | undefined,
    dynamicRecord['M'] as string | null | undefined,
  ]);
  if (explicitToken) return explicitToken;

  // Some payloads only expose M# as free text (commonly Expr1).
  const textCandidates = [
    item.Expr1,
    item.DESCRIPT,
    item.SHIRTNAME,
    dynamicRecord['MOCKUP'] as string | null | undefined,
    dynamicRecord['MOCKUP_NUM'] as string | null | undefined,
  ];
  for (const candidate of textCandidates) {
    const normalized = normalizeComparisonToken(candidate || '');
    if (!normalized) continue;
    const directMatch = normalized.match(/^M\d{5,}$/);
    if (directMatch) return directMatch[0];
    const embeddedMatch = normalized.match(/\bM\d{5,}\b/);
    if (embeddedMatch) return embeddedMatch[0];
  }

  return '';
};

const normalizeSizeToken = (value: string | null | undefined): string =>
  (value || '').trim().toUpperCase().replace(/\s+/g, '');

const CANONICAL_SIZE_BY_TOKEN: Record<string, string> = {
  S: 'SM',
  SM: 'SM',
  M: 'MD',
  MD: 'MD',
  L: 'LG',
  LG: 'LG',
  XL: 'XL',
  XXL: '2XL',
  '2XL': '2XL',
  '2X': '2XL',
  XXXL: '3XL',
  '3XL': '3XL',
  '3X': '3XL',
  '4XL': '4XL',
  '4X': '4XL',
  OSFA: 'OSFA',
  AST: 'AST',
};

const SIZE_SORT_ORDER: Record<string, number> = {
  XS: 10,
  SM: 20,
  MD: 30,
  LG: 40,
  XL: 50,
  '2XL': 60,
  '3XL': 70,
  '4XL': 80,
  '5XL': 90,
  'S/M': 100,
  'L/XL': 110,
  OSFA: 120,
  AST: 130,
};

export const normalizeApiSizeToCanonical = (
  value: string | null | undefined
): string => {
  const token = normalizeSizeToken(value);
  if (!token) return '';
  return CANONICAL_SIZE_BY_TOKEN[token] || token;
};

const getSizeSortRank = (displaySize: string): number => {
  const canonical = normalizeApiSizeToCanonical(displaySize);
  return SIZE_SORT_ORDER[canonical] ?? Number.MAX_SAFE_INTEGER;
};

const isExtendedSizeLabel = (value: string | null | undefined): boolean => {
  const normalized = normalizeApiSizeToCanonical(value);
  if (!normalized) return false;
  if (EXTENDED_SIZE_REGEX.test(normalized)) return true;
  return normalized.startsWith('2X') || normalized.startsWith('3X') || normalized.startsWith('4X') || normalized.startsWith('5X');
};

export const normalizeStyleNum = (styleNum: string | null | undefined): NormalizedStyleNum => {
  const rawStyleNum = (styleNum || '').trim().toUpperCase();
  if (!rawStyleNum) {
    return {
      rawStyleNum: '',
      baseStyleNum: '',
      variantSuffix: null,
    };
  }

  const match = rawStyleNum.match(STYLE_VARIANT_SUFFIX_REGEX);
  if (!match) {
    return {
      rawStyleNum,
      baseStyleNum: rawStyleNum,
      variantSuffix: null,
    };
  }

  const variantSuffix = match[1].toUpperCase();
  const baseStyleNum = rawStyleNum.slice(0, rawStyleNum.length - variantSuffix.length).trim();
  return {
    rawStyleNum,
    baseStyleNum: baseStyleNum || rawStyleNum,
    variantSuffix,
  };
};

export const extractNonEmptyApiSizes = (item: OrderItem): string[] =>
  [item.size1, item.size2, item.size3, item.size4, item.size5]
    .map((size) => (size || '').trim())
    .filter((size): size is string => size.length > 0);

const getSourcePriorityScore = (sizeLabel: string, styleInfo: NormalizedStyleNum): number => {
  const extendedSize = isExtendedSizeLabel(sizeLabel);
  const suffix = styleInfo.variantSuffix || '';
  if (extendedSize) {
    if (suffix && normalizeSizeToken(sizeLabel).startsWith(suffix)) return 8;
    if (suffix) return 6;
    return 2;
  }
  if (!suffix) return 7;
  return 1;
};

const findCanonicalMapKey = (
  map: Record<string, unknown>,
  targetSize: string
): string | null => {
  if (Object.prototype.hasOwnProperty.call(map, targetSize)) {
    return targetSize;
  }
  const targetToken = normalizeApiSizeToCanonical(targetSize);
  if (!targetToken) return null;
  const matched = Object.keys(map).find(
    (size) => normalizeApiSizeToCanonical(size) === targetToken
  );
  return matched || null;
};

export const getOrderedFieldForRawRowSize = (
  rawRow: OrderItem,
  canonicalSize: string
): 'ORDERED1' | 'ORDERED2' | 'ORDERED3' | 'ORDERED4' | 'ORDERED5' | null => {
  if (!canonicalSize) return null;
  for (let index = 1; index <= 5; index += 1) {
    const slot = `size${index}` as keyof OrderItem;
    const normalizedSlotSize = normalizeApiSizeToCanonical(
      (rawRow[slot] || '') as string | null | undefined
    );
    if (normalizedSlotSize === canonicalSize) {
      return `ORDERED${index}` as
        | 'ORDERED1'
        | 'ORDERED2'
        | 'ORDERED3'
        | 'ORDERED4'
        | 'ORDERED5';
    }
  }
  return null;
};

export const normalizeApiOrderItem = (item: OrderItem): ApiOrderProduct => {
  const apiSizeLabels = extractNonEmptyApiSizes(item);
  const sourceText = getRuleSourceText(item);
  const categorizedAs = categorizeApiCollegeProduct({
    SHIRT_NAME: item.SHIRTNAME || '',
    DESCRIPT: item.DESCRIPT || '',
    DESIGN_NUM: item.DESIGN_NUM || '',
    STYL_NUM: item.STYLE_NUM || '',
  });
  const categoryPath = getCategoryPathForApiCollegeCategory(categorizedAs);
  const categoryName = categorizedAs;
  const variantOptions = inferVariantOptions(categoryPath, sourceText);
  const defaultVariant = variantOptions[0];
  const sizeOptionsByVariant: Record<string, string[]> = {};
  const packSizeByVariant: Record<string, number> = {};
  const allowAnyQuantityByVariant: Record<string, boolean> = {};

  variantOptions.forEach((variant) => {
    const ratioScale = getSizeScaleFromRatiosSync(categoryPath, variant);
    const ratioSizes = ratioScale ? parseSizeScale(ratioScale) : [];
    // API payload sizes are the source of truth for selectable sizes.
    // This prevents injecting 2X/3X options when those rows are not present.
    const resolvedSizes =
      apiSizeLabels.length > 0
        ? apiSizeLabels
        : (ratioSizes.length > 0 ? ratioSizes : getFallbackSizesForVariant(variant));
    sizeOptionsByVariant[variant] = resolvedSizes;

    // Use getPackSizeSync as the single source of truth so forced category
    // pack rules (e.g. flannels -> 8) are honored consistently.
    const packSize = getPackSizeSync(categoryPath, variant, sourceText);
    packSizeByVariant[variant] = packSize > 0 ? packSize : 1;
    allowAnyQuantityByVariant[variant] = allowsAnyQuantityForVariant(categoryPath, variant);
  });

  const productName = [item.STYLE_NUM, item.DESIGN_NUM, item.COLOR_INIT, item.Expr1]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(' ');

  return {
    productKey: getApiOrderProductKey(item),
    imageKey: getApiOrderImageKey(item),
    productName: productName || item.SHIRTNAME?.trim() || 'Unnamed Product',
    subtitle: item.Expr1?.trim() || item.SHIRTNAME?.trim(),
    imageUrl: item.productUrl || null,
    orderNum: item.ORDER_NUM,
    designNum: item.DESIGN_NUM,
    itemId: item.ITEM_ID,
    expr1: item.Expr1 || null,
    color: item.COLOR_INIT || null,
    sizeLabels: sizeOptionsByVariant[defaultVariant] || apiSizeLabels,
    categoryPath,
    categoryName,
    variantOptions,
    defaultVariant,
    sizeOptionsByVariant: sizeOptionsByVariant as Record<string, import('../types').Size[]>,
    packSizeByVariant,
    allowAnyQuantityByVariant,
  };
};

export const buildApiOrderCategoryModel = (items: OrderItem[]): ApiOrderCategoryModel => {
  const filteredItems = items.filter(
    (item) => item.SHIRTNAME && !item.SHIRTNAME.trim().toUpperCase().includes('ORDER REVIEW')
  );

  const normalized = filteredItems.map((item, sourceRecordIndex) => {
    const normalizedProduct = normalizeApiOrderItem(item);
    const styleInfo = normalizeStyleNum(item.STYLE_NUM);
    return {
      item,
      sourceRecordIndex,
      sourceImageKey: normalizedProduct.imageKey,
      normalizedProduct,
      styleInfo,
      apiSizes: extractNonEmptyApiSizes(item),
    };
  });

  const groupedByFamily = new Map<string, typeof normalized>();
  normalized.forEach((record) => {
    const mockupToken = getMockupGroupToken(record.item);
    const groupingKey = mockupToken
      ? [
        mockupToken,
        normalizeComparisonToken(record.item.DESIGN_NUM),
        normalizeComparisonToken(record.item.COLOR_INIT),
      ].join('|')
      : [
        normalizeComparisonToken(record.item.DESIGN_NUM),
        normalizeComparisonToken(record.item.COLOR_INIT),
        normalizeComparisonToken(record.item.Expr1),
        normalizeComparisonToken(record.item.productUrl),
        normalizeComparisonToken(record.normalizedProduct.categoryPath),
        normalizeComparisonToken(record.styleInfo.baseStyleNum || record.styleInfo.rawStyleNum),
      ].join('|');

    const existing = groupedByFamily.get(groupingKey);
    if (existing) {
      existing.push(record);
    } else {
      groupedByFamily.set(groupingKey, [record]);
    }
  });

  const productMap: Record<string, ApiOrderProduct> = {};
  const sourceToGroupKeyMap: Record<string, string> = {};
  const categoriesByPath = new Map<string, Category>();
  groupedByFamily.forEach((records) => {
    const sortedRecords = [...records].sort((a, b) => a.sourceRecordIndex - b.sourceRecordIndex);
    const primaryRecord =
      sortedRecords.find((record) => !record.styleInfo.variantSuffix) || sortedRecords[0];
    if (!primaryRecord) return;

    const groupKey = primaryRecord.sourceImageKey;
    const mergedProduct: ApiOrderProduct = {
      ...primaryRecord.normalizedProduct,
      imageKey: groupKey,
      groupKey,
      sizeOptionsByVariant: {},
      packSizeByVariant: {},
      allowAnyQuantityByVariant: {},
      sizeSourceByVariant: {},
      variantRecords: [],
      availableSizes: [],
    };

    const variantOrder: string[] = [];
    const variantDisplayNameByKey: Record<string, string> = {};
    const sizeSourceByVariant: Record<string, Record<string, string>> = {};
    const sizeOrderByVariant: Record<string, string[]> = {};
    const sizeTokenToDisplayByVariant: Record<string, Record<string, string>> = {};
    const sourceStyleByImageKey: Record<string, NormalizedStyleNum> = {};

    const recordsByBaseStyle = new Map<string, typeof sortedRecords>();
    sortedRecords.forEach((record) => {
      sourceToGroupKeyMap[record.sourceImageKey] = groupKey;
      sourceStyleByImageKey[record.sourceImageKey] = record.styleInfo;
      mergedProduct.variantRecords?.push({
        sourceImageKey: record.sourceImageKey,
        sourceStyleNum: record.styleInfo.rawStyleNum || null,
        sourceRecordIndex: record.sourceRecordIndex,
        sourceItemId: (record.item.ITEM_ID || '').trim() || null,
      });

      const styleGroupKey = normalizeComparisonToken(
        record.styleInfo.baseStyleNum || record.styleInfo.rawStyleNum
      ) || `STYLE-${record.sourceRecordIndex}`;
      const existing = recordsByBaseStyle.get(styleGroupKey);
      if (existing) {
        existing.push(record);
      } else {
        recordsByBaseStyle.set(styleGroupKey, [record]);
      }
    });

    recordsByBaseStyle.forEach((styleRecords, styleGroupKey) => {
      const sortedStyleRecords = [...styleRecords].sort((a, b) => a.sourceRecordIndex - b.sourceRecordIndex);
      const stylePrimaryRecord =
        sortedStyleRecords.find((record) => !record.styleInfo.variantSuffix) || sortedStyleRecords[0];
      if (!stylePrimaryRecord) return;

      if (!variantOrder.includes(styleGroupKey)) variantOrder.push(styleGroupKey);

      const styleKeyDisplay =
        stylePrimaryRecord.styleInfo.baseStyleNum ||
        stylePrimaryRecord.styleInfo.rawStyleNum ||
        styleGroupKey;
      // For grouped M# cards, tab labels should be the base style number.
      variantDisplayNameByKey[styleGroupKey] = styleKeyDisplay;

      if (!sizeSourceByVariant[styleGroupKey]) sizeSourceByVariant[styleGroupKey] = {};
      if (!sizeOrderByVariant[styleGroupKey]) sizeOrderByVariant[styleGroupKey] = [];
      if (!sizeTokenToDisplayByVariant[styleGroupKey]) sizeTokenToDisplayByVariant[styleGroupKey] = {};

      const stylePrimaryVariant = stylePrimaryRecord.normalizedProduct.defaultVariant || stylePrimaryRecord.normalizedProduct.variantOptions?.[0] || 'default';
      mergedProduct.packSizeByVariant![styleGroupKey] =
        stylePrimaryRecord.normalizedProduct.packSizeByVariant?.[stylePrimaryVariant] || 1;
      mergedProduct.allowAnyQuantityByVariant![styleGroupKey] =
        stylePrimaryRecord.normalizedProduct.allowAnyQuantityByVariant?.[stylePrimaryVariant] || false;

      sortedStyleRecords.forEach((record) => {
        const recordVariant = record.normalizedProduct.defaultVariant || record.normalizedProduct.variantOptions?.[0] || 'default';
        const configuredSizes = record.normalizedProduct.sizeOptionsByVariant?.[recordVariant] || [];
        const sizesForVariant =
          configuredSizes.length > 0
            ? [...configuredSizes, ...record.apiSizes]
            : record.apiSizes;

        sizesForVariant.forEach((size) => {
          const displaySize = (size || '').trim();
          if (!displaySize) return;
          const sizeToken = normalizeApiSizeToCanonical(displaySize);
          if (!sizeToken) return;

          if (!sizeTokenToDisplayByVariant[styleGroupKey][sizeToken]) {
            sizeTokenToDisplayByVariant[styleGroupKey][sizeToken] = displaySize;
            sizeOrderByVariant[styleGroupKey].push(sizeToken);
          }

          const currentSource = sizeSourceByVariant[styleGroupKey][sizeToken];
          if (!currentSource) {
            sizeSourceByVariant[styleGroupKey][sizeToken] = record.sourceImageKey;
            return;
          }
          const currentSourceStyle = sourceStyleByImageKey[currentSource] || normalizeStyleNum(null);
          const incomingScore = getSourcePriorityScore(displaySize, record.styleInfo);
          const currentScore = getSourcePriorityScore(displaySize, currentSourceStyle);
          if (incomingScore > currentScore) {
            sizeSourceByVariant[styleGroupKey][sizeToken] = record.sourceImageKey;
          }
        });
      });
    });

    mergedProduct.variantOptions = variantOrder;
    mergedProduct.variantDisplayNameByKey = variantDisplayNameByKey;
    mergedProduct.defaultVariant =
      variantOrder.includes(
        normalizeComparisonToken(primaryRecord.styleInfo.baseStyleNum || primaryRecord.styleInfo.rawStyleNum)
      )
        ? normalizeComparisonToken(primaryRecord.styleInfo.baseStyleNum || primaryRecord.styleInfo.rawStyleNum)
        : variantOrder[0] || 'default';

    variantOrder.forEach((variant) => {
      const orderedSizeTokens = sizeOrderByVariant[variant] || [];
      const displaySizes = orderedSizeTokens
        .map((token) => sizeTokenToDisplayByVariant[variant][token])
        .sort((a, b) => {
          const rankDiff = getSizeSortRank(a) - getSizeSortRank(b);
          if (rankDiff !== 0) return rankDiff;
          return a.localeCompare(b);
        });
      if (displaySizes.length > 0) {
        mergedProduct.sizeOptionsByVariant![variant] = displaySizes as import('../types').Size[];
      }
      if (!mergedProduct.packSizeByVariant?.[variant]) {
        mergedProduct.packSizeByVariant![variant] =
          primaryRecord.normalizedProduct.packSizeByVariant?.[variant] || 1;
      }
      if (mergedProduct.allowAnyQuantityByVariant?.[variant] == null) {
        mergedProduct.allowAnyQuantityByVariant![variant] =
          primaryRecord.normalizedProduct.allowAnyQuantityByVariant?.[variant] || false;
      }

      orderedSizeTokens.forEach((sizeToken) => {
        const sourceImageKey = sizeSourceByVariant[variant][sizeToken] || groupKey;
        const sourceRecord = sortedRecords.find((record) => record.sourceImageKey === sourceImageKey) || primaryRecord;
        mergedProduct.availableSizes?.push({
          size: sizeTokenToDisplayByVariant[variant][sizeToken],
          sourceStyleNum: sourceRecord.styleInfo.rawStyleNum || null,
          sourceRecordIndex: sourceRecord.sourceRecordIndex,
          sourceItemId: (sourceRecord.item.ITEM_ID || '').trim() || null,
          sourceImageKey,
          variant,
        });
      });
    });

    mergedProduct.sizeLabels =
      mergedProduct.sizeOptionsByVariant?.[mergedProduct.defaultVariant || 'default'] ||
      primaryRecord.normalizedProduct.sizeLabels;

    const expandedSizeSourceByVariant: Record<string, Record<string, string>> = {};
    variantOrder.forEach((variant) => {
      const orderedSizeTokens = sizeOrderByVariant[variant] || [];
      const mapForVariant: Record<string, string> = {};
      orderedSizeTokens.forEach((sizeToken) => {
        const displaySize = sizeTokenToDisplayByVariant[variant][sizeToken];
        mapForVariant[displaySize] = sizeSourceByVariant[variant][sizeToken] || groupKey;
      });
      expandedSizeSourceByVariant[variant] = mapForVariant;
    });
    mergedProduct.sizeSourceByVariant = expandedSizeSourceByVariant;
    if (variantOrder.length > 1) {
      const groupedTitle = [primaryRecord.item.DESIGN_NUM, primaryRecord.item.COLOR_INIT, primaryRecord.item.Expr1]
        .map((part) => (part || '').trim())
        .filter(Boolean)
        .join(' ');
      if (groupedTitle) {
        mergedProduct.productName = groupedTitle;
      }
    }

    productMap[groupKey] = mergedProduct;
    const categoryPath = mergedProduct.categoryPath || 'api-products';
    const existing = categoriesByPath.get(categoryPath);
    if (existing) {
      if (!existing.images.includes(groupKey)) {
        existing.images.push(groupKey);
      }
    } else {
      categoriesByPath.set(categoryPath, {
        name: mergedProduct.categoryName || getCategoryName(categoryPath),
        path: categoryPath,
        images: [groupKey],
      });
    }
  });
  const categoryOrder = [
    'tshirt/men',
    'tshirt/women',
    'cap',
    'knit-cap',
    'jacket',
    'flannels',
    'pants',
    'shorts',
    'socks',
    'bottle',
    'plush',
    'sticker',
    'backpack',
    'signage',
    'youth&infant',
    'api-products',
  ];
  const categories = Array.from(categoriesByPath.values()).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.path);
    const bIndex = categoryOrder.indexOf(b.path);
    const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    return safeA - safeB;
  });

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[api-school] grouped product families', {
      rawRecordCount: normalized.length,
      groupedProductCount: Object.keys(productMap).length,
      samples: Object.values(productMap)
        .slice(0, 12)
        .map((product) => ({
          groupKey: product.imageKey,
          variantRecords: product.variantRecords?.length || 0,
          availableSizes: product.availableSizes?.map((entry) => entry.size) || [],
        })),
    });
  }

  return {
    categories,
    productMap,
    sourceToGroupKeyMap,
  };
};

export interface ApiOrderPayload {
  orderTemplateId: string;
  school: ApiSchoolPageData['school'];
  items: Array<OrderItem & { ORDERED1: string; ORDERED2: string; ORDERED3: string; ORDERED4: string; ORDERED5: string }>;
  storeInfo: {
    storeName: string;
    storeNumber: string;
    poNumber: string;
    date: string;
  };
  subtotal: number;
  total: number;
}

/**
 * Builds the order payload from raw API data with user quantities merged in.
 * The JSON is the original API structure with ORDERED1..5 written into each item.
 */
export function buildApiOrderPayload(
  rawPageData: ApiSchoolPageData | null,
  orderedByProduct: Record<string, import('../features/utils/apiOrderState').ApiProductSelection>,
  productMap: Record<string, ApiOrderProduct>,
  sourceToGroupKeyMap: Record<string, string>,
  formData: { company: string; storeNumber: string; poNumber: string; storeManager: string; orderedBy: string; date: string; orderNotes?: string }
): ApiOrderPayload | null {
  if (!rawPageData?.items?.length) return null;

  const isProblemStyleDebugEnabled = (
    product: ApiOrderProduct | undefined,
    sourceStyleNum: string | null | undefined
  ): boolean => {
    if (process.env.NODE_ENV === 'production') return false;
    const normalizedSourceStyle = normalizeComparisonToken(sourceStyleNum);
    if (/^3930R(2X|3X)?$/.test(normalizedSourceStyle)) return true;
    const variantStyles = product?.variantRecords?.map((record) =>
      normalizeComparisonToken(record.sourceStyleNum)
    ) || [];
    return variantStyles.some((style) => /^3930R(2X|3X)?$/.test(style));
  };

  const filteredItems = rawPageData.items.filter(
    (item) => item.SHIRTNAME && !item.SHIRTNAME.trim().toUpperCase().includes('ORDER REVIEW')
  );

  let subtotal = 0;
  const mutatedItems = filteredItems.map((item) => {
    const sourceImageKey = getApiOrderImageKey(item);
    const groupKey = sourceToGroupKeyMap[sourceImageKey] || sourceImageKey;
    const selection = orderedByProduct[groupKey];
    const product = productMap[groupKey];

    const ordered: Record<string, string> = {
      ORDERED1: '0',
      ORDERED2: '0',
      ORDERED3: '0',
      ORDERED4: '0',
      ORDERED5: '0',
    };

    if (selection?.variantQuantities && product) {
      const debugProblemStyle = isProblemStyleDebugEnabled(product, item.STYLE_NUM as string | null | undefined);
      const groupedSelectedSizes = Object.entries(selection.variantQuantities).flatMap(
        ([variant, variantMap]) =>
          Object.entries(variantMap)
            .filter(([, qty]) => Number(qty) > 0)
            .map(([size, qty]) => ({
              variant,
              size,
              canonicalSize: normalizeApiSizeToCanonical(size),
              qty: Number(qty) || 0,
            }))
      );

      if (debugProblemStyle) {
        // eslint-disable-next-line no-console
        console.debug('[api-school] serializer grouped selected sizes', {
          groupKey,
          sourceImageKey,
          sourceStyleNum: (item.STYLE_NUM || '').toString().trim(),
          groupedSelectedSizes,
        });
      }

      groupedSelectedSizes.forEach((entry) => {
        const variantSourceMap = product.sizeSourceByVariant?.[entry.variant] || {};
        const matchedSizeKey = findCanonicalMapKey(variantSourceMap, entry.size);
        const mappedSource = matchedSizeKey ? variantSourceMap[matchedSizeKey] : undefined;
        if (mappedSource && mappedSource !== sourceImageKey) {
          if (debugProblemStyle) {
            // eslint-disable-next-line no-console
            console.debug('[api-school] serializer skip size due to source mismatch', {
              selectedSize: entry.size,
              canonicalSelectedSize: entry.canonicalSize,
              selectedQty: entry.qty,
              variant: entry.variant,
              resolvedSourceImageKey: mappedSource,
              currentSourceImageKey: sourceImageKey,
            });
          }
          return;
        }

        const orderedField = getOrderedFieldForRawRowSize(item, entry.canonicalSize);
        if (!orderedField) {
          if (debugProblemStyle) {
            const rawSizeSlots = {
              size1: (item.size1 || '').toString().trim(),
              size2: (item.size2 || '').toString().trim(),
              size3: (item.size3 || '').toString().trim(),
              size4: (item.size4 || '').toString().trim(),
              size5: (item.size5 || '').toString().trim(),
            };
            // eslint-disable-next-line no-console
            console.debug('[api-school] serializer no ORDERED slot match', {
              selectedSize: entry.size,
              canonicalSelectedSize: entry.canonicalSize,
              selectedQty: entry.qty,
              rawSizeSlots,
              normalizedRawSizeSlots: Object.fromEntries(
                Object.entries(rawSizeSlots).map(([key, value]) => [
                  key,
                  normalizeApiSizeToCanonical(value),
                ])
              ),
            });
          }
          return;
        }

        const previousQty = Number(ordered[orderedField]) || 0;
        ordered[orderedField] = String(previousQty + entry.qty);

        if (debugProblemStyle) {
          const rawSizeSlots = {
            size1: (item.size1 || '').toString().trim(),
            size2: (item.size2 || '').toString().trim(),
            size3: (item.size3 || '').toString().trim(),
            size4: (item.size4 || '').toString().trim(),
            size5: (item.size5 || '').toString().trim(),
          };
          // eslint-disable-next-line no-console
          console.debug('[api-school] serializer mapped size to ORDERED field', {
            selectedSize: entry.size,
            canonicalSelectedSize: entry.canonicalSize,
            selectedQty: entry.qty,
            variant: entry.variant,
            sourceImageKey,
            rawSizeSlots,
            normalizedRawSizeSlots: Object.fromEntries(
              Object.entries(rawSizeSlots).map(([key, value]) => [
                key,
                normalizeApiSizeToCanonical(value),
              ])
            ),
            orderedField,
            orderedValue: ordered[orderedField],
          });
        }
      });
    }

    const itemTotal = (ordered.ORDERED1 ? parseInt(ordered.ORDERED1, 10) || 0 : 0) +
      (ordered.ORDERED2 ? parseInt(ordered.ORDERED2, 10) || 0 : 0) +
      (ordered.ORDERED3 ? parseInt(ordered.ORDERED3, 10) || 0 : 0) +
      (ordered.ORDERED4 ? parseInt(ordered.ORDERED4, 10) || 0 : 0) +
      (ordered.ORDERED5 ? parseInt(ordered.ORDERED5, 10) || 0 : 0);
    const unitPrice = Number(item.UNITPRICE) || 0;
    subtotal += itemTotal * unitPrice;

    const serializedRow = { ...item, ...ordered } as ApiOrderPayload['items'][0];
    if (isProblemStyleDebugEnabled(product, item.STYLE_NUM as string | null | undefined)) {
      // eslint-disable-next-line no-console
      console.debug('[api-school] serializer final serialized row', {
        sourceImageKey,
        styleNum: (serializedRow.STYLE_NUM || '').toString().trim(),
        itemId: (serializedRow.ITEM_ID || '').toString().trim(),
        ordered: {
          ORDERED1: serializedRow.ORDERED1,
          ORDERED2: serializedRow.ORDERED2,
          ORDERED3: serializedRow.ORDERED3,
          ORDERED4: serializedRow.ORDERED4,
          ORDERED5: serializedRow.ORDERED5,
        },
      });
    }
    return serializedRow;
  });

  const payload = {
    orderTemplateId: rawPageData.orderTemplateId,
    school: rawPageData.school,
    items: mutatedItems,
    storeInfo: {
      storeName: formData.company || '',
      storeNumber: formData.storeNumber || '',
      poNumber: formData.poNumber || '',
      date: formData.date || '',
    },
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
  };

  if (process.env.NODE_ENV !== 'production') {
    const nonZeroItems = payload.items.filter((item) =>
      ['ORDERED1', 'ORDERED2', 'ORDERED3', 'ORDERED4', 'ORDERED5'].some((key) => Number(item[key as keyof typeof item]) > 0)
    );
    // eslint-disable-next-line no-console
    console.debug('[api-school] serialized payload preview', {
      orderTemplateId: payload.orderTemplateId,
      totalItems: payload.items.length,
      nonZeroItems: nonZeroItems.length,
      sample: nonZeroItems.slice(0, 10).map((item) => ({
        styleNum: (item.STYLE_NUM || '').toString().trim(),
        itemId: (item.ITEM_ID || '').toString().trim(),
        ordered: {
          ORDERED1: item.ORDERED1,
          ORDERED2: item.ORDERED2,
          ORDERED3: item.ORDERED3,
          ORDERED4: item.ORDERED4,
          ORDERED5: item.ORDERED5,
        },
      })),
    });
  }

  return payload;
}

/**
 * Submits the order payload to the backend API.
 */
export async function submitApiOrder(payload: ApiOrderPayload): Promise<{ success: boolean; message?: string; error?: string }> {
  const submitUrl = `${API_BASE_URL}/submitorder`;
  const serializedPayload = JSON.stringify(payload);
  // eslint-disable-next-line no-console
  console.info('[api-school] submitting order payload to api/submitorder', {
    endpoint: submitUrl,
    payload,
    serializedPayload,
  });
  try {
    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: serializedPayload,
    });
    const text = await response.text();
    let data: { message?: string; error?: string; success?: boolean };
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('[api-school] order submission failed', {
        endpoint: submitUrl,
        status: response.status,
        response: data,
      });
      return { success: false, error: data.message || data.error || `Submission failed: ${response.status}` };
    }
    // eslint-disable-next-line no-console
    console.info('[api-school] order submission confirmed', {
      endpoint: submitUrl,
      status: response.status,
      response: data,
    });
    return { success: true, message: data.message || 'Order submitted successfully!' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error('[api-school] order submission threw error', {
      endpoint: submitUrl,
      error: msg,
    });
    return { success: false, error: msg };
  }
}

// Export a default object with all methods
const collegeApiService = {
  fetchColleges,
  fetchApiSchoolPageData,
  fetchCollegeOrder,
  getProxiedImageUrl,
  checkApiHealth,
  checkProxyHealth, // Include legacy name
  buildApiOrderCategoryModel,
  normalizeApiOrderItem,
  getApiOrderProductKey,
  getApiOrderImageKey,
};

export default collegeApiService;