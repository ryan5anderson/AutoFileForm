# UI System Unification Design

## Overview

This design document outlines the architecture for unifying the current hybrid styling system (styled-components + CSS Modules + global CSS) into a consistent CSS Modules + Design Tokens + Cascade Layers approach. The design preserves all existing functionality while establishing a maintainable, scalable styling foundation.

## Architecture

### Core Principles

1. **Single Source of Truth**: CSS Modules as the primary styling method
2. **Token-First Design**: All values derived from design tokens
3. **Layer-Based Organization**: Cascade layers for predictable specificity
4. **Component Isolation**: Self-contained, reusable styling patterns
5. **Performance Optimization**: Modern CSS features for efficient rendering

### System Components

```
Styling System Architecture:
┌─────────────────────────────────────────────────────────────┐
│                    CSS Modules + Tokens                     │
├─────────────────────────────────────────────────────────────┤
│ @layer reset     │ Normalize, box-sizing, resets           │
│ @layer tokens    │ CSS custom properties, media queries    │
│ @layer base      │ HTML elements, typography scale         │
│ @layer components│ Component-specific styles (.module.css) │
│ @layer utilities │ Helper classes, layout primitives       │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Enhanced Design Token System

**Location**: `src/styles/tokens.css`

**Enhancements**:
```css
@layer tokens {
  :root {
    /* Existing tokens preserved */
    
    /* Enhanced breakpoint tokens */
    --bp-xs: 320px;
    --bp-sm: 640px;
    --bp-md: 768px;
    --bp-lg: 1024px;
    --bp-xl: 1280px;
    --bp-2xl: 1536px;
    
    /* Container size tokens */
    --container-xs: min(100%, 480px);
    --container-sm: min(100%, 640px);
    --container-md: min(100%, 768px);
    --container-lg: min(100%, 1024px);
    --container-xl: min(100%, 1280px);
    --container-2xl: min(100%, 1536px);
    
    /* Component-specific tokens */
    --card-padding: var(--space-3);
    --card-gap: var(--space-2);
    --form-field-height: 44px;
    --sidebar-width: clamp(280px, 25vw, 320px);
  }
  
  /* Custom media queries */
  @custom-media --bp-xs (min-width: 320px);
  @custom-media --bp-sm (min-width: 640px);
  @custom-media --bp-md (min-width: 768px);
  @custom-media --bp-lg (min-width: 1024px);
  @custom-media --bp-xl (min-width: 1280px);
  @custom-media --bp-2xl (min-width: 1536px);
  
  /* Container queries */
  @custom-media --container-sm (min-width: 320px);
  @custom-media --container-md (min-width: 480px);
  @custom-media --container-lg (min-width: 640px);
}
```

### 2. CSS Module Pattern Standards

**Naming Convention**:
```css
/* ComponentName.module.css */
.componentName { /* Root component class */ }
.componentName__element { /* BEM-style element */ }
.componentName--modifier { /* BEM-style modifier */ }
.componentName[data-state="active"] { /* Data attribute states */ }
```

**Dynamic Styling Pattern**:
```typescript
// Component.tsx
interface ComponentProps {
  gap?: string;
  variant?: 'primary' | 'secondary';
}

const Component: React.FC<ComponentProps> = ({ gap, variant }) => (
  <div 
    className={`${styles.component} ${styles[`component--${variant}`]}`}
    style={{ '--component-gap': gap } as React.CSSProperties}
  >
    Content
  </div>
);
```

```css
/* Component.module.css */
.component {
  display: flex;
  gap: var(--component-gap, var(--space-2));
  padding: var(--card-padding);
}

.component--primary {
  background: var(--color-primary);
  color: white;
}

.component--secondary {
  background: var(--color-bg-alt);
  color: var(--color-text);
}
```

### 3. Responsive Design Patterns

**Container Query Pattern**:
```css
.cardGrid {
  container-type: inline-size;
  container-name: card-grid;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(var(--card-min-width, 16rem), 1fr));
}

@container card-grid (max-width: 400px) {
  .cardGrid {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}
```

**Media Query Pattern**:
```css
.navigation {
  display: flex;
  flex-direction: column;
}

@media (--bp-md) {
  .navigation {
    flex-direction: row;
    gap: var(--space-4);
  }
}
```

### 4. Component Migration Patterns

**From Styled-Components**:
```typescript
// Before: styled-components
const StyledCard = styled.div<{ $variant: string }>`
  padding: var(--space-3);
  background: ${props => props.$variant === 'elevated' ? 'var(--color-bg)' : 'transparent'};
`;

// After: CSS Modules
const Card: React.FC<CardProps> = ({ variant, children }) => (
  <div className={`${styles.card} ${styles[`card--${variant}`]}`}>
    {children}
  </div>
);
```

```css
/* Card.module.css */
.card {
  padding: var(--card-padding);
  border-radius: var(--radius-md);
  transition: all var(--motion-fast) var(--motion-ease);
}

.card--elevated {
  background: var(--color-bg);
  box-shadow: var(--elevation-2);
  border: 1px solid var(--color-border);
}

.card--outlined {
  background: transparent;
  border: 1px solid var(--color-border);
}
```

**From Inline Styles**:
```typescript
// Before: inline styles
<div style={{
  display: 'flex',
  gap: '1rem',
  padding: '1.5rem',
  background: 'var(--color-bg)',
  borderRadius: '12px'
}}>

// After: CSS Modules with dynamic props
<div 
  className={styles.panel}
  style={{ '--panel-gap': gap } as React.CSSProperties}
>
```

```css
/* Panel.module.css */
.panel {
  display: flex;
  gap: var(--panel-gap, var(--space-3));
  padding: var(--space-4);
  background: var(--color-bg);
  border-radius: var(--radius-lg);
}
```

## Data Models

### CSS Module Type Definitions

```typescript
// types/styles.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Component prop types for dynamic styling
interface StyleProps {
  className?: string;
  style?: React.CSSProperties;
}

interface ResponsiveProps {
  gap?: string;
  padding?: string;
  margin?: string;
}

interface VariantProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'active' | 'disabled';
}
```

### Design Token Interface

```typescript
// types/tokens.d.ts
interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    // ... all color tokens
  };
  spacing: {
    1: string;
    2: string;
    // ... all spacing tokens
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}
```

## Error Handling

### Linting Configuration

**Stylelint Configuration** (`stylelint.config.js`):
```javascript
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    // Prevent raw color values
    'color-hex-length': 'short',
    'color-no-hex': true,
    
    // Prevent !important
    'declaration-no-important': [true, {
      severity: 'warning'
    }],
    
    // Enforce custom media queries
    'media-feature-name-no-unknown': [true, {
      ignoreMediaFeatureNames: ['/^--bp-/', '/^--container-/']
    }],
    
    // Prevent raw breakpoint values
    'media-feature-range-notation': 'prefix',
    
    // Enforce logical properties
    'property-disallowed-list': [
      'margin-left', 'margin-right',
      'padding-left', 'padding-right',
      'left', 'right',
      'border-left', 'border-right'
    ]
  }
};
```

**ESLint Configuration** (`.eslintrc.js`):
```javascript
module.exports = {
  rules: {
    // Forbid inline styles except CSS custom properties
    'react/forbid-dom-props': ['error', {
      forbid: [{
        propName: 'style',
        allowedFor: ['div', 'span'], // Only when passing CSS custom properties
        message: 'Use CSS Modules instead of inline styles'
      }]
    }],
    
    // Custom rule for CSS custom property validation
    'react/style-prop-object': ['error', {
      allow: ['--*'] // Allow CSS custom properties
    }]
  }
};
```

### Runtime Error Handling

```typescript
// utils/styleHelpers.ts
export const validateCSSCustomProperty = (property: string, value: string): boolean => {
  if (!property.startsWith('--')) {
    console.warn(`Invalid CSS custom property: ${property}. Must start with '--'`);
    return false;
  }
  return true;
};

export const createStyleProps = (customProps: Record<string, string>): React.CSSProperties => {
  const validProps: React.CSSProperties = {};
  
  Object.entries(customProps).forEach(([key, value]) => {
    if (validateCSSCustomProperty(key, value)) {
      (validProps as any)[key] = value;
    }
  });
  
  return validProps;
};
```

## Testing Strategy

### Visual Regression Testing

```typescript
// tests/visual/component.test.ts
import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  test('Card component variants', async ({ page }) => {
    await page.goto('/storybook/card');
    
    // Test all variants
    const variants = ['default', 'elevated', 'outlined'];
    
    for (const variant of variants) {
      await page.locator(`[data-variant="${variant}"]`).screenshot({
        path: `screenshots/card-${variant}.png`
      });
    }
  });
  
  test('Responsive breakpoints', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }  // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.screenshot({
        path: `screenshots/responsive-${viewport.width}x${viewport.height}.png`,
        fullPage: true
      });
    }
  });
});
```

### CSS Module Testing

```typescript
// tests/unit/styles.test.ts
import styles from '../components/Card/Card.module.css';

describe('CSS Modules', () => {
  test('should have expected class names', () => {
    expect(styles.card).toBeDefined();
    expect(styles['card--elevated']).toBeDefined();
    expect(styles['card--outlined']).toBeDefined();
  });
  
  test('should generate unique class names', () => {
    const classNames = Object.values(styles);
    const uniqueNames = new Set(classNames);
    expect(classNames.length).toBe(uniqueNames.size);
  });
});
```

### Accessibility Testing

```typescript
// tests/accessibility/component.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Card component accessibility', async () => {
  const { container } = render(
    <Card variant="elevated">
      <Card.Header>Title</Card.Header>
      <Card.Body>Content</Card.Body>
    </Card>
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Migration Strategy

### Phase 1: Foundation Setup
1. Enhance design tokens with new breakpoint and container tokens
2. Update PostCSS configuration for custom media queries
3. Configure enhanced linting rules
4. Set up testing infrastructure

### Phase 2: Core Component Migration
1. Migrate `Card` component (atom level)
2. Migrate `FormField` component (molecule level)
3. Migrate `CollegeSelector` page (organism level)
4. Document patterns and create templates

### Phase 3: Feature Component Migration
1. Convert all components in `src/features/components/panels/`
2. Eliminate all inline styles
3. Update component APIs to use CSS custom properties

### Phase 4: Global Style Cleanup
1. Remove unused styled-components
2. Clean up global CSS files
3. Optimize cascade layers
4. Performance audit and optimization

### Phase 5: Documentation and Tooling
1. Create component style guide
2. Set up automated visual regression testing
3. Document migration patterns
4. Train team on new patterns

## Performance Considerations

### Bundle Size Optimization
- CSS Modules provide automatic dead code elimination
- Cascade layers optimize CSS parsing performance
- Design tokens reduce CSS duplication

### Runtime Performance
- CSS custom properties enable efficient dynamic styling
- Container queries reduce JavaScript-based responsive logic
- Modern CSS features leverage browser optimizations

### Development Performance
- CSS Modules provide fast hot reloading
- TypeScript integration catches style errors at compile time
- Linting prevents performance anti-patterns

This design provides a comprehensive, maintainable foundation for the UI system while preserving all existing functionality and improving developer experience.