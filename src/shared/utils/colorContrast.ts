/**
 * Color contrast utilities for WCAG 2.2 AA compliance
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex colors like #ffffff');
  }
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standards
 */
export function meetsWCAGAAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get accessible text color (black or white) for a given background
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  const whiteRatio = getContrastRatio('#ffffff', backgroundColor);
  const blackRatio = getContrastRatio('#000000', backgroundColor);
  
  return whiteRatio > blackRatio ? '#ffffff' : '#000000';
}

/**
 * Validate color palette for accessibility
 */
export function validateColorPalette(palette: Record<string, string>): {
  valid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check common color combinations
  const combinations = [
    { fg: 'color-text', bg: 'color-bg', name: 'Primary text on background' },
    { fg: 'color-text-muted', bg: 'color-bg', name: 'Muted text on background' },
    { fg: 'color-text', bg: 'color-bg-alt', name: 'Primary text on alternate background' },
    { fg: 'color-primary', bg: 'color-bg', name: 'Primary color on background' },
    { fg: 'color-danger', bg: 'color-bg', name: 'Error text on background' },
    { fg: 'color-success', bg: 'color-bg', name: 'Success text on background' }
  ];
  
  combinations.forEach(({ fg, bg, name }) => {
    const fgColor = palette[fg];
    const bgColor = palette[bg];
    
    if (fgColor && bgColor) {
      const ratio = getContrastRatio(fgColor, bgColor);
      
      if (ratio < 4.5) {
        issues.push(`${name}: Contrast ratio ${ratio.toFixed(2)} is below WCAG AA standard (4.5:1)`);
        
        if (ratio < 3) {
          recommendations.push(`${name}: Consider using a darker foreground or lighter background`);
        }
      }
    }
  });
  
  return {
    valid: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Generate accessible color variants
 */
export function generateAccessibleVariants(baseColor: string): {
  lighter: string;
  darker: string;
  accessible: string;
} {
  const rgb = hexToRgb(baseColor);
  if (!rgb) {
    throw new Error('Invalid base color format');
  }
  
  // Generate lighter variant (increase luminance)
  const lighter = `#${Math.min(255, Math.round(rgb.r * 1.2)).toString(16).padStart(2, '0')}${Math.min(255, Math.round(rgb.g * 1.2)).toString(16).padStart(2, '0')}${Math.min(255, Math.round(rgb.b * 1.2)).toString(16).padStart(2, '0')}`;
  
  // Generate darker variant (decrease luminance)
  const darker = `#${Math.max(0, Math.round(rgb.r * 0.8)).toString(16).padStart(2, '0')}${Math.max(0, Math.round(rgb.g * 0.8)).toString(16).padStart(2, '0')}${Math.max(0, Math.round(rgb.b * 0.8)).toString(16).padStart(2, '0')}`;
  
  // Get accessible text color
  const accessible = getAccessibleTextColor(baseColor);
  
  return { lighter, darker, accessible };
}

/**
 * CSS custom property for dynamic contrast checking
 */
export function createContrastCSS(foregroundVar: string, backgroundVar: string): string {
  return `
    /* Ensure minimum contrast ratio */
    color: var(${foregroundVar});
    background: var(${backgroundVar});
    
    @media (prefers-contrast: more) {
      color: var(${foregroundVar}-high-contrast, var(${foregroundVar}));
      background: var(${backgroundVar}-high-contrast, var(${backgroundVar}));
    }
  `;
}