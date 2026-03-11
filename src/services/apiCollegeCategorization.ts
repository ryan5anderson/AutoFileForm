export const API_COLLEGE_CATEGORIES = {
  UNISEX_TSHIRT: 'Unisex T-shirt',
  LADIES_TOPS: 'Ladies Tops',
  CAPS_HAT: 'Caps / Hat',
  KNIT_CAPS_BEANIE: 'Knit Caps / Beanie',
  JACKETS: 'Jackets / Jacket',
  FLANNELS: 'Flannel Pajama Pants / Flannels',
  PANTS: 'Sweatpants & Joggers / Pants',
  SHORTS: 'Shorts',
  SOCKS: 'Socks',
  WATER_BOTTLES: 'Water Bottles / Water Bottle',
  PLUSH: 'Plush',
  STICKERS: 'Stickers',
  BACKPACK: 'Backpack',
  SIGNAGE: 'Signage',
  YOUTH_INFANT: 'Youth & Infant',
  UNCLASSIFIED: 'Unclassified',
} as const;

export type ApiCollegeCategory =
  typeof API_COLLEGE_CATEGORIES[keyof typeof API_COLLEGE_CATEGORIES];

export interface ApiCollegeCategorizationInput {
  DESCRIPT?: string | null;
  SHIRT_NAME?: string | null;
  STYL_NUM?: string | null;
}

interface SearchContext {
  shirtName: string;
  description: string;
  styleNum: string;
  text: string;
}

interface CategoryRule {
  category: ApiCollegeCategory;
  matches: (context: SearchContext) => boolean;
}

const normalizeSearchText = (value?: string | null): string =>
  (value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const normalizeStyleNum = (value?: string | null): string =>
  (value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .trim();

const hasPhrase = (text: string, phrase: string): boolean => {
  if (!text) return false;
  const normalizedPhrase = normalizeSearchText(phrase);
  if (!normalizedPhrase) return false;
  return ` ${text} `.includes(` ${normalizedPhrase} `);
};

const hasAnyPhrase = (text: string, phrases: readonly string[]): boolean =>
  phrases.some((phrase) => hasPhrase(text, phrase));

const hasWord = (text: string, word: string): boolean => {
  if (!text) return false;
  const normalizedWord = normalizeSearchText(word);
  if (!normalizedWord) return false;
  const regex = new RegExp(`(?:^|\\s)${normalizedWord}(?:\\s|$)`);
  return regex.test(text);
};

const hasAnyStyleExact = (styleNum: string, exactValues: readonly string[]): boolean =>
  exactValues.some((value) => styleNum === normalizeStyleNum(value));

const hasAnyStylePrefix = (styleNum: string, prefixes: readonly string[]): boolean =>
  prefixes.some((prefix) => styleNum.startsWith(normalizeStyleNum(prefix)));

const WATER_BOTTLE_PHRASES = ['WATER BOTTLE', 'WATERBOTTLE', 'BOTTLE', 'POLYCARB BTL', 'UV WB'] as const;
const WATER_BOTTLE_STYLES = ['SSBOT', 'H20BTL', 'H20BTL2'] as const;

const PLUSH_PHRASES = ['PLUSH', 'BEAR', 'BEAR SHIRTS', 'BASIC BEAR', 'PREPAK'] as const;
const PLUSH_STYLE_EXACT = ['BPBB', 'BEARSHI'] as const;
const PLUSH_STYLE_PREFIX = ['BEAR'] as const;

const SIGNAGE_PHRASES = ['HEADER CARD', 'HEADERCARD', 'SPINNER HEADER', 'SIGN', 'SIGNAGE'] as const;
const SIGNAGE_STYLES = ['SPINSIG', 'PFDHEAD'] as const;

const STICKER_PHRASES = ['STICKER', 'STICKERS', 'DECAL', 'DECALS'] as const;

const BACKPACK_STRONG_PHRASES = ['BACKPACK', 'BOOKBAG', 'BACK PACK'] as const;
const BACKPACK_WEAK_WORDS = ['BAG', 'PACK'] as const;
const BACKPACK_WEAK_EXCLUSIONS = ['PREPAK', 'CASE PACK', 'PACK SIZE', 'SIZE PACK'] as const;

const SOCKS_PHRASES = ['SOCK', 'SOCKS', 'CREW 8'] as const;
const SOCKS_STYLES = ['S8052'] as const;

const KNIT_BEANIE_PHRASES = ['BEANIE', 'KNIT', 'KNIT CAP', 'ROLLUP KNIT'] as const;
const KNIT_BEANIE_STYLES = ['SP08', '4753', '7341', '7342'] as const;

const CAPS_HAT_PHRASES = ['CAP', 'HAT', 'HATS', 'WASH CAP'] as const;
const CAPS_HAT_STYLES = ['VC300', 'VC300D', 'VC300M2', '4517'] as const;

const JACKET_PHRASES = ['JACKET', 'JACKETS', 'NYLON JACKET'] as const;
const JACKET_STYLES = ['5617'] as const;

const FLANNEL_PHRASES = ['FLANNEL', 'FLA', 'PAJAMA PANT', 'PANT PP'] as const;
const FLANNEL_STYLES = ['F15', 'F15P'] as const;

const PANTS_PHRASES = ['JOGGER', 'SWEAT PANTS', 'SWEATPANTS', 'PANTS', 'PANT ON'] as const;
const PANTS_STYLE_PREFIX = ['974', '975'] as const;

const SHORTS_PHRASES = ['SHORT', 'SHORTS', 'FLEECE SHORT'] as const;
const SHORTS_STYLES = ['4890P'] as const;

const YOUTH_INFANT_PHRASES = ['YOUTH', 'YTH', 'TODDLER', 'INFANT', 'ONESIE', 'BABY'] as const;

const LADIES_TOPS_PHRASES = ['WOMENS', 'WOMEN', 'LADIES', 'LADY', 'GIRLS', 'LADIES TEE', 'WOMENS TEE'] as const;
const LADIES_TOPS_STYLES = ['560WVR', 'IC47WR'] as const;

const UNISEX_FALLBACK_PHRASES = [
  'TEE',
  'T SHIRT',
  'SS COTTON TEE',
  'ICONIC TEE',
  'TRI BLEND',
  'L S TEE',
  'HOOD',
  'HOODIE',
  'HOODED SWEAT',
  'SWEATSHIRT',
  'CREW',
] as const;

const buildSearchContext = (input: ApiCollegeCategorizationInput): SearchContext => {
  const shirtName = normalizeSearchText(input.SHIRT_NAME);
  const description = normalizeSearchText(input.DESCRIPT);
  const styleNum = normalizeStyleNum(input.STYL_NUM);
  const text = normalizeSearchText([input.SHIRT_NAME, input.DESCRIPT, input.STYL_NUM].filter(Boolean).join(' '));
  return { shirtName, description, styleNum, text };
};

const matchesBackpackRule = (context: SearchContext): boolean => {
  if (hasAnyPhrase(context.text, BACKPACK_STRONG_PHRASES)) {
    return true;
  }

  const hasExcludedPackPhrase = hasAnyPhrase(context.text, BACKPACK_WEAK_EXCLUSIONS);
  if (hasExcludedPackPhrase) {
    return false;
  }

  // Weak bag/pack keywords are accepted only from SHIRT_NAME to reduce false positives.
  return BACKPACK_WEAK_WORDS.some((word) => hasWord(context.shirtName, word));
};

export const API_COLLEGE_CATEGORY_RULES: readonly CategoryRule[] = [
  {
    category: API_COLLEGE_CATEGORIES.WATER_BOTTLES,
    matches: (context) =>
      hasAnyPhrase(context.text, WATER_BOTTLE_PHRASES) ||
      hasAnyStyleExact(context.styleNum, WATER_BOTTLE_STYLES),
  },
  {
    category: API_COLLEGE_CATEGORIES.PLUSH,
    matches: (context) =>
      hasAnyPhrase(context.text, PLUSH_PHRASES) ||
      hasAnyStyleExact(context.styleNum, PLUSH_STYLE_EXACT) ||
      hasAnyStylePrefix(context.styleNum, PLUSH_STYLE_PREFIX),
  },
  {
    category: API_COLLEGE_CATEGORIES.SIGNAGE,
    matches: (context) =>
      hasAnyPhrase(context.text, SIGNAGE_PHRASES) ||
      hasAnyStyleExact(context.styleNum, SIGNAGE_STYLES),
  },
  {
    category: API_COLLEGE_CATEGORIES.STICKERS,
    matches: (context) => hasAnyPhrase(context.text, STICKER_PHRASES),
  },
  {
    category: API_COLLEGE_CATEGORIES.BACKPACK,
    matches: matchesBackpackRule,
  },
  {
    category: API_COLLEGE_CATEGORIES.SOCKS,
    matches: (context) =>
      hasAnyPhrase(context.text, SOCKS_PHRASES) ||
      hasAnyStyleExact(context.styleNum, SOCKS_STYLES),
  },
  {
    // Beanies must be evaluated before generic hats/caps.
    category: API_COLLEGE_CATEGORIES.KNIT_CAPS_BEANIE,
    matches: (context) =>
      hasAnyPhrase(context.text, KNIT_BEANIE_PHRASES) ||
      hasAnyStyleExact(context.styleNum, KNIT_BEANIE_STYLES),
  },
  {
    category: API_COLLEGE_CATEGORIES.CAPS_HAT,
    matches: (context) =>
      hasAnyPhrase(context.text, CAPS_HAT_PHRASES) ||
      hasAnyStyleExact(context.styleNum, CAPS_HAT_STYLES),
  },
  {
    category: API_COLLEGE_CATEGORIES.JACKETS,
    matches: (context) =>
      hasAnyPhrase(context.text, JACKET_PHRASES) ||
      hasAnyStyleExact(context.styleNum, JACKET_STYLES),
  },
  {
    // Flannels must run before generic pants.
    category: API_COLLEGE_CATEGORIES.FLANNELS,
    matches: (context) =>
      hasAnyPhrase(context.text, FLANNEL_PHRASES) ||
      hasAnyStyleExact(context.styleNum, FLANNEL_STYLES),
  },
  {
    category: API_COLLEGE_CATEGORIES.PANTS,
    matches: (context) =>
      (hasAnyPhrase(context.text, PANTS_PHRASES) && !hasAnyPhrase(context.text, SHORTS_PHRASES)) ||
      hasAnyStylePrefix(context.styleNum, PANTS_STYLE_PREFIX),
  },
  {
    // Shorts run before general apparel fallbacks.
    category: API_COLLEGE_CATEGORIES.SHORTS,
    matches: (context) =>
      hasAnyPhrase(context.text, SHORTS_PHRASES) ||
      hasAnyStyleExact(context.styleNum, SHORTS_STYLES),
  },
  {
    category: API_COLLEGE_CATEGORIES.YOUTH_INFANT,
    matches: (context) => hasAnyPhrase(context.text, YOUTH_INFANT_PHRASES),
  },
  {
    // Ladies keywords must beat unisex tee fallback.
    category: API_COLLEGE_CATEGORIES.LADIES_TOPS,
    matches: (context) =>
      hasAnyPhrase(context.text, LADIES_TOPS_PHRASES) ||
      hasAnyStyleExact(context.styleNum, LADIES_TOPS_STYLES),
  },
  {
    category: API_COLLEGE_CATEGORIES.UNISEX_TSHIRT,
    matches: (context) => hasAnyPhrase(context.text, UNISEX_FALLBACK_PHRASES),
  },
];

export const categorizeApiCollegeProduct = (input: ApiCollegeCategorizationInput): ApiCollegeCategory => {
  const context = buildSearchContext(input);
  for (const rule of API_COLLEGE_CATEGORY_RULES) {
    if (rule.matches(context)) {
      return rule.category;
    }
  }
  return API_COLLEGE_CATEGORIES.UNCLASSIFIED;
};

const CATEGORY_TO_PATH: Record<ApiCollegeCategory, string> = {
  [API_COLLEGE_CATEGORIES.WATER_BOTTLES]: 'bottle',
  [API_COLLEGE_CATEGORIES.PLUSH]: 'plush',
  [API_COLLEGE_CATEGORIES.SIGNAGE]: 'signage',
  [API_COLLEGE_CATEGORIES.STICKERS]: 'sticker',
  [API_COLLEGE_CATEGORIES.BACKPACK]: 'backpack',
  [API_COLLEGE_CATEGORIES.SOCKS]: 'socks',
  [API_COLLEGE_CATEGORIES.KNIT_CAPS_BEANIE]: 'knit-cap',
  [API_COLLEGE_CATEGORIES.CAPS_HAT]: 'cap',
  [API_COLLEGE_CATEGORIES.JACKETS]: 'jacket',
  [API_COLLEGE_CATEGORIES.FLANNELS]: 'flannels',
  [API_COLLEGE_CATEGORIES.PANTS]: 'pants',
  [API_COLLEGE_CATEGORIES.SHORTS]: 'shorts',
  [API_COLLEGE_CATEGORIES.YOUTH_INFANT]: 'youth&infant',
  [API_COLLEGE_CATEGORIES.LADIES_TOPS]: 'tshirt/women',
  [API_COLLEGE_CATEGORIES.UNISEX_TSHIRT]: 'tshirt/men',
  [API_COLLEGE_CATEGORIES.UNCLASSIFIED]: 'api-products',
};

export const getCategoryPathForApiCollegeCategory = (category: ApiCollegeCategory): string =>
  CATEGORY_TO_PATH[category] || 'api-products';
