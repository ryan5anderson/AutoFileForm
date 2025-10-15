/**
 * Example usage of CSS custom property validation utilities
 * This file demonstrates best practices for using the style helpers
 */

import {
  validateCSSCustomProperty,
  createStyleProps,
  createSpacingProps,
  createColorProps,
  createSizeProps,
  combineStyleProps,
  isCSSCustomProperty,
  extractCustomProperties
} from './styleHelpers';

// Example 1: Basic CSS custom property validation
export const createExampleValidation = () => {
  // ✅ Valid CSS custom properties
  const validProps = {
    '--color-primary': 'var(--color-primary)',
    '--spacing': 'var(--space-3)',
    '--font-size': 'var(--font-2)'
  };

  // ❌ Invalid properties (will show warnings in development)
  const invalidProps = {
    'color-primary': '#ff0000',  // Missing --
    '--spacing': '16px',         // Raw pixel value
    '--color': '#ff0000'         // Raw color value
  };

  // Create validated style props
  const styles = createStyleProps(validProps);
  return styles;
};

// Example 2: Component styling helper function
interface DynamicComponentProps {
  gap?: string;
  padding?: string;
  backgroundColor?: string;
  variant?: 'primary' | 'secondary';
}

export const createDynamicComponentStyles = (props: DynamicComponentProps) => {
  const {
    gap = 'var(--space-2)',
    padding = 'var(--space-3)',
    backgroundColor = 'var(--color-bg)',
    variant = 'primary'
  } = props;

  // Combine spacing and color props
  const spacingProps = createSpacingProps({ gap, padding });
  const colorProps = createColorProps({ background: backgroundColor });
  
  return combineStyleProps(spacingProps, colorProps);
};

// Example 3: Responsive styling with CSS custom properties
export const createResponsiveGridStyles = () => {
  return createStyleProps({
    '--grid-columns': '1',
    '--grid-gap': 'var(--space-2)',
    '--grid-columns-md': '2',
    '--grid-gap-md': 'var(--space-3)',
    '--grid-columns-lg': '3',
    '--grid-gap-lg': 'var(--space-4)'
  });
};

// Example 4: Extract only custom properties from mixed styles
export const createStrictComponentStyles = (customStyles: Record<string, any> = {}) => {
  // Extract only CSS custom properties, filtering out regular CSS properties
  return extractCustomProperties(customStyles);
};

// Example 5: Helper functions for CSS custom properties
export const HelperExamples = () => {
  // Check if properties are CSS custom properties
  const isCustomProp1 = isCSSCustomProperty('--color-primary'); // true
  const isCustomProp2 = isCSSCustomProperty('color'); // false

  // Create size-related custom properties
  const sizeProps = createSizeProps({
    width: '100%',
    height: 'auto',
    maxWidth: '600px'
  });

  return { isCustomProp1, isCustomProp2, sizeProps };
};

// Example 6: Validation in development
export const DebugExample = () => {
  // In development, validate CSS custom properties
  if (process.env.NODE_ENV === 'development') {
    const isValid1 = validateCSSCustomProperty('--color-primary', 'var(--color-primary)');
    const isValid2 = validateCSSCustomProperty('color', '#ff0000'); // Will show warning
    
    console.log('Validation results:', { isValid1, isValid2 });
  }
};

// Example 7: Combining multiple style objects
export const ValidationExamples = () => {
  const spacingStyles = createSpacingProps({ gap: 'var(--space-2)', padding: 'var(--space-4)' });
  const colorStyles = createColorProps({ background: 'var(--color-surface)', color: 'var(--color-text)' });
  const sizeStyles = createSizeProps({ width: '100%', maxWidth: '800px' });
  
  // Combine all styles safely
  const combinedStyles = combineStyleProps(spacingStyles, colorStyles, sizeStyles);
  
  return combinedStyles;
};

// CSS Module styles would look like this:
/*
.component {
  display: flex;
  gap: var(--component-gap, var(--space-2));
  padding: var(--component-padding, var(--space-3));
  background: var(--component-bg, var(--color-bg));
}

.component--primary {
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.component--secondary {
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.responsive-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--gap);
}

@media (--bp-md) {
  .responsive-grid {
    grid-template-columns: repeat(var(--grid-columns-md), 1fr);
    gap: var(--gap-md);
  }
}

@media (--bp-lg) {
  .responsive-grid {
    grid-template-columns: repeat(var(--grid-columns-lg), 1fr);
    gap: var(--gap-lg);
  }
}
*/