# Design Document: Responsive UI Rebuild

## Overview

This design outlines the comprehensive refactoring of the KIRO application from a desktop-first to a mobile-first, fluid, and accessible user interface. The rebuild will modernize the styling architecture while preserving existing functionality and KIRO branding.

### Current State Analysis

The application currently uses:
- React 19.1.0 with TypeScript
- React Router DOM for routing
- Custom CSS with CSS custom properties (tokens.css)
- Component-based UI architecture with existing Card, Field, and ButtonIcon components
- Fixed header with hamburger menu (partially responsive)
- Global sidebar with category navigation

### Target Architecture

The new architecture will implement:
- **CSS Modules** for page and feature-specific styles
- **styled-components** for reusable UI primitives and component variants
- **Enhanced design tokens** with fluid typography and spacing
- **Responsive mixins** for consistent media queries and utilities
- **Container queries** for context-aware component styling
- **Semantic token system** for brand consistency across components
- **Z-index layering scale** for predictable stacking contexts
- **Strict inline styles policy** with automated enforcement

## Inline Styles Policy

### Prohibited Usage
React `style={{...}}` is **prohibited** for:
- Layout (display, position, flex, grid)
- Spacing (margin, padding, gap)
- Color (background, color, border-color)
- Typography (font-size, font-weight, line-height)
- Size (width, height, min-width, max-width)
- Positioning (top, left, right, bottom, z-index)

### Allowed Exceptions
1. **CSS custom property assignment**: `style={{ '--progress': pct + '%' }}` consumed by CSS
2. **Canvas/SVG attributes**: Properties that cannot be expressed via classes
3. **Third-party components**: Components that expose only a style hook (must be wrapped and migrated later)

### Migration Targets
- **Layout/spacing/color** → CSS Modules with design tokens
- **Reusable patterns** → styled-components primitives
- **Dynamic values** → CSS custom properties

### Enforcement
- **ESLint rule**: `react/forbid-dom-props` prevents style prop usage
- **Definition of Done**: ESLint passes with no style prop violations
- **CI gate**: Automated checks prevent inline styles in new code
- **Third-party wrappers**: Create wrapper components that map props to design tokens

```json
// .eslintrc.json
{
  "plugins": ["react"],
  "rules": {
    "react/forbid-dom-props": ["error", { "forbid": ["style"] }],
    "react/forbid-component-props": ["error", { "forbid": ["style"] }]
  },
  "overrides": [
    {
      "files": ["src/third_party/**/*"],
      "rules": {
        "react/forbid-dom-props": "off",
        "react/forbid-component-props": "off"
      }
    }
  ]
}
```

### Third-Party Component Wrappers

```typescript
// src/third_party/ChartWrapper.tsx
interface ChartWrapperProps {
  data: any[];
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ 
  data, 
  variant = 'primary', 
  size = 'md' 
}) => {
  const chartStyles = {
    '--chart-color': variant === 'primary' ? 'var(--color-primary)' : 'var(--color-text-muted)',
    '--chart-size': size === 'sm' ? '200px' : size === 'lg' ? '400px' : '300px'
  } as React.CSSProperties;
  
  return (
    <div className={styles.chartContainer}>
      <ThirdPartyChart 
        data={data}
        style={chartStyles} // Allowed in third_party directory
      />
    </div>
  );
};
```

### Migration Examples

**Inline → CSS Module:**
```typescript
// Before
<div style={{ display: 'grid', gridTemplateColumns: '300px 300px 1fr', gap: 20 }} />

// After
<div className={styles.grid} />

/* Component.module.css */
.grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}
```

**Inline → styled-component:**
```typescript
// Before
<button style={{ padding: '8px 12px', borderRadius: 8, background: '#fff' }} />

// After
const Button = styled.button`
  ${touchTarget}
  ${focusRing}
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
`;
```

**Dynamic value via CSS variable (allowed):**
```typescript
// Before
<div style={{ width: progress + '%' }} />

// After (allowed)
<div 
  style={{ ['--progress' as any]: `${progress}%` }} 
  className={styles.progress} 
/>

/* CSS */
.progress {
  width: var(--progress);
}
```

## Architecture

### File Structure

```
src/
├── styles/
│   ├── tokens.css              # Enhanced design tokens
│   ├── global.css              # Global styles and resets
│   ├── utilities.module.css    # Utility classes (CSS Modules)
│   └── mixins.ts              # styled-components mixins
├── ui/
│   ├── primitives.tsx         # Core styled-components primitives
│   └── components/            # Enhanced UI components
├── components/
│   └── [ComponentName]/
│       ├── ComponentName.tsx
│       └── ComponentName.module.css
└── app/
    └── [FeatureName]/
        ├── FeatureName.tsx
        └── FeatureName.module.css
```

### Design Token System

Enhanced token system with fluid scaling and semantic tokens:

```css
:root {
  /* Breakpoints */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  
  /* Fluid typography */
  --font-0: clamp(0.875rem, 1.6vw, 1rem);      /* Body text */
  --font-1: clamp(1rem, 2vw, 1.125rem);        /* Large body */
  --font-2: clamp(1.25rem, 2.4vw, 1.5rem);     /* H2 */
  --font-3: clamp(1.5rem, 3vw, 2rem);          /* H1 */
  
  /* Fluid spacing */
  --space-1: clamp(0.5rem, 1vw, 0.75rem);
  --space-2: clamp(0.75rem, 1.2vw, 1rem);
  --space-3: clamp(1rem, 1.6vw, 1.5rem);
  --space-4: clamp(1.25rem, 2vw, 2rem);
  
  /* Semantic color tokens */
  --color-bg: #ffffff;
  --color-bg-alt: #f8fafc;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-primary: #166534;
  --color-success: #059669;
  --color-danger: #dc2626;
  
  /* Elevation system */
  --elevation-1: 0 1px 3px rgba(0,0,0,.08), 0 6px 20px rgba(0,0,0,.06);
  --elevation-2: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);
  --elevation-3: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05);
  
  /* Radius scale */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  
  /* Motion tokens */
  --motion-fast: 150ms;
  --motion-normal: 250ms;
  --motion-slow: 350ms;
  
  /* Z-index layering scale */
  --z-dropdown: 700;
  --z-nav: 800;
  --z-overlay: 900;
  --z-modal: 1000;
  
  /* Container and layout */
  --container: 1280px;
  --safe-area-top: env(safe-area-inset-top, 0);
  --safe-area-bottom: env(safe-area-inset-bottom, 0);
  --safe-area-left: env(safe-area-inset-left, 0);
  --safe-area-right: env(safe-area-inset-right, 0);
}

@layer tokens {
  /* Custom media queries for CSS Modules */
  @custom-media --bp-sm (min-width: 640px);
  @custom-media --bp-md (min-width: 768px);
  @custom-media --bp-lg (min-width: 1024px);
  @custom-media --bp-xl (min-width: 1280px);
}

/* Dark mode theme */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0b0f14;
    --color-bg-alt: #0f151c;
    --color-text: #e6edf3;
    --color-text-muted: #8b949e;
    --color-border: #2b3440;
    --elevation-1: 0 1px 3px rgba(0,0,0,.6), 0 10px 30px rgba(0,0,0,.4);
    --elevation-2: 0 4px 6px -1px rgba(0,0,0,.7), 0 2px 4px -1px rgba(0,0,0,.5);
    --elevation-3: 0 10px 15px -3px rgba(0,0,0,.8), 0 4px 6px -2px rgba(0,0,0,.6);
  }
}

/* Accessibility preferences */
@media (prefers-contrast: more) {
  :root {
    --color-border: #000;
  }
  
  .focus-ring {
    outline-width: 3px;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .frosted {
    backdrop-filter: none;
    background: var(--color-bg);
  }
}

/* Windows High Contrast Mode */
@media (forced-colors: active) {
  * {
    outline-color: CanvasText;
  }
  
  .focus-ring {
    outline: 2px solid;
  }
  
  /* Only disable forced-color-adjust for specific decorative elements */
  .logo-icon,
  .decorative-badge {
    forced-color-adjust: none;
  }
}
```

### Responsive Mixin System

TypeScript mixins for styled-components:

```typescript
// src/styles/mixins.ts
import { css } from "styled-components";

export const mq = {
  sm: (literals: any, ...args: any[]) => 
    css`@media (min-width: 640px) { ${css(literals, ...args)} }`,
  md: (literals: any, ...args: any[]) => 
    css`@media (min-width: 768px) { ${css(literals, ...args)} }`,
  lg: (literals: any, ...args: any[]) => 
    css`@media (min-width: 1024px) { ${css(literals, ...args)} }`,
  xl: (literals: any, ...args: any[]) => 
    css`@media (min-width: 1280px) { ${css(literals, ...args)} }`,
};

export const container = css`
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--space-2);
`;

export const focusRing = css`
  outline: 2px solid currentColor;
  outline-offset: 2px;
`;

export const touchTarget = css`
  min-height: 44px;
  min-width: 44px;
`;
```

## Components and Interfaces

### Core Primitives (styled-components)

**Layout Primitives:**
```typescript
// src/ui/primitives.tsx
export const Page = styled.main`
  padding-top: calc(64px + var(--safe-area-top));
  padding-bottom: var(--safe-area-bottom);
  min-height: 100vh;
`;

export const Container = styled.div`
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--space-2);
`;

export const GridAuto = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: 1fr;
  
  ${mq.sm`grid-template-columns: repeat(2, 1fr);`}
  ${mq.lg`grid-template-columns: repeat(3, 1fr);`}
`;

export const Card = styled.section`
  container-type: inline-size;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--elevation-1);
  padding: var(--space-3);
`;
```

**Interactive Primitives:**
```typescript
export const Button = styled.button`
  ${touchTarget}
  ${focusRing}
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  cursor: pointer;
  
  ${mq.md`padding: 0.625rem 1rem;`}
  
  &:hover {
    background: var(--color-bg-alt);
  }
`;
```

### Enhanced Header Component

Mobile-first responsive header with proper ARIA support:

**Sidebar Behavior:**
- **≤ md breakpoint**: Global sidebar converts to off-canvas with focus trapping and `aria-modal="true"`
- **≥ md breakpoint**: Sidebar remains docked and visible

**Forms on Mobile:**
- Input types and `inputmode` attributes for optimal keyboards
- Label placement that doesn't interfere with content
- Error text that wraps properly without breaking layout
- Sticky submit bars for long forms with proper scroll-into-view behavior
- Tap targets that don't get hidden behind sticky header

```typescript
// src/app/layout/Header/Header.tsx
interface HeaderProps {
  onMenuToggle?: (triggerRef: RefObject<HTMLElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev);
    onMenuToggle?.(menuButtonRef);
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  };
  
  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMenuOpen]);
  
  return (
    <HeaderContainer>
      <HeaderInner>
        <Brand href="/">KIRO</Brand>
        
        <MenuButton
          ref={menuButtonRef}
          aria-expanded={isMenuOpen}
          aria-controls="main-nav"
          onClick={handleMenuToggle}
          className="header-button"
        >
          <span className="visually-hidden">Menu</span>
          ☰
        </MenuButton>
        
        <Navigation 
          id="main-nav" 
          isOpen={isMenuOpen}
          role="navigation"
          aria-label="Main navigation"
        >
          <NavLink href="/about">About</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </Navigation>
      </HeaderInner>
    </HeaderContainer>
  );
};
```

### Responsive Card Grid System

Container query-aware card components:

```typescript
// src/components/CardGrid/CardGrid.tsx
const CardGrid = styled.div`
  container-type: inline-size;
  container-name: card-grid;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  
  @container card-grid (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

// Sidebar.module.css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
  /* other sidebar styles */
}

// Header.module.css  
.header {
  container-type: inline-size;
  container-name: header;
  /* other header styles */
}

const ResponsiveCard = styled(Card)`
  @container (max-width: 300px) {
    .card-image {
      width: 100px;
      height: 100px;
    }
    
    .card-title {
      font-size: var(--font-0);
    }
  }
`;
```

### Responsive Table Component

Mobile-first table with stacking pattern and proper accessibility:

```typescript
// src/components/DataTable/DataTable.tsx
interface DataTableProps {
  headers: string[];
  rows: Array<Record<string, React.ReactNode>>;
  stackOnMobile?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ headers, rows, stackOnMobile = true }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={`${styles.table} ${stackOnMobile ? styles.tableStack : styles.tableResponsive}`}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} id={`col-${index}`} scope="col">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, cellIndex) => (
                <td 
                  key={cellIndex}
                  data-label={header}
                  headers={`col-${cellIndex}`}
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

```css
/* src/components/DataTable/DataTable.module.css */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-responsive th,
.table-responsive td {
  min-width: 44px; /* Touch target minimum */
  min-height: 44px;
}

@media (max-width: 767px) {
  .table-stack {
    display: block;
  }
  
  .table-stack thead {
    display: none;
  }
  
  .table-stack tbody,
  .table-stack tr,
  .table-stack td {
    display: block;
  }
  
  .table-stack tr {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-2);
    padding: var(--space-2);
  }
  
  .table-stack td {
    border: none;
    padding: var(--space-1) 0;
  }
  
  .table-stack td::before {
    content: attr(data-label) ": ";
    font-weight: 600;
    margin-inline-end: var(--space-1);
  }
}
```

## Data Models

### Responsive Breakpoint Context

```typescript
// src/contexts/BreakpointContext.tsx
interface BreakpointContextValue {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: 'sm' | 'md' | 'lg' | 'xl';
}

export const useBreakpoint = (): BreakpointContextValue => {
  const [breakpoint, setBreakpoint] = useState<string>('sm');
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mqs = {
      xl: window.matchMedia('(min-width: 1280px)'),
      lg: window.matchMedia('(min-width: 1024px)'),
      md: window.matchMedia('(min-width: 768px)'),
    };
    
    const setFromMQ = () => {
      if (mqs.xl.matches) setBreakpoint('xl');
      else if (mqs.lg.matches) setBreakpoint('lg');
      else if (mqs.md.matches) setBreakpoint('md');
      else setBreakpoint('sm');
    };
    
    setFromMQ();
    Object.values(mqs).forEach(mq => mq.addEventListener('change', setFromMQ));
    return () => Object.values(mqs).forEach(mq => mq.removeEventListener('change', setFromMQ));
  }, []);
  
  return {
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl'].includes(breakpoint),
    currentBreakpoint: breakpoint as any
  };
};
```

### Image Optimization Interface

```typescript
// src/types/media.ts
interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  isHero?: boolean;
}

// src/components/ResponsiveImage/ResponsiveImage.tsx
import styled from "styled-components";

const Img = styled.img<{
  $aspectRatio?: string;
  $objectFit?: React.CSSProperties["objectFit"];
}>`
  max-width: 100%;
  height: auto;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio ?? "auto"};
  object-fit: ${({ $objectFit }) => $objectFit ?? "cover"};
`;

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes,
  srcSet,
  loading = 'lazy',
  fetchPriority,
  aspectRatio,
  objectFit = 'cover',
  isHero = false
}) => (
  <Img
    src={src}
    alt={alt}
    loading={loading}
    decoding="async"
    fetchPriority={isHero ? 'high' : fetchPriority ?? 'auto'}
    srcSet={srcSet}
    sizes={sizes}
    $aspectRatio={aspectRatio}
    $objectFit={objectFit}
  />
);

interface MediaQueryConfig {
  breakpoint: string;
  columns: number;
  gap: string;
}
```

## Error Handling

### Responsive Layout Error Boundaries

```typescript
// src/components/ErrorBoundary/ResponsiveErrorBoundary.tsx
class ResponsiveErrorBoundary extends Component<Props, State> {
  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorCard>
            <ErrorTitle>Something went wrong</ErrorTitle>
            <ErrorMessage>
              The page layout encountered an error. Please refresh to try again.
            </ErrorMessage>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </ErrorCard>
        </ErrorContainer>
      );
    }
    
    return this.props.children;
  }
}
```

### Font Fallback Strategy

```css
/* src/styles/global.css */
@layer reset, tokens, base, components, utilities;

@layer base {
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Inter, Arial, sans-serif;
  }
}

/* For any custom webfonts (if needed) */
@font-face {
  font-family: 'CustomFont';
  src: url('./fonts/custom-font.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
}

/* Layout stability */
:root {
  --header-h: 64px;
}

header {
  min-block-size: var(--header-h);
}

@layer utilities {
  /* Global utilities */
  .visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  /* Skip link */
  .skip-link {
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

  .skip-link:focus {
    left: var(--space-2);
    top: var(--space-2);
  }

  /* Touch targets for interactive elements */
  .header-button,
  .close-button {
    min-inline-size: 44px;
    min-block-size: 44px;
  }
  
  /* Form error region */
  .isHidden {
    display: none;
  }

  /* RTL icon mirroring */
  [dir="rtl"] .rtl-mirror {
    transform: scaleX(-1);
  }

  /* Scroll margin for anchor targets */
  [id] {
    scroll-margin-top: calc(var(--header-h) + var(--safe-area-top) + var(--space-2));
  }

  /* Reduced data preferences */
  @media (prefers-reduced-data: reduce) {
    .auto-playing-video,
    .background-video {
      display: none;
    }
    
    .hero-image {
      background-image: none;
    }
  }
}
```

### Graceful Degradation Patterns

```typescript
// src/hooks/useProgressiveEnhancement.ts
export const useProgressiveEnhancement = () => {
  const [supportsContainerQueries] = useState(() => 
    CSS.supports('container-type: inline-size')
  );
  
  const [supportsClamp] = useState(() => 
    CSS.supports('font-size: clamp(1rem, 2vw, 1.5rem)')
  );
  
  return {
    supportsContainerQueries,
    supportsClamp,
    shouldUseFluidType: supportsClamp,
    shouldUseContainerQueries: supportsContainerQueries
  };
};
```

## Testing Strategy

### Responsive Testing Framework

```typescript
// src/utils/testing/responsive.ts
export const breakpointTests = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  wide: { width: 1440, height: 900 }
};

// Use React Testing Library instead of Enzyme for React 19 compatibility
export const testResponsiveComponent = async (
  page: Page,
  breakpoints: Array<keyof typeof breakpointTests>
) => {
  for (const bp of breakpoints) {
    const { width, height } = breakpointTests[bp];
    
    // Set viewport size
    await page.setViewportSize({ width, height });
    
    // Wait for layout to settle
    await page.waitForTimeout(100);
    
    // Test assertions for this breakpoint
    const element = await page.locator('[data-testid="responsive-element"]');
    const display = await element.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('grid');
  }
};
```

### Accessibility Testing Integration

```typescript
// src/utils/testing/a11y.ts
export const a11yTests = {
  async testFocusManagement(page: Page) {
    // Test skip link
    await page.keyboard.press('Tab');
    const skipLink = await page.$('[href="#main"]');
    expect(await skipLink?.isVisible()).toBe(true);
    
    // Test hamburger menu focus
    await page.click('[aria-controls="main-nav"]');
    const firstNavLink = await page.$('#main-nav a:first-child');
    expect(await firstNavLink?.evaluate(el => el === document.activeElement)).toBe(true);
  },
  
  async testTouchTargets(page: Page) {
    const buttons = await page.$$('button, a, [role="button"]');
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  }
};
```

### Performance Testing

```typescript
// src/utils/testing/performance.ts
export const performanceTests = {
  async measureCLS(page: Page): Promise<number> {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => resolve(clsValue), 5000);
      });
    });
  },
  
  async measureLCP(page: Page): Promise<number> {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
    });
  },
  
  async measureWebVitals(page: Page): Promise<{lcp: number, cls: number, inp: number}> {
    // Inject web-vitals from node_modules for offline CI compatibility
    await page.addScriptTag({ path: require.resolve('web-vitals/dist/web-vitals.iife.js') });
    
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = { lcp: 0, cls: 0, inp: 0 };
        let resolved = false;
        
        // @ts-ignore
        webVitals.onLCP((metric) => { vitals.lcp = metric.value; });
        // @ts-ignore
        webVitals.onCLS((metric) => { vitals.cls = metric.value; });
        // @ts-ignore
        webVitals.onINP((metric) => { vitals.inp = metric.value; });
        
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(vitals);
          }
        }, 5000);
      });
    });
  },
  
  async testNoHorizontalScroll(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
      return document.documentElement.scrollWidth === document.documentElement.clientWidth;
    });
  }
};
```

### CI Gates and Quality Assurance

```typescript
// src/utils/testing/ci-gates.ts
export const ciGates = {
  // ESLint enforcement for inline styles
  async lintCheck(): Promise<void> {
    // Enforced via react/forbid-dom-props rule
    // Fails build on any style prop usage outside whitelisted directories
  },
  
  // Responsive layout validation
  async validateResponsiveLayouts(page: Page): Promise<void> {
    const breakpoints = [360, 768, 1024, 1280];
    
    for (const width of breakpoints) {
      await page.setViewportSize({ width, height: 800 });
      
      // Test no horizontal scroll
      const hasHorizontalScroll = await performanceTests.testNoHorizontalScroll(page);
      expect(hasHorizontalScroll).toBe(true);
      
      // Test touch targets on mobile
      if (width <= 768) {
        await a11yTests.testTouchTargets(page);
      }
    }
  },
  
  // Performance budget enforcement
  async enforcePerformanceBudgets(page: Page): Promise<void> {
    const cls = await performanceTests.measureCLS(page);
    const lcp = await performanceTests.measureLCP(page);
    
    expect(cls).toBeLessThanOrEqual(0.1);
    expect(lcp).toBeLessThanOrEqual(2500); // 2.5s
  },
  
  // Accessibility gate
  async enforceAccessibility(page: Page): Promise<void> {
    // Inject axe-core
    await page.addScriptTag({ path: require.resolve('axe-core') });
    
    // Wait for fonts to settle for stable snapshots
    await page.evaluateHandle('document.fonts.ready');
    
    const axeResults = await page.evaluate(() => {
      // @ts-ignore
      return axe.run();
    });
    
    const criticalViolations = axeResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations).toHaveLength(0);
  }
};
```

## Implementation Phases

### Phase 1: Foundation (Requirements 1-2, 5)
- Set up enhanced design tokens with fluid typography
- Create responsive mixin system
- Implement CSS Modules structure
- Add styled-components primitives

### Phase 2: Navigation & Layout (Requirements 3-4)
- Refactor Header component with proper ARIA
- Implement responsive navigation patterns
- Add skip links and focus management
- Create responsive layout primitives

### Phase 3: Component Migration (Requirement 6)
- Convert existing Card components to responsive patterns
- Implement container queries for adaptive components
- Create responsive table patterns
- Add responsive image components

### Phase 4: Performance & Accessibility (Requirements 7-9)
- Implement performance optimizations
- Add comprehensive accessibility features
- Test across device matrix
- Implement RTL support where needed

### Phase 5: Testing & Validation
- Set up responsive testing framework
- Implement accessibility testing
- Performance monitoring setup
- Cross-browser validation

### App-Level Structure with Skip Link

```typescript
// src/index.tsx - Updated AppShell
function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [sidebarTriggerRef, setSidebarTriggerRef] = React.useState<RefObject<HTMLElement> | null>(null);
  
  // Handle inert with fallback for older browsers
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;
    setInert(main, isSidebarOpen);
  }, [isSidebarOpen]);
  
  return (
    <>
      {/* Global skip link - first focusable element */}
      <a className="skip-link" href="#main">Skip to content</a>
      
      <Header onMenuToggle={(triggerRef) => {
        setIsSidebarOpen(prev => !prev);
        setSidebarTriggerRef(triggerRef);
      }} />
      
      {/* Sidebar with proper modal semantics */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        triggerRef={sidebarTriggerRef}
      />
      
      <main id="main" className={styles.main}>
        <Routes>
          {/* Route content */}
        </Routes>
      </main>
    </>
  );
}
```

### Sidebar Component with Modal Semantics

```typescript
// src/components/Sidebar/Sidebar.tsx
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  triggerRef?: RefObject<HTMLElement>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children, triggerRef }) => {
  const asideRef = useRef<HTMLElement>(null);
  const firstFocusableRef = useRef<HTMLElement>(null);
  
  // Body scroll lock
  useBodyScrollLock(isOpen);
  
  // Focus trap
  useFocusTrap(isOpen, asideRef);
  
  // Focus management
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);
  
  // Escape handling with focus return
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      triggerRef?.current?.focus();
    }
  };
  
  const handleClose = () => {
    onClose();
    triggerRef?.current?.focus();
  };
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <aside
      ref={asideRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sidebar-title"
      className={styles.sidebar}
    >
      <div role="document">
        <h2 id="sidebar-title" className="visually-hidden">Site menu</h2>
        
        <nav aria-label="Main navigation">
          <a 
            ref={firstFocusableRef}
            href="/about"
            onClick={onClose}
          >
            About
          </a>
          <a href="/contact" onClick={onClose}>Contact</a>
        </nav>
        
        <button 
          onClick={handleClose}
          aria-label="Close menu"
          className="close-button"
        >
          ×
        </button>
        
        {children}
      </div>
    </aside>
  );
};
```

### Focus Management Utilities

```typescript
// src/utils/inert.ts
export function setInert(el: HTMLElement, inert: boolean) {
  const supportsInert = 'inert' in HTMLElement.prototype;
  if (supportsInert) {
    // @ts-ignore
    el.inert = inert;
  } else {
    el.setAttribute('aria-hidden', inert ? 'true' : 'false');
    
    // Store and restore original tabindex
    const originalTabindex = el.getAttribute('data-original-tabindex');
    if (inert) {
      const currentTabindex = el.getAttribute('tabindex');
      if (currentTabindex !== null) {
        el.setAttribute('data-original-tabindex', currentTabindex);
      }
      el.setAttribute('tabindex', '-1');
    } else {
      if (originalTabindex !== null) {
        el.setAttribute('tabindex', originalTabindex);
        el.removeAttribute('data-original-tabindex');
      } else {
        el.removeAttribute('tabindex');
      }
    }
  }
}

// src/hooks/useFocusTrap.ts
export const useFocusTrap = (isActive: boolean, containerRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive, containerRef]);
};

// src/hooks/useBodyScrollLock.ts
export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isLocked]);
};
```

### Additional Configuration Files

```javascript
// stylelint.config.js (optional - for RTL proofing)
module.exports = {
  plugins: ["stylelint-use-logical"],
  rules: {
    "plugin/use-logical": [
      true, 
      { 
        "properties": "except-border-radius",
        "except": [
          "border-radius",
          "border-top-left-radius",
          "border-top-right-radius", 
          "border-bottom-left-radius",
          "border-bottom-right-radius"
        ]
      }
    ]
  }
};
```

```javascript
// postcss.config.js (required for @custom-media support)
module.exports = {
  plugins: [
    require('postcss-custom-media'),
    require('autoprefixer'),
  ]
};
```

```json
// package.json - Add web-vitals as devDependency for CI
{
  "devDependencies": {
    "web-vitals": "^3.0.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.40.0"
  }
}
```

### Form Error Handling Pattern

```typescript
// src/components/FormErrorRegion/FormErrorRegion.tsx
interface FormErrorRegionProps {
  errors: string[];
  isVisible: boolean;
}

const FormErrorRegion: React.FC<FormErrorRegionProps> = ({ errors, isVisible }) => {
  const hasErrors = errors.length > 0;
  const shouldShow = isVisible && hasErrors;
  
  return (
    <div 
      className={clsx(styles.errorRegion, !shouldShow && styles.isHidden)}
    >
      {hasErrors && (
        <div role="alert">
          <h3>Please correct the following errors:</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Field-level errors use aria-live="polite"
const FieldError: React.FC<{ error: string }> = ({ error }) => (
  <div 
    className="field__error" 
    aria-live="polite"
    role="alert"
  >
    {error}
  </div>
);

// Usage in forms
const MyForm = () => {
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  
  return (
    <form>
      <FormErrorRegion errors={errors} isVisible={showErrors} />
      
      <Field 
        label="Email"
        error={fieldErrors.email}
        aria-describedby={fieldErrors.email ? "email-error" : undefined}
      >
        <Field.Input 
          type="email" 
          aria-invalid={!!fieldErrors.email}
        />
      </Field>
    </form>
  );
};
```

### Final Merge Checklist

**Accessibility & Modal Behavior:**
- ✅ `nav` has no `aria-modal`; mobile sidebar has `role="dialog"` + focus trap + body scroll lock
- ✅ Background region `inert` + fallback (`aria-hidden`/`tabindex`) applied
- ✅ Focus trap implemented with Tab/Shift+Tab cycling in sidebar
- ✅ Escape key closes modal and returns focus to trigger

**Layout & Styling:**
- ✅ Every `@container` rule has ancestor with `container-type: inline-size`
- ✅ Header height reserved (`--header-h`) to prevent layout jank
- ✅ Logical properties used in primitives (margin-inline, padding-block)
- ✅ Tokens used consistently (`--elevation-*`, not `--shadow-*`)

**Data & Tables:**
- ✅ DataTable associates cells via `headers` attribute; `data-label` present for stacked view
- ✅ Touch targets ≥44px maintained in responsive table mode

**Code Quality:**
- ✅ ESLint rules (`forbid-dom-props` + `forbid-component-props`) enabled in CI
- ✅ Third-party override in place for style prop exceptions
- ✅ `.visually-hidden` + `.skip-link` shipped globally; skip link precedes header

**Performance & Images:**
- ✅ `useBreakpoint` uses `matchMedia` and guards SSR
- ✅ One hero image per route may use `fetchpriority="high"`; others default to `auto`
- ✅ `prefers-reduced-data` support for non-critical media

**Browser Support:**
- ✅ Inert fallback for older browsers using `aria-hidden` + `tabindex`
- ✅ Container query progressive enhancement patterns
- ✅ Custom media queries available for CSS Modules
- ✅ High contrast and reduced transparency preferences supported

**SSR Considerations (if applicable):**
- ✅ styled-components StyleSheetManager configured for consistent classnames
- ✅ Font loading stability with `document.fonts.ready` in tests

**Build & Tooling:**
- ✅ PostCSS configured with `postcss-custom-media` for @custom-media support
- ✅ Cascade layers defined for predictable style ordering
- ✅ Web Vitals integration for accurate performance measurement
- ✅ Form error handling with aria-live regions

### PR Review Template

**Responsive UI Checklist:**
- [ ] Inline styles introduced? (Yes/No - if yes, path must be under `src/third_party/`)
- [ ] Dynamic values use CSS vars, not inline styles? (Yes/No)
- [ ] Container queries have proper `container-type` ancestors? (Yes/No)
- [ ] Touch targets ≥44px on mobile? (Yes/No)
- [ ] Focus management tested with keyboard navigation? (Yes/No)
- [ ] Tested across breakpoints [360, 768, 1024, 1280]? (Yes/No)
- [ ] No horizontal scroll on any breakpoint? (Yes/No)
- [ ] Accessibility violations checked with axe? (Yes/No)

This design provides a comprehensive, production-ready foundation for transforming the KIRO application into a modern, responsive, and accessible web application while maintaining existing functionality and branding.