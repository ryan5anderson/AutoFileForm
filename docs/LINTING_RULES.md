# Enhanced Linting Rules for UI System Unification

This document outlines the enhanced linting rules that enforce the unified styling architecture using CSS Modules + Design Tokens + Cascade Layers.

## Stylelint Rules

### Architectural Enforcement Rules

#### 1. Raw Color Prevention
```json
"color-no-hex": [true, {
  "message": "Use design tokens (var(--color-*)) instead of raw hex colors"
}]
```
**Purpose**: Prevents raw hex colors like `#ff0000` and enforces use of design tokens like `var(--color-primary)`.

#### 2. Important Declaration Prevention
```json
"declaration-no-important": [true, {
  "severity": "error",
  "message": "Avoid !important declarations. Use CSS specificity and cascade layers instead"
}]
```
**Purpose**: Prevents `!important` usage and encourages proper CSS cascade and specificity management.

#### 3. Custom Media Query Enforcement
```json
"media-feature-name-no-unknown": [true, {
  "ignoreMediaFeatureNames": ["/^--bp-/", "/^--container-/"],
  "message": "Use custom media queries (--bp-*, --container-*) instead of raw breakpoint values"
}]
```
**Purpose**: Enforces use of custom media queries like `@media (--bp-md)` instead of raw pixel values.

#### 4. Logical Properties Enforcement
```json
"property-disallowed-list": [
  "margin-left", "margin-right", 
  "padding-left", "padding-right",
  "left", "right",
  "border-left", "border-right"
]
```
**Purpose**: Enforces logical properties (`margin-inline-start` instead of `margin-left`) for better internationalization.

#### 5. CSS Modules Naming Convention
```json
"selector-class-pattern": [
  "^[a-z][a-zA-Z0-9]*(__[a-z][a-zA-Z0-9]*)?(-{1,2}[a-z][a-zA-Z0-9]*)?$",
  {
    "message": "CSS Modules classes should use camelCase or BEM naming"
  }
]
```
**Purpose**: Enforces consistent naming for CSS Modules classes (camelCase or BEM style).

## ESLint Rules

### Inline Style Prevention

#### 1. Style Attribute Restriction
```json
"react/forbid-dom-props": [
  "error", 
  { 
    "forbid": [
      {
        "propName": "style",
        "message": "Use CSS Modules instead of inline styles. For dynamic styling, pass CSS custom properties through the style prop."
      }
    ]
  }
]
```
**Purpose**: Prevents inline styles except when passing CSS custom properties.

#### 2. CSS Custom Property Validation
```json
"no-restricted-syntax": [
  "error",
  {
    "selector": "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression > Property:not([key.name=/^--/])",
    "message": "Only CSS custom properties (--*) are allowed in inline styles."
  }
]
```
**Purpose**: Only allows CSS custom properties in inline styles, preventing static styling violations.

#### 3. Template Literal Prevention
```json
{
  "selector": "JSXAttribute[name.name='className'] > JSXExpressionContainer > TemplateLiteral",
  "message": "Use clsx() or classnames() utility for dynamic className construction instead of template literals."
}
```
**Purpose**: Encourages use of proper className utilities instead of template literals.

#### 4. Styled-Components Prevention
```json
{
  "selector": "ImportDeclaration[source.value='styled-components']",
  "message": "Use CSS Modules instead of styled-components for new components."
}
```
**Purpose**: Prevents new styled-components usage in favor of CSS Modules.

## Usage Examples

### ✅ Correct Usage

#### CSS Modules with Design Tokens
```css
/* Component.module.css */
.component {
  background: var(--color-bg);
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

@media (--bp-md) {
  .component {
    padding: var(--space-4);
  }
}
```

#### Dynamic Styling with CSS Custom Properties
```tsx
// Component.tsx
const Component: React.FC<{ gap?: string }> = ({ gap }) => (
  <div 
    className={styles.component}
    style={{ '--component-gap': gap } as React.CSSProperties}
  >
    Content
  </div>
);
```

#### Proper className Construction
```tsx
import clsx from 'clsx';

const Component = ({ variant, isActive }) => (
  <div className={clsx(
    styles.component,
    styles[`component--${variant}`],
    { [styles['component--active']]: isActive }
  )}>
    Content
  </div>
);
```

### ❌ Incorrect Usage

#### Raw Colors and Important Declarations
```css
/* ❌ This will fail linting */
.component {
  background: #ff0000; /* Use var(--color-primary) instead */
  color: blue !important; /* Remove !important */
}
```

#### Inline Styles
```tsx
// ❌ This will fail linting
<div style={{
  padding: '1rem',
  background: 'red',
  display: 'flex'
}}>
  Content
</div>

// ✅ Correct approach
<div 
  className={styles.component}
  style={{ '--component-padding': '1rem' } as React.CSSProperties}
>
  Content
</div>
```

#### Template Literal className
```tsx
// ❌ This will fail linting
<div className={`component ${variant} ${isActive ? 'active' : ''}`}>

// ✅ Correct approach
<div className={clsx('component', variant, { active: isActive })}>
```

## CI Integration

The linting rules are integrated into the CI pipeline through GitHub Actions:

```yaml
- name: Run ESLint
  run: npm run lint:js
  
- name: Run Stylelint
  run: npm run lint:css
```

Both linters are configured with `--max-warnings 0` to ensure zero tolerance for violations.

## Local Development

### Pre-commit Hooks
The project uses Husky pre-commit hooks to catch violations before they reach the repository:

```bash
# .husky/pre-commit
npm run lint
npx tsc --noEmit
```

### Available Scripts
```bash
# Run all linting
npm run lint

# Run specific linters
npm run lint:js
npm run lint:css

# Auto-fix where possible
npm run lint:fix
```

## Exceptions and Overrides

### Test Files
Test files are exempt from inline style restrictions:
```json
{
  "files": ["**/*.test.{js,jsx,ts,tsx}", "**/__tests__/**/*"],
  "rules": {
    "react/forbid-dom-props": "off",
    "react/forbid-component-props": "off",
    "no-restricted-syntax": "off"
  }
}
```

### Third-party Code
Third-party code in `src/third_party/` is exempt from architectural rules:
```json
{
  "files": ["src/third_party/**/*"],
  "rules": {
    "react/forbid-dom-props": "off",
    "react/forbid-component-props": "off",
    "no-restricted-syntax": "off"
  }
}
```

## Migration Support

For components being migrated from the old system, use the provided utility functions:

```tsx
import { createStyleProps, combineStyleProps } from '../utils/styleHelpers';

// Helper for safe dynamic styling
const dynamicStyles = createStyleProps({
  '--component-gap': gap,
  '--component-padding': padding
});
```

This ensures type safety and validation while maintaining compliance with the linting rules.