# CSS Modules Migration Guide

This guide provides step-by-step instructions for migrating components from styled-components to CSS Modules as part of the UI system unification.

## Quick Start

1. **Copy the templates**: Use `ComponentTemplate.tsx` and `ComponentTemplate.module.css` as starting points
2. **Follow the checklist**: Use the migration checklist below for each component
3. **Reference patterns**: Check `CSS_MODULE_PATTERNS.md` for specific patterns and examples
4. **Test thoroughly**: Ensure visual and functional parity with the original component

## Step-by-Step Migration Process

### Step 1: Analyze the Current Component

Before starting the migration, understand the current component:

```typescript
// Example: Analyzing a styled-component
const StyledButton = styled.button<{ $variant: string; $size: string }>`
  padding: ${props => props.$size === 'sm' ? '8px 12px' : '12px 16px'};
  background: ${props => props.$variant === 'primary' ? 'blue' : 'gray'};
  // ... more styles
`;
```

**Identify:**
- Props that affect styling (`$variant`, `$size`)
- Dynamic styles based on props
- Responsive behavior
- Interactive states (hover, focus, active)
- Accessibility features

### Step 2: Create the CSS Module

Create `ComponentName.module.css`:

```css
@layer components {
  .componentName {
    /* Base styles using design tokens */
    padding: var(--space-3);
    background: var(--color-bg);
    /* ... */
  }

  /* Variants */
  .componentName--primary {
    background: var(--color-primary);
  }

  .componentName--sm {
    padding: var(--space-2);
  }

  /* States */
  .componentName[data-active="true"] {
    /* active styles */
  }
}
```

### Step 3: Convert the TypeScript Component

```typescript
// Before: styled-components
import styled from 'styled-components';

const StyledButton = styled.button<{ $variant: string }>`
  background: ${props => props.$variant === 'primary' ? 'blue' : 'gray'};
`;

const Button = ({ variant, children }) => (
  <StyledButton $variant={variant}>
    {children}
  </StyledButton>
);

// After: CSS Modules
import styles from './Button.module.css';

const buildButtonClassName = (variant = 'default', className) => {
  const classes = [styles.button];
  if (variant !== 'default') {
    classes.push(styles[`button--${variant}`]);
  }
  if (className) {
    classes.push(className);
  }
  return classes.join(' ');
};

const Button = ({ variant = 'default', className, children, ...rest }) => (
  <button 
    className={buildButtonClassName(variant, className)}
    {...rest}
  >
    {children}
  </button>
);
```

### Step 4: Handle Dynamic Styling

For dynamic values, use CSS custom properties:

```typescript
// Component with dynamic styling
const DynamicComponent = ({ gap, padding, children }) => {
  const dynamicStyles = {
    '--component-gap': gap,
    '--component-padding': padding,
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
  padding: var(--component-padding, var(--space-3));
}
```

### Step 5: Convert Conditional Logic

Replace prop-based conditional styling with data attributes:

```typescript
// Before: Props-based styling
const StyledCard = styled.div<{ $active: boolean; $disabled: boolean }>`
  opacity: ${props => props.$disabled ? 0.5 : 1};
  border-color: ${props => props.$active ? 'blue' : 'gray'};
`;

// After: Data attributes
const Card = ({ active, disabled, children }) => (
  <div 
    className={styles.card}
    data-active={active}
    data-disabled={disabled}
  >
    {children}
  </div>
);
```

```css
.card {
  opacity: 1;
  border-color: var(--color-border);
}

.card[data-disabled="true"] {
  opacity: 0.5;
}

.card[data-active="true"] {
  border-color: var(--color-primary);
}
```

## Common Migration Patterns

### Pattern 1: Variant System

```typescript
// Before
const StyledComponent = styled.div<{ $variant: 'primary' | 'secondary' }>`
  ${({ $variant }) => $variant === 'primary' && `
    background: blue;
    color: white;
  `}
  ${({ $variant }) => $variant === 'secondary' && `
    background: gray;
    color: black;
  `}
`;

// After
const buildClassName = (variant = 'default') => {
  const classes = [styles.component];
  if (variant !== 'default') {
    classes.push(styles[`component--${variant}`]);
  }
  return classes.join(' ');
};
```

### Pattern 2: Size System

```typescript
// Before
const StyledComponent = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  padding: ${({ $size }) => {
    switch ($size) {
      case 'sm': return '8px';
      case 'lg': return '24px';
      default: return '16px';
    }
  }};
`;

// After
const buildClassName = (size = 'md') => {
  const classes = [styles.component];
  if (size !== 'md') {
    classes.push(styles[`component--${size}`]);
  }
  return classes.join(' ');
};
```

### Pattern 3: Responsive Behavior

```typescript
// Before: styled-components with media queries
const StyledComponent = styled.div`
  display: flex;
  flex-direction: column;
  
  ${mq.md`
    flex-direction: row;
  `}
`;

// After: CSS Modules with container queries (preferred)
```

```css
.component {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
}

@container (min-width: 768px) {
  .component {
    flex-direction: row;
  }
}

/* Fallback with media queries */
@media (--bp-md) {
  .component {
    flex-direction: row;
  }
}
```

### Pattern 4: Interactive States

```typescript
// Before
const StyledButton = styled.button`
  background: gray;
  
  &:hover {
    background: darkgray;
  }
  
  &:focus {
    outline: 2px solid blue;
  }
`;

// After: CSS Modules with proper focus management
```

```css
.button {
  background: var(--color-bg-alt);
}

.button:hover:not(:disabled) {
  background: var(--color-bg);
}

.button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (prefers-contrast: more) {
  .button:focus-visible {
    outline-width: 3px;
  }
}
```

## Migration Checklist

### Pre-Migration
- [ ] Identify all styled-components in the file
- [ ] List all props that affect styling
- [ ] Document current responsive behavior
- [ ] Note accessibility features (focus, ARIA attributes)
- [ ] Test current component functionality

### During Migration
- [ ] Create `.module.css` file with `@layer components`
- [ ] Use BEM naming convention
- [ ] Convert all styled-components to regular HTML elements
- [ ] Replace prop-based styling with data attributes
- [ ] Use CSS custom properties for dynamic values
- [ ] Add helper functions for className building
- [ ] Preserve all existing props and API
- [ ] Maintain accessibility features

### Post-Migration
- [ ] Check TypeScript compilation (no errors)
- [ ] Verify visual appearance matches original
- [ ] Test all component variants and states
- [ ] Test responsive behavior across breakpoints
- [ ] Validate accessibility (focus management, ARIA)
- [ ] Test keyboard navigation
- [ ] Check high contrast mode support
- [ ] Verify reduced motion preferences

## Common Pitfalls and Solutions

### Pitfall 1: Missing Focus States
**Problem**: Forgetting to add focus-visible styles
**Solution**: Always include focus management in interactive components

```css
.interactive:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

### Pitfall 2: Incorrect Data Attribute Usage
**Problem**: Using data attributes for styling that should be classes
**Solution**: Use classes for variants, data attributes for states

```css
/* Good: Variant as class */
.component--primary { }

/* Good: State as data attribute */
.component[data-active="true"] { }

/* Avoid: Variant as data attribute */
.component[data-variant="primary"] { }
```

### Pitfall 3: Not Using Design Tokens
**Problem**: Hard-coding values instead of using design tokens
**Solution**: Always use CSS custom properties from the design system

```css
/* Good */
.component {
  padding: var(--space-3);
  color: var(--color-text);
  border-radius: var(--radius-md);
}

/* Avoid */
.component {
  padding: 16px;
  color: #333;
  border-radius: 8px;
}
```

### Pitfall 4: Complex Selectors
**Problem**: Creating overly complex CSS selectors
**Solution**: Keep selectors simple and use single classes

```css
/* Good */
.component { }
.component--variant { }
.component[data-state="active"] { }

/* Avoid */
.component .nested .deep .selector { }
.component[data-state="active"][data-variant="primary"][data-size="large"] { }
```

## Testing Your Migration

### Visual Testing
1. Compare before/after screenshots
2. Test all component variants
3. Check responsive behavior
4. Verify dark mode (if applicable)
5. Test high contrast mode

### Functional Testing
1. Verify all props work as expected
2. Test keyboard navigation
3. Check screen reader compatibility
4. Validate ARIA attributes
5. Test focus management

### Performance Testing
1. Check CSS bundle size impact
2. Verify no layout shifts
3. Test animation performance
4. Check container query support

## Getting Help

- **Patterns**: Check `CSS_MODULE_PATTERNS.md` for specific patterns
- **Templates**: Use `ComponentTemplate.tsx` and `ComponentTemplate.module.css`
- **Examples**: Look at migrated `Card.tsx` and `FormField.tsx` components
- **Design Tokens**: Reference `src/styles/tokens.css` for available variables

## Best Practices Summary

1. **Always use design tokens** instead of hard-coded values
2. **Prefer container queries** over media queries for component responsiveness
3. **Use data attributes for states**, classes for variants
4. **Include proper focus management** for interactive components
5. **Test accessibility thoroughly** after migration
6. **Keep selectors simple** and performant
7. **Maintain backward compatibility** with existing component APIs
8. **Document any breaking changes** clearly