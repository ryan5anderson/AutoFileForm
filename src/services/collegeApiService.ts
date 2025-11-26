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
    
    // Log what we received for debugging
    console.log('Raw API response:', data);
    console.log('Response type:', typeof data);
    console.log('Is array?', Array.isArray(data));
    
    // Handle different response formats
    if (Array.isArray(data)) {
      console.log(`Received ${data.length} colleges`);
      return data;
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      console.log(`Response wrapped in data property, found ${data.data.length} colleges`);
      return data.data;
    } else if (data && typeof data === 'object' && Array.isArray(data.colleges)) {
      console.log(`Response wrapped in colleges property, found ${data.colleges.length} colleges`);
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
    
    // Log what we received for debugging
    console.log('Raw API response for college order:', data);
    console.log('Response type:', typeof data);
    console.log('Is array?', Array.isArray(data));
    
    // Handle different response formats
    if (Array.isArray(data)) {
      console.log(`Received ${data.length} order items`);
      return data;
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      console.log(`Response wrapped in data property, found ${data.data.length} order items`);
      return data.data;
    } else if (data && typeof data === 'object' && Array.isArray(data.items)) {
      console.log(`Response wrapped in items property, found ${data.items.length} order items`);
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

// Export a default object with all methods
const collegeApiService = {
  fetchColleges,
  fetchCollegeOrder,
  getProxiedImageUrl,
  checkApiHealth,
  checkProxyHealth, // Include legacy name
};

export default collegeApiService;