export interface CollegeData {
  orderNumTemplate: string;
  schoolName: string;
  school_ID: string;
  earlyDate: string;
  CUST_NUM: string;
  zip: string;
  mascot: string;
  schoolColors: string;
  address1: string;
  city: string;
  latitude: string;
  longitude: string;
  logoUrl: string;
}

export interface CollegesApiResponse {
  success: boolean;
  data: CollegeData[];
  error?: string;
  message?: string;
}

// Use local proxy server instead of direct API call
const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:5000';
const API_ENDPOINT = `${PROXY_URL}/api/colleges`;

export const fetchColleges = async (): Promise<CollegeData[]> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Try to parse error response from proxy
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Couldn't parse error, use default message
      }
      throw new Error(errorMessage);
    }
    
    const result: CollegesApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API returned unsuccessful response');
    }
    
    if (!Array.isArray(result.data)) {
      throw new Error('Invalid response format: expected array of colleges');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching colleges:', error);
    
    // Enhanced error handling with user-friendly messages
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(
        'Cannot connect to server. Please ensure:\n' +
        '1. The proxy server is running (npm run server)\n' +
        '2. The server is accessible at http://localhost:5000'
      );
    }
    
    throw error;
  }
};

// Health check function to verify proxy is running
export const checkProxyHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${PROXY_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// Get optimized logo URL for a college
export const getOptimizedLogoUrl = (schoolId: string | null | undefined): string => {
  if (!schoolId) {
    return '';
  }
  
  const trimmedSchoolId = schoolId.trim();
  
  if (trimmedSchoolId === '') {
    return '';
  }

  return `${PROXY_URL}/api/logo/${trimmedSchoolId}`;
};

// Order item interface
export interface OrderItem {
  scanbar: string;
  ORDER_NUM: string;
  STYLE_NUM: string;
  DESIGN_NUM: string;
  COLOR_INIT: string;
  UNITPRICE: string;
  Expr1: string;
  ROYALTYID: string;
  ROYALTYPE: string;
  ROYALRATE: string;
  LIN: string;
  CUST_NUM: string;
  ORDERED1: string;
  ORDERED2: string;
  ORDERED3: string;
  ORDERED4: string;
  ORDERED5: string;
  size1: string;
  size2: string;
  size3: string;
  size4: string;
  size5: string;
  NAMEDROPID: string;
  ITEM_ID: string;
  DESCRIPT: string;
  SHIRTNAME: string;
  productUrl: string;
}

export interface CollegeOrderResponse {
  success: boolean;
  data: OrderItem[];
}

// Fetch college order data
export const fetchCollegeOrder = async (orderNumTemplate: string): Promise<OrderItem[]> => {
  try {
    // Use proxy server to avoid CORS issues
    const response = await fetch(`${PROXY_URL}/api/college?id=${orderNumTemplate}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const result: CollegeOrderResponse = await response.json();
    
    if (!result.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    if (!Array.isArray(result.data)) {
      throw new Error('Invalid response format: expected array of order items');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching college order:', error);
    throw error;
  }
};

// Fetch order data by order template ID from test-api endpoint
export const fetchOrderBySchoolId = async (orderTemplateId: string): Promise<OrderItem[]> => {
  try {
    // Use proxy server to avoid CORS issues
    const response = await fetch(`${PROXY_URL}/test-api/${orderTemplateId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const result: CollegeOrderResponse = await response.json();
    
    if (!result.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    if (!Array.isArray(result.data)) {
      throw new Error('Invalid response format: expected array of order items');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching order by school ID:', error);
    
    // Enhanced error handling with user-friendly messages
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(
        'Cannot connect to server. Please ensure:\n' +
        '1. The proxy server is running (npm run server)\n' +
        '2. The server is accessible at http://localhost:5000'
      );
    }
    
    throw error;
  }
};

