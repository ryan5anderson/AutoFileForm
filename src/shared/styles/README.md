# Enhanced Design Token System

This document outlines the enhanced design token system for the UI System Unification project.

## Overview

The design token system provides a centralized, consistent approach to styling using CSS custom properties, custom media queries, and CSS Modules integration.

## Token Categories

### Breakpoint Tokens
```css
--bp-xs: 320px   /* Extra small devices */
--bp-sm: 640px   /* Small devices */
--bp-md: 768px   /* Medium devices */
--bp-lg: 1024px  /* Large devices */
--bp-xl: 1280px  /* Extra large devices */
--bp-2xl: 1536px /* 2X large devices */
```

### Container Tokens
```css
--container-xs: min(100%, 480px)
--container-sm: min(100%, 640px)
--container-md: min(100%, 768px)
--container-lg: min(100%, 1024px)
--container-xl: min(100%, 1280px)
--container-2xl: min(100%, 1536px)
```

### Component-Specific Tokens
```css
--card-padding: var(--space-3)
--card-gap: var(--space-2)
--form-field-height: 44px
--sidebar-width: clamp(280px, 25vw, 320px)
```

## Custom Media Queries

### Breakpoint Queries
```css
@custom-media --bp-xs (min-width: 320px);
@custom-media --bp-sm (min-width: 640px);
@custom-media --bp-md (min-width: 768px);
@custom-media --bp-lg (min-width: 1024px);
@custom-media --bp-xl (min-width: 1280px);
@custom-media --bp-2xl (min-width: 1536px);
```

### Container Queries
```css
@custom-media --container-xs (min-width: 320px);
@custom-media --container-sm (min-width: 480px);
@custom-media --container-md (min-width: 640px);
@custom-media --container-lg (min-width: 768px);
@custom-media --container-xl (min-width: 1024px);
@custom-media --container-2xl (min-width: 1280px);
```

## Usage Examples

### CSS Modules with Custom Media Queries
```css
/* Component.module.css */
.component {
  padding: var(--card-padding);
  display: grid;
  gap: var(--card-gap);
  grid-template-columns: 1fr;
}

@media (--bp-md) {
  .component {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
}
```

### Dynamic Styling with CSS Custom Properties
```typescript
// Component.tsx
import styles from './Component.module.css';
import { createStyleProps } from '../utils/styleHelpers';

interface ComponentProps {
  gap?: string;
  padding?: string;
}

const Component: React.FC<ComponentProps> = ({ gap, padding }) => (
  <div 
    className={styles.component}
    style={createStyleProps({
      '--component-gap': gap || 'var(--space-2)',
      '--component-padding': padding || 'var(--card-padding)'
    })}
  >
    Content
  </div>
);
```

### Container Queries
```css
.cardGrid {
  container-type: inline-size;
  container-name: card-grid;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

@container card-grid (max-width: 400px) {
  .cardGrid {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}
```

## TypeScript Integration

### CSS Modules Types
```typescript
import styles from './Component.module.css';
// styles is typed as { [key: string]: string }
```

### Dynamic Style Props
```typescript
import type { DynamicStyleProps } from '../types/styles';

interface ComponentProps {
  dynamicStyles?: DynamicStyleProps;
}
```

### Design Token Types
```typescript
import type { ColorToken, SpacingToken } from '../types/tokens';

const getColor = (token: ColorToken) => `var(--color-${token})`;
const getSpacing = (token: SpacingToken) => `var(--space-${token})`;
```

## Linting Rules

### Stylelint
- **No raw hex colors**: Use `var(--color-*)` tokens instead
- **No !important**: Use CSS specificity and cascade layers
- **Custom media queries**: Use `--bp-*` and `--container-*` instead of raw breakpoints
- **Logical properties**: Use `margin-inline` instead of `margin-left/right`

### ESLint
- **No inline styles**: Use CSS Modules instead of `style={{...}}`
- **CSS custom properties only**: Only CSS custom properties (`--*`) allowed in style prop
- **Component prop validation**: Enforce proper prop patterns

## Migration Patterns

### From Styled Components
```typescript
// Before
const StyledCard = styled.div`
  padding: 1rem;
  background: #ffffff;
`;

// After
const Card = ({ children }) => (
  <div className={styles.card}>
    {children}
  </div>
);
```

### From Inline Styles
```typescript
// Before
<div style={{ padding: '1rem', gap: '0.5rem' }}>

// After
<div 
  className={styles.component}
  style={{ '--component-gap': '0.5rem' }}
>
```

## Best Practices

1. **Always use design tokens** instead of raw values
2. **Prefer CSS Modules** over inline styles
3. **Use custom media queries** for responsive design
4. **Leverage container queries** for component-level responsiveness
5. **Pass dynamic values** through CSS custom properties
6. **Follow BEM naming** in CSS Modules
7. **Use TypeScript types** for better developer experience

## Accessibility Considerations

- All color tokens maintain WCAG 2.2 AA contrast ratios
- High contrast mode variants available
- Reduced motion preferences supported
- Touch target minimums enforced (44px)
- Focus ring tokens for consistent focus indicators