export interface Category {
  name: string;
  path: string;
  images: string[];
  hasShirtVersions?: boolean;
  shirtVersions?: string[]; // Array of available versions for this category
  hasSizeOptions?: boolean; // Property for categories that need size options but not shirt versions
  hasDisplayOptions?: boolean; // New property for display options
  hasPantOptions?: boolean; // Property for pants with style/color options
  pantStyles?: string[]; // Array of available pant styles (e.g., ['sweatpants', 'joggers'])
}

export interface College {
  name: string;
  logo: string;
  categories: Category[];
}

export interface ShirtVersion {
  tshirt: string;
  longsleeve?: string;
  hoodie?: string;
  crewneck?: string;
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

// New interface for pant options with style, color, and size structure
export interface PantOption {
  sweatpants?: {
    steel?: SizeCounts;
    oxford?: SizeCounts;
  };
  joggers?: {
    steel?: SizeCounts;
    oxford?: SizeCounts;
  };
}

// Size-based ordering for shirt versions
export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'S/M' | 'L/XL';
export type SizeCounts = Record<Size, number>;

// Color options for products with multiple colors
export interface ColorOption {
  [colorName: string]: string; // colorName -> quantity
}

// For shirt versions with colors: imagePath -> version -> color -> SizeCounts
export type ShirtColorSizeCounts = Record<string, Partial<Record<keyof ShirtVersion, Record<string, SizeCounts>>>>;

export interface FormData {
  company: string;
  storeNumber: string;
  storeManager: string;
  date: string;
  orderNotes: string;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  pantOptions?: Record<string, PantOption>; // New: imagePath -> PantOption
  // imagePath -> version -> SizeCounts (for single-color shirts)
  shirtSizeCounts?: Record<string, Partial<Record<keyof ShirtVersion, SizeCounts>>>;
  // imagePath -> version -> color -> SizeCounts (for multi-color shirts)
  shirtColorSizeCounts?: ShirtColorSizeCounts;
  // imagePath -> colorName -> quantity (for non-shirt items with colors like hats)
  colorOptions?: Record<string, ColorOption>;
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