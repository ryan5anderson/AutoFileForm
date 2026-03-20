const COLOR_CODE_MAP: Record<string, string> = {
  '172': '#f76900',
  AMO: '#ffb81c',
  BAP: '#002d72',
  BLK: '#111827',
  BOA: '#fa4616',
  BRN: '#5f4529',
  CAN: '#ffd100',
  CCR: '#990000',
  COG: '#b87333',
  CP2: '#111827',
  CUY: '#ffc72c',
  FGR: '#18453b',
  GLD: '#c99700',
  GOL: '#b9975b',
  GOV: '#ffcd00',
  GRY: '#9ca3af',
  MRN: '#7a0019',
  MUN: '#9e1b32',
  NAV: '#002147',
  ORA: '#ff6f00',
  PNP: '#522398',
  PUR: '#4b2e83',
  RED: '#c8102e',
  RYL: '#005bbb',
  TAS: '#866d4b',
  TEL: '#008c95',
  TXO: '#f76900',
  UBG: '#7c2529',
  VEG: '#b7a57a',
  WHT: '#f9fafb',
};

const FALLBACK_PRIMARY = '#2563eb';
const FALLBACK_SECONDARY = '#1d4ed8';
const FALLBACK_NEUTRAL = '#6b7280';

const normalizeHex = (value: string): string => {
  const hex = value.trim();
  if (!hex.startsWith('#')) return FALLBACK_NEUTRAL;
  if (hex.length === 4) {
    const r = hex.charAt(1);
    const g = hex.charAt(2);
    const b = hex.charAt(3);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (hex.length === 7) return hex;
  return FALLBACK_NEUTRAL;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const safe = normalizeHex(hex).replace('#', '');
  const r = Number.parseInt(safe.slice(0, 2), 16);
  const g = Number.parseInt(safe.slice(2, 4), 16);
  const b = Number.parseInt(safe.slice(4, 6), 16);
  return { r, g, b };
};

const toRgba = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getContrastingText = (hex: string): '#0f172a' | '#ffffff' => {
  const { r, g, b } = hexToRgb(hex);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.62 ? '#0f172a' : '#ffffff';
};

const resolveCodeToHex = (code: string): string => {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return FALLBACK_NEUTRAL;
  return COLOR_CODE_MAP[normalized] || FALLBACK_NEUTRAL;
};

export interface SchoolBrandPalette {
  primary: string;
  secondary: string;
  textOnPrimary: '#0f172a' | '#ffffff';
  accentSurface: string;
  accentSurfaceStrong: string;
  accentRing: string;
  accentBorder: string;
}

export const getSchoolBrandPalette = (schoolColors?: string | null): SchoolBrandPalette => {
  const tokens = (schoolColors || '')
    .split('/')
    .map((token) => token.trim())
    .filter(Boolean);

  const resolved = tokens.map(resolveCodeToHex).filter(Boolean);
  const primary = resolved[0] || FALLBACK_PRIMARY;
  const secondary = resolved[1] || FALLBACK_SECONDARY;

  return {
    primary,
    secondary,
    textOnPrimary: getContrastingText(primary),
    accentSurface: toRgba(primary, 0.08),
    accentSurfaceStrong: toRgba(primary, 0.14),
    accentRing: toRgba(primary, 0.22),
    accentBorder: toRgba(primary, 0.35),
  };
};
