/**
 * College API Service - Vercel Edition
 * 
 * This service handles all communication with the college order API
 * through Vercel serverless functions.
 */

import { getPackSizeFromRatiosSync, getSizeScaleFromRatiosSync, parseSizeScale } from '../config/garmentRatios';
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

const SHIRT_MEN_VERSIONS = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'];

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
  if (categoryPath === 'tshirt/men') return [...SHIRT_MEN_VERSIONS];

  if (categoryPath === 'pants') {
    return sourceText.includes('jogger') ? ['joggers'] : ['sweatpants'];
  }
  if (categoryPath === 'tshirt/women') return ['tshirt'];
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

const allowsAnyQuantityForVariant = (categoryPath: string, variant: string): boolean => {
  if (categoryPath === 'tshirt/men' && SHIRT_MEN_VERSIONS.includes(variant)) {
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

export const normalizeApiOrderItem = (item: OrderItem): ApiOrderProduct => {
  const apiSizeLabels = [item.size1, item.size2, item.size3, item.size4, item.size5]
    .map((size) => (size || '').trim())
    .filter((size): size is string => size.length > 0);
  const sourceText = getRuleSourceText(item);
  const categorizedAs = categorizeApiCollegeProduct({
    SHIRT_NAME: item.SHIRTNAME || '',
    DESCRIPT: item.DESCRIPT || '',
    STYL_NUM: item.STYLE_NUM || '',
  });
  const categoryPath = getCategoryPathForApiCollegeCategory(categorizedAs);
  const categoryName = categorizedAs;
  let variantOptions = inferVariantOptions(categoryPath, sourceText);
  // Ensure Unisex T-shirt always has all 4 options (defensive override)
  if (categoryPath === 'tshirt/men' && variantOptions.length < 4) {
    variantOptions = [...SHIRT_MEN_VERSIONS];
  }
  const defaultVariant = variantOptions[0];
  const sizeOptionsByVariant: Record<string, string[]> = {};
  const packSizeByVariant: Record<string, number> = {};
  const allowAnyQuantityByVariant: Record<string, boolean> = {};

  variantOptions.forEach((variant) => {
    const ratioScale = getSizeScaleFromRatiosSync(categoryPath, variant);
    const ratioSizes = ratioScale ? parseSizeScale(ratioScale) : [];
    const resolvedSizes = ratioSizes.length > 0 ? ratioSizes : (apiSizeLabels.length > 0 ? apiSizeLabels : getFallbackSizesForVariant(variant));
    sizeOptionsByVariant[variant] = resolvedSizes;

    const ratioPackSize = getPackSizeFromRatiosSync(categoryPath, variant);
    const fallbackPackSize = getPackSizeSync(categoryPath, variant, sourceText);
    const packSize = ratioPackSize ?? fallbackPackSize ?? 1;
    packSizeByVariant[variant] = packSize > 0 ? packSize : 1;
    allowAnyQuantityByVariant[variant] = allowsAnyQuantityForVariant(categoryPath, variant);
  });

  const productName = [item.STYLE_NUM, item.DESIGN_NUM, item.COLOR_INIT]
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

  const normalized = filteredItems.map(normalizeApiOrderItem);
  const productMap: Record<string, ApiOrderProduct> = {};
  const categoriesByPath = new Map<string, Category>();
  normalized.forEach((product) => {
    productMap[product.imageKey] = product;
    const categoryPath = product.categoryPath || 'api-products';
    const existing = categoriesByPath.get(categoryPath);
    if (existing) {
      existing.images.push(product.imageKey);
    } else {
      categoriesByPath.set(categoryPath, {
        name: product.categoryName || getCategoryName(categoryPath),
        path: categoryPath,
        images: [product.imageKey],
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

  return {
    categories,
    productMap,
  };
};

export interface ApiOrderPayload {
  orderTemplateId: string;
  school: ApiSchoolPageData['school'];
  items: Array<OrderItem & { ORDERED1: string; ORDERED2: string; ORDERED3: string; ORDERED4: string; ORDERED5: string }>;
  storeInfo: {
    company: string;
    storeNumber: string;
    storeManager: string;
    orderedBy: string;
    date: string;
    orderNotes?: string;
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
  formData: { company: string; storeNumber: string; storeManager: string; orderedBy: string; date: string; orderNotes?: string }
): ApiOrderPayload | null {
  if (!rawPageData?.items?.length) return null;

  const filteredItems = rawPageData.items.filter(
    (item) => item.SHIRTNAME && !item.SHIRTNAME.trim().toUpperCase().includes('ORDER REVIEW')
  );

  let subtotal = 0;
  const mutatedItems = filteredItems.map((item) => {
    const imageKey = getApiOrderImageKey(item);
    const selection = orderedByProduct[imageKey];
    const product = productMap[imageKey];

    const sizeColumns = [
      item.size1 || '',
      item.size2 || '',
      item.size3 || '',
      item.size4 || '',
      item.size5 || '',
    ].map((s) => (s || '').trim()).filter(Boolean);

    const ordered: Record<string, string> = {
      ORDERED1: '0',
      ORDERED2: '0',
      ORDERED3: '0',
      ORDERED4: '0',
      ORDERED5: '0',
    };

    if (selection?.variantQuantities && product) {
      for (let i = 0; i < 5; i++) {
        const sizeLabel = sizeColumns[i];
        if (!sizeLabel) continue;
        let qty = 0;
        Object.values(selection.variantQuantities).forEach((variantMap) => {
          qty += Number(variantMap[sizeLabel]) || 0;
        });
        ordered[`ORDERED${i + 1}` as keyof typeof ordered] = String(qty);
      }
    }

    const itemTotal = (ordered.ORDERED1 ? parseInt(ordered.ORDERED1, 10) || 0 : 0) +
      (ordered.ORDERED2 ? parseInt(ordered.ORDERED2, 10) || 0 : 0) +
      (ordered.ORDERED3 ? parseInt(ordered.ORDERED3, 10) || 0 : 0) +
      (ordered.ORDERED4 ? parseInt(ordered.ORDERED4, 10) || 0 : 0) +
      (ordered.ORDERED5 ? parseInt(ordered.ORDERED5, 10) || 0 : 0);
    const unitPrice = Number(item.UNITPRICE) || 0;
    subtotal += itemTotal * unitPrice;

    return { ...item, ...ordered } as ApiOrderPayload['items'][0];
  });

  return {
    orderTemplateId: rawPageData.orderTemplateId,
    school: rawPageData.school,
    items: mutatedItems,
    storeInfo: {
      company: formData.company || '',
      storeNumber: formData.storeNumber || '',
      storeManager: formData.storeManager || '',
      orderedBy: formData.orderedBy || '',
      date: formData.date || '',
      orderNotes: formData.orderNotes || '',
    },
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
  };
}

/**
 * Submits the order payload to the backend API.
 */
export async function submitApiOrder(payload: ApiOrderPayload): Promise<{ success: boolean; message?: string; error?: string }> {
  const submitUrl = `${API_BASE_URL}/submitorder`;
  try {
    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    let data: { message?: string; error?: string; success?: boolean };
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
    if (!response.ok) {
      return { success: false, error: data.message || data.error || `Submission failed: ${response.status}` };
    }
    return { success: true, message: data.message || 'Order submitted successfully!' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
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