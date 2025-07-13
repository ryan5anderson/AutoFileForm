export interface Category {
  name: string;
  path: string;
  images: string[];
  hasShirtVersions?: boolean;
  shirtVersions?: string[]; // Array of available versions for this category
  hasColorVersions?: boolean;
  colorVersions?: string[]; // Array of available colors for this category
  hasDisplayOptions?: boolean; // New property for display options
}

export interface ShirtVersion {
  tshirt: string;
  longsleeve?: string;
  hoodie?: string;
  crewneck?: string;
}

export interface ColorVersion {
  black?: string;
  forest?: string;
  white?: string;
  gray?: string;
}

export interface ShirtColorComboVersion {
  [versionColor: string]: string; // e.g. 'tshirt_black', 'hoodie_forest'
}

export interface DisplayOption {
  displayOnly: string;
  displayStandardCasePack: string;
}

export interface SweatpantJoggerOption {
  sweatpantSteel: string;
  sweatpantOxford: string;
  joggerSteel: string;
  joggerOxford: string;
}

export interface FormData {
  company: string;
  storeNumber: string;
  storeManager: string;
  date: string;
  orderNotes: string;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  colorVersions?: Record<string, ColorVersion>;
  shirtColorComboVersions?: Record<string, ShirtColorComboVersion>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
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
  company: string;
  store_number: string;
  manager_name: string;
  date: string;
  order_notes: string;
  categories: EmailCategory[];
  total_units: string;
  provider_email: string;
}

export type Page = 'form' | 'summary' | 'receipt' | 'thankyou'; 