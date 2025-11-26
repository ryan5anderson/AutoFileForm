/**
 * College API Service - Vercel Edition
 * 
 * This service handles all communication with the college order API
 * through Vercel serverless functions.
 */

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

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
  [key: string]: any; // Allow for additional fields from the API
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
  [key: string]: any; // Allow for additional fields from the API
}

/**
 * Fetches the list of all available colleges
 */
export async function fetchColleges(): Promise<CollegeData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/colleges`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch colleges: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching colleges:', error);
    throw error;
  }
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
    return data;
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
 * Checks if the API is healthy
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Legacy alias for checkApiHealth (for backward compatibility)
 * @deprecated Use checkApiHealth instead
 */
export const checkProxyHealth = checkApiHealth;

// Export a default object with all methods
const collegeApiService = {
  fetchColleges,
  fetchCollegeOrder,
  getProxiedImageUrl,
  checkApiHealth,
  checkProxyHealth, // Include legacy name
};

export default collegeApiService;