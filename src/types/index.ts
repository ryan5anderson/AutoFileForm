export interface Category {
  name: string;
  path: string;
  images: string[];
  hasShirtVersions?: boolean;
  shirtVersions?: string[]; // Array of available versions for this category
}

export interface ShirtVersion {
  tshirt: string;
  longsleeve?: string;
  hoodie?: string;
  crewneck?: string;
}

export interface FormData {
  storeNumber: string;
  storeManager: string;
  date: string;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
}

export interface EmailCategory {
  category: string;
  items: EmailItem[];
}

export interface EmailItem {
  sku: string;
  name: string;
  qty: string;
  version?: string;
}

export interface TemplateParams extends Record<string, unknown> {
  store_number: string;
  manager_name: string;
  date: string;
  categories: EmailCategory[];
  total_units: string;
  provider_email: string;
}

export type Page = 'form' | 'summary' | 'receipt' | 'thankyou'; 