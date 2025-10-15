/**
 * Utility functions for working with CSS custom properties in the unified styling system
 */

/**
 * Validates that a CSS custom property follows the correct naming convention
 */
export const validateCSSCustomProperty = (property: string, value: string): boolean => {
  if (!property.startsWith('--')) {
    console.warn(`Invalid CSS custom property: ${property}. Must start with '--'`);
    return false;
  }
  
  if (typeof value !== 'string' && typeof value !== 'number') {
    console.warn(`Invalid CSS custom property value: ${value}. Must be a string or number`);
    return false;
  }
  
  return true;
};

/**
 * Creates a type-safe style object with CSS custom properties
 * Only allows CSS custom properties (--*) to prevent inline styling violations
 */
export const createStyleProps = (customProps: Record<string, string | number>): React.CSSProperties => {
  const validProps: React.CSSProperties = {};
  
  Object.entries(customProps).forEach(([key, value]) => {
    if (validateCSSCustomProperty(key, String(value))) {
      (validProps as any)[key] = value;
    }
  });
  
  return validProps;
};

/**
 * Helper to create dynamic CSS custom properties for component spacing
 */
export const createSpacingProps = (props: {
  gap?: string;
  padding?: string;
  margin?: string;
}): React.CSSProperties => {
  return createStyleProps({
    '--component-gap': props.gap || 'var(--space-2)',
    '--component-padding': props.padding || 'var(--space-3)',
    '--component-margin': props.margin || '0',
  });
};

/**
 * Helper to create dynamic CSS custom properties for component colors
 */
export const createColorProps = (props: {
  background?: string;
  color?: string;
  border?: string;
}): React.CSSProperties => {
  return createStyleProps({
    '--component-bg': props.background || 'transparent',
    '--component-color': props.color || 'var(--color-text)',
    '--component-border': props.border || 'var(--color-border)',
  });
};

/**
 * Helper to create dynamic CSS custom properties for responsive sizing
 */
export const createSizeProps = (props: {
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
}): React.CSSProperties => {
  return createStyleProps({
    '--component-width': props.width || 'auto',
    '--component-height': props.height || 'auto',
    '--component-min-width': props.minWidth || '0',
    '--component-max-width': props.maxWidth || 'none',
  });
};

/**
 * Combines multiple style prop objects safely
 */
export const combineStyleProps = (...styleObjects: React.CSSProperties[]): React.CSSProperties => {
  return styleObjects.reduce((combined, current) => {
    return { ...combined, ...current };
  }, {});
};

/**
 * Type guard to check if a style property is a CSS custom property
 */
export const isCSSCustomProperty = (property: string): boolean => {
  return property.startsWith('--');
};

/**
 * Extracts only CSS custom properties from a style object
 * Useful for filtering out non-custom properties that shouldn't be in inline styles
 */
export const extractCustomProperties = (styles: Record<string, any>): React.CSSProperties => {
  const customProps: React.CSSProperties = {};
  
  Object.entries(styles).forEach(([key, value]) => {
    if (isCSSCustomProperty(key)) {
      (customProps as any)[key] = value;
    }
  });
  
  return customProps;
};