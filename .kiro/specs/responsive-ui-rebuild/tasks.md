# Implementation Plan

Convert the feature design into a series of prompts for a code-generation LLM that will implement each step in a test-driven manner. Prioritize best practices, incremental progress, and early testing, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

## Phase 1: Foundation Setup

- [x] 1. Set up enhanced design tokens and global styles




  - Update `src/styles/tokens.css` with fluid typography, spacing, semantic colors, elevation system, and z-index scale
  - Add cascade layers (`@layer reset, tokens, base, components, utilities`) to `src/styles/global.css`
  - Implement dark mode theme with `prefers-color-scheme: dark`
  - Add accessibility preferences (`prefers-contrast: more`, `prefers-reduced-transparency`, `forced-colors: active`)
  - Include custom media queries (`@custom-media --bp-sm`, etc.) for CSS Modules
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 4.1, 4.3, 9.4_

- [x] 1.1 Install and configure build dependencies


  - Add `styled-components`, `web-vitals`, `clsx` to package.json
  - Configure PostCSS with `postcss-custom-media` and `autoprefixer`
  - Set up ESLint rules for `react/forbid-dom-props` and `react/forbid-component-props`
  - Add stylelint configuration for logical properties enforcement
  - _Requirements: 5.1, 5.2, 5.4_



- [x] 1.2 Create responsive mixins and utilities
  - Implement `src/styles/mixins.ts` with media query helpers, focus ring, and touch target utilities
  - Create `src/utils/inert.ts` with proper tabindex preservation for older browser fallback
  - Add `src/hooks/useBreakpoint.ts` with SSR-safe matchMedia implementation
  - Create `src/hooks/useFocusTrap.ts` and `src/hooks/useBodyScrollLock.ts` for modal behavior
  - _Requirements: 2.3, 4.2, 4.4, 8.1, 8.5_

## Phase 2: Core Primitives and Layout

- [x] 2. Create styled-components primitives





  - Implement `src/ui/primitives.tsx` with Page, Container, GridAuto, Card, and Button primitives
  - Use logical properties (`margin-inline`, `padding-block`) and design tokens throughout
  - Add container queries with proper `container-type: inline-size` and named containers
  - Ensure all interactive elements meet 44px touch target requirements
  - _Requirements: 2.4, 4.2, 5.2, 6.6, 8.2, 9.4_

- [x] 2.1 Enhance existing UI components with responsive patterns


  - Update `src/components/ui/Card.tsx` to use design tokens and container queries
  - Enhance `src/components/ui/Field.tsx` with proper error handling and mobile-first styling
  - Create `src/components/ui/ResponsiveImage.tsx` with styled-components and fetchpriority logic
  - Add utility classes (`.visually-hidden`, `.skip-link`, `.header-button`, `.close-button`) to global styles
  - _Requirements: 1.4, 1.5, 4.2, 7.7, 7.8_



- [x] 2.2 Create responsive layout utilities


  - Implement `src/styles/utilities.module.css` with container, stack, cluster, and grid-auto classes
  - Add RTL support utilities (`.rtl-mirror`) and scroll margin classes
  - Create form error handling components with proper ARIA patterns
  - Implement CSS Modules patterns for page-level layouts
  - _Requirements: 5.1, 6.3, 9.1, 9.2, 9.4_

## Phase 3: Navigation and Header Refactor

- [x] 3. Refactor Header component with responsive navigation





  - Update `src/app/layout/Header.tsx` with mobile-first hamburger menu pattern
  - Implement proper ARIA attributes (`aria-expanded`, `aria-controls`) and keyboard navigation
  - Add focus management with Escape key handling and focus return to trigger
  - Ensure header uses design tokens and meets accessibility requirements
  - Wire up triggerRef passing for proper modal focus restoration
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.5_

- [x] 3.1 Create responsive Sidebar component with modal semantics


  - Implement `src/components/Sidebar/Sidebar.tsx` with proper `role="dialog"` and `aria-modal="true"`
  - Add focus trap using `useFocusTrap` hook and body scroll lock with `useBodyScrollLock`
  - Implement container queries with `container-name: sidebar` for adaptive styling
  - Add proper close button with `.close-button` class for touch targets
  - Handle Escape key and focus restoration to trigger element
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 4.4, 4.5, 5.6_

- [x] 3.2 Update AppShell with skip link and inert background


  - Add global skip link as first focusable element before header in `src/index.tsx`
  - Implement inert background using `setInert` utility when sidebar is open
  - Wire up Header and Sidebar with proper triggerRef passing for focus management
  - Ensure main content has proper scroll margin for anchor targets
  - _Requirements: 3.7, 4.4, 4.5_

## Phase 4: Responsive Content Components

- [x] 4. Create responsive card grid system





  - Implement responsive card grids using `repeat(auto-fit, minmax(16rem, 1fr))` pattern
  - Add container queries with `container-name: card-grid` for adaptive layouts
  - Update existing card components to use new responsive patterns
  - Ensure cards work properly in both narrow and wide contexts
  - _Requirements: 6.1, 6.4, 5.6_

- [x] 4.1 Implement responsive table component


  - Create `src/components/DataTable/DataTable.tsx` with mobile stacking pattern
  - Add proper header associations using `id` + `headers` attributes for accessibility
  - Implement horizontal scroll option with sticky headers and 44px touch targets
  - Use `data-label` attributes for mobile stacked view
  - Add CSS Modules styling with mobile-first responsive breakpoints
  - _Requirements: 6.2, 4.5_



- [x] 4.2 Create responsive form patterns


  - Implement form error region with `role="alert"` and proper ARIA live regions
  - Add field-level error handling with `aria-describedby` associations
  - Create mobile-optimized input patterns with proper `inputmode` attributes
  - Ensure form controls meet touch target requirements and work with sticky headers
  - _Requirements: 4.2, 4.5, 8.1_

## Phase 5: Performance and Accessibility

- [x] 5. Implement performance optimizations




  - Add responsive image loading with `loading="lazy"`, `decoding="async"`, and `srcset/sizes`
  - Implement `fetchpriority="high"` for exactly one LCP image per route
  - Add `prefers-reduced-data` support for non-critical media
  - Ensure animations use `opacity`/`transform` and respect `prefers-reduced-motion`
  - Add layout shift prevention with `aspect-ratio` and content reservations
  - _Requirements: 1.5, 7.1, 7.2, 7.4, 7.5, 7.6, 7.7, 7.9, 8.5_

- [x] 5.1 Add comprehensive accessibility features


  - Implement focus management for all interactive components
  - Add proper landmark structure (`header`, `nav`, `main`, `footer`)
  - Ensure color contrast meets WCAG 2.2 AA standards
  - Add support for Windows High Contrast mode with limited `forced-color-adjust`
  - Implement proper error announcements and screen reader support
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5.2 Set up responsive testing framework


  - Create `src/utils/testing/responsive.ts` with Playwright-based viewport testing
  - Implement `src/utils/testing/a11y.ts` with axe-core integration and focus management tests
  - Add `src/utils/testing/performance.ts` with Web Vitals measurement using local dependencies
  - Create CI gates for horizontal scroll detection, touch target validation, and accessibility
  - _Requirements: 7.1, 7.2, 7.3, 4.5_

## Phase 6: Integration and Quality Assurance

- [x] 6. Migrate existing components to new patterns




  - Update `src/components/CollegeSelector.tsx` to use responsive card grid patterns
  - Refactor form components to use new Field patterns and responsive layouts
  - Convert any remaining inline styles to CSS Modules or styled-components
  - Ensure all components use design tokens and logical properties
  - _Requirements: 5.1, 5.2, 5.3, 9.4_

- [x] 6.1 Implement comprehensive testing


  - Add responsive layout tests across all defined breakpoints (360px, 768px, 1024px, 1280px)
  - Test focus management and keyboard navigation for all interactive components
  - Validate touch targets meet 44px minimum on mobile devices
  - Run accessibility audits with axe-core and ensure no critical violations
  - Test performance budgets (LCP ≤ 2.5s, CLS ≤ 0.10, INP ≤ 200ms)
  - _Requirements: 7.1, 7.2, 7.3, 4.2, 4.4, 4.5_



- [ ] 6.2 Final integration and polish
  - Ensure all routes work properly with new responsive patterns
  - Test orientation changes and device rotation scenarios
  - Validate RTL support where implemented
  - Run final accessibility and performance audits
  - Update any remaining components to use consistent patterns
  - _Requirements: 8.3, 8.4, 9.1, 9.2, 9.3_