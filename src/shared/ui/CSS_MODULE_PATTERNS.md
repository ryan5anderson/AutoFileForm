# CSS Module Patterns and Templates

This document provides templates and patterns for creating consistent CSS Modules in the UI system unification project.

## BEM Naming Conventions for CSS Modules

We use a modified BEM (Block Element Modifier) naming convention adapted for CSS Modules:

### Basic Structure
```css
/* Block (Component) */
.componentName { }

/* Element */
.componentName__element { }

/* Modifier */
.componentName--modifier { }

/* State (using data attributes) */
.componentName[data-state="active"] { }
.componentName[data-variant="primary"] { }
```

### Examples
```css
/* Card component */
.card { }
.card__header { }
.card__body { }
.card__footer { }
.card--elevated { }
.card--outlined { }
.card[data-active="true"] { }

/* FormField component */
.formField { }
.formField__label { }
.formField__control { }
.formField__helpText { }
.formField__errorText { }
.formField--inline { }
.formField[data-has-error="true"] { }
```

## Component Template

### TypeScript Component Template

```typescript
import React from 'react';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

// Helper function to build CSS class names
const buildComponentClassName = (
  variant: 'default' | 'primary' | 'secondary' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md',
  className?: string
): string => {
  const classes = [styles.componentName];
  
  if (variant !== 'default') {
    classes.push(styles[`componentName--${variant}`]);
  }
  
  if (size !== 'md') {
    classes.push(styles[`componentName--${size}`]);
  }
  
  if (className) {
    classes.push(className);
  }
  
  return classes.join(' ');
};

const ComponentName: React.FC<ComponentNameProps> = ({
  children,
  variant = 'default',
  size = 'md',
  active = false,
  disabled = false,
  className,
  style,
  onClick,
  ...rest
}) => {
  return (
    <div
      className={buildComponentClassName(variant, size, className)}
      data-active={active}
      data-disabled={disabled}
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
};

export default ComponentName;
```

### CSS Module Template

```css
@layer components {
  /* Component root */
  .componentName {
    /* Container queries for responsive behavior */
    container-type: inline-size;
    container-name: component-name;
    
    /* Base styles using design tokens */
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text);
    transition: all var(--motion-fast) var(--motion-ease);
  }

  /* Size variants */
  .componentName--sm {
    padding: var(--space-2);
    font-size: var(--font-0);
  }

  .componentName--lg {
    padding: var(--space-4);
    font-size: var(--font-2);
  }

  /* Color variants */
  .componentName--primary {
    background: var(--color-primary);
    color: white;
  }

  .componentName--secondary {
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
  }

  /* State styles using data attributes */
  .componentName[data-active="true"] {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary);
  }

  .componentName[data-disabled="true"] {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Interactive states */
  .componentName:hover:not([data-disabled="true"]) {
    transform: translateY(-1px);
    box-shadow: var(--elevation-2);
  }

  .componentName:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  @media (prefers-contrast: more) {
    .componentName:focus-visible {
      outline-width: 3px;
    }
  }

  /* Container query responsive adjustments */
  @container component-name (max-width: 300px) {
    .componentName {
      padding: var(--space-2);
      font-size: var(--font-0);
    }
  }

  @container component-name (min-width: 500px) {
    .componentName {
      padding: var(--space-4);
    }
  }

  /* Media query fallback */
  @media (--bp-md) {
    .componentName {
      padding: var(--space-4);
    }
  }

  /* Child elements */
  .componentName__header {
    margin-block-end: var(--space-2);
    font-weight: 600;
  }

  .componentName__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .componentName__footer {
    margin-block-start: var(--space-2);
    padding-block-start: var(--space-2);
    border-block-start: 1px solid var(--color-border);
  }
}
```

## Dynamic Styling Patterns

### Using CSS Custom Properties for Dynamic Values

```typescript
// Component with dynamic styling
const DynamicComponent: React.FC<{
  gap?: string;
  backgroundColor?: string;
  borderRadius?: string;
}> = ({ gap, backgroundColor, borderRadius, children }) => {
  const dynamicStyles = {
    '--component-gap': gap,
    '--component-bg': backgroundColor,
    '--component-radius': borderRadius,
  } as React.CSSProperties;

  return (
    <div 
      className={styles.dynamicComponent}
      style={dynamicStyles}
    >
      {children}
    </div>
  );
};
```

```css
.dynamicComponent {
  display: flex;
  gap: var(--component-gap, var(--space-2));
  background: var(--component-bg, var(--color-bg));
  border-radius: var(--component-radius, var(--radius-md));
}
```

### Conditional Styling with Data Attributes

```typescript
// Component with conditional styling
const ConditionalComponent: React.FC<{
  layout?: 'horizontal' | 'vertical';
  emphasis?: 'low' | 'medium' | 'high';
  hasIcon?: boolean;
}> = ({ layout = 'vertical', emphasis = 'medium', hasIcon = false, children }) => {
  return (
    <div 
      className={styles.conditionalComponent}
      data-layout={layout}
      data-emphasis={emphasis}
      data-has-icon={hasIcon}
    >
      {children}
    </div>
  );
};
```

```css
.conditionalComponent {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.conditionalComponent[data-layout="horizontal"] {
  flex-direction: row;
  align-items: center;
}

.conditionalComponent[data-emphasis="low"] {
  opacity: 0.7;
}

.conditionalComponent[data-emphasis="high"] {
  font-weight: 600;
  color: var(--color-primary);
}

.conditionalComponent[data-has-icon="true"] {
  padding-inline-start: var(--space-4);
}
```

## Responsive Design Patterns

### Container Queries (Preferred)

```css
.responsiveComponent {
  container-type: inline-size;
  container-name: responsive-component;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: 1fr;
}

/* Component adapts based on its own width */
@container responsive-component (min-width: 400px) {
  .responsiveComponent {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }
}

@container responsive-component (min-width: 600px) {
  .responsiveComponent {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }
}
```

### Media Queries (Fallback)

```css
.mediaQueryComponent {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

@media (--bp-md) {
  .mediaQueryComponent {
    flex-direction: row;
    gap: var(--space-3);
  }
}

@media (--bp-lg) {
  .mediaQueryComponent {
    gap: var(--space-4);
  }
}
```

### Fluid Typography and Spacing

```css
.fluidComponent {
  /* Fluid typography using clamp() */
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  
  /* Fluid spacing */
  padding: clamp(var(--space-2), 3vw, var(--space-4));
  margin-block: clamp(var(--space-1), 2vw, var(--space-3));
  
  /* Fluid border radius */
  border-radius: clamp(var(--radius-sm), 1vw, var(--radius-lg));
}
```

## Accessibility Patterns

### Focus Management

```css
.accessibleComponent {
  /* Ensure interactive elements have proper focus indicators */
  position: relative;
}

.accessibleComponent:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (prefers-contrast: more) {
  .accessibleComponent:focus-visible {
    outline-width: 3px;
  }
}

/* Skip to content pattern */
.skipLink {
  position: absolute;
  left: -9999px;
  top: auto;
  z-index: var(--z-modal);
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  text-decoration: none;
  border: 2px solid var(--color-primary);
}

.skipLink:focus {
  left: var(--space-2);
  top: var(--space-2);
}
```

### Touch Targets

```css
.touchTarget {
  /* Ensure minimum 44px touch target */
  min-height: 44px;
  min-width: 44px;
  
  /* Add padding if content is smaller */
  padding: max(var(--space-2), calc((44px - 1em) / 2));
}
```

### High Contrast Support

```css
.highContrastComponent {
  border: 1px solid var(--color-border);
}

@media (prefers-contrast: more) {
  .highContrastComponent {
    border-width: 2px;
    border-color: var(--color-text);
  }
}

@media (forced-colors: active) {
  .highContrastComponent {
    forced-color-adjust: none;
    border-color: CanvasText;
  }
}
```

## Performance Patterns

### Efficient Selectors

```css
/* Good: Simple class selectors */
.component { }
.component__element { }
.component--modifier { }

/* Good: Single data attribute selectors */
.component[data-state="active"] { }

/* Avoid: Complex nested selectors */
/* .component .nested .deep .selector { } */

/* Avoid: Multiple attribute selectors */
/* .component[data-state="active"][data-variant="primary"][data-size="large"] { } */
```

### Layer Organization

```css
@layer components {
  /* All component styles go in the components layer */
  .component {
    /* Base styles */
  }
  
  .component--variant {
    /* Variant styles */
  }
  
  .component[data-state="active"] {
    /* State styles */
  }
}
```

## Migration Checklist

When migrating a component from styled-components to CSS Modules:

### 1. Create CSS Module File
- [ ] Create `ComponentName.module.css`
- [ ] Add `@layer components` wrapper
- [ ] Use BEM naming convention

### 2. Convert Styled Components
- [ ] Replace `styled.div` with regular HTML elements
- [ ] Move all styles to CSS Module
- [ ] Convert props to data attributes or CSS custom properties
- [ ] Add helper functions for className building

### 3. Preserve Functionality
- [ ] Maintain all existing props and API
- [ ] Preserve accessibility features (ARIA attributes, focus management)
- [ ] Keep responsive behavior intact
- [ ] Maintain interactive states (hover, focus, active)

### 4. Update TypeScript
- [ ] Add `style?: React.CSSProperties` to props interface
- [ ] Import CSS Module with proper typing
- [ ] Update prop types if needed

### 5. Test and Validate
- [ ] Check TypeScript compilation
- [ ] Verify visual appearance matches original
- [ ] Test responsive behavior
- [ ] Validate accessibility features
- [ ] Test all component variants and states

## Common Patterns Summary

1. **Use data attributes for state-based styling** instead of props
2. **Leverage CSS custom properties for dynamic values**
3. **Prefer container queries over media queries** for component responsiveness
4. **Always include focus management and accessibility features**
5. **Use design tokens consistently** throughout all styles
6. **Organize styles in cascade layers** for predictable specificity
7. **Keep selectors simple and performant**
8. **Maintain backward compatibility** with existing component APIs

This documentation should be updated as new patterns emerge during the migration process.