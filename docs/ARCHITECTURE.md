# System Architecture Overview

## Technology Stack

**Frontend Framework:** React 19.1.0 with TypeScript 4.9.5
**Routing:** React Router DOM 7.7.0
**State Management:** React useState (Zustand available but unused)
**Email Service:** EmailJS
**Styling:** CSS Custom Properties (CSS Variables)
**Build Tool:** Create React App
**Deployment:** GitHub Pages

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   URL Router    │───▶│  OrderFormPage  │───▶│   Form Pages    │
│  /:college      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  useOrderForm   │
                       │     Hook        │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Form State    │───▶│  Email Service  │
                       │                 │    │                 │
                       └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. OrderFormPage (Main Container)
- **Location:** `src/components/OrderFormPage.tsx`
- **Purpose:** Top-level component that handles routing and page state
- **Responsibilities:**
  - College-specific configuration loading
  - Dynamic theming based on college
  - Page state management (form/summary/receipt/thankyou)
  - Hook integration

### 2. useOrderForm Hook
- **Location:** `src/hooks/useOrderForm.ts`
- **Purpose:** Centralized state management and business logic
- **State Structure:**
  ```typescript
  interface FormData {
    company: string;
    storeNumber: string;
    storeManager: string;
    date: string;
    orderNotes: string;
    quantities: Record<string, string>;
    shirtVersions?: Record<string, ShirtVersion>;
    colorVersions?: Record<string, ColorVersion>;
    shirtColorComboVersions?: Record<string, ShirtColorComboVersion>;
    displayOptions?: Record<string, DisplayOption>;
    sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  }
  ```

### 3. Configuration System
- **Location:** `src/constants/colleges.ts`
- **Purpose:** Static configuration for different colleges
- **Structure:**
  ```typescript
  interface CollegeConfig {
    name: string;
    logo: string;
    categories: Category[];
  }
  ```

## Data Flow

### 1. Initialization Flow
```
URL Parameter → College Config → Theme Setup → Form State Initialization
```

### 2. Form Interaction Flow
```
User Input → Hook Handler → State Update → Component Re-render
```

### 3. Submission Flow
```
Form Validation → Summary Page → Email Generation → EmailJS → Receipt Page
```

## Routing Architecture

### Current Implementation
- **Single Route:** `/:college` with HashRouter
- **No Route Guards:** Invalid colleges show error message
- **No Nested Routes:** All pages handled by component state

### Issues
- No 404 handling for invalid colleges
- No route guards or validation
- Hardcoded college configurations

## State Management Architecture

### Current Approach
- **Pattern:** React useState with custom hook
- **Scope:** Component-level state with prop drilling
- **Persistence:** No persistence (state lost on refresh)

### State Structure Problems
1. **Overly Complex:** Multiple nested objects for different product types
2. **Redundant Patterns:** Similar state structures for different variations
3. **No Normalization:** Data not normalized for efficient updates
4. **Type Safety Issues:** String keys instead of proper union types

## Configuration Architecture

### College Configuration
- **Static Configuration:** Hardcoded in `colleges.ts`
- **Product Categories:** Each college has its own product catalog
- **Theming:** Dynamic CSS custom properties based on college

### Product Configuration
- **Image-based:** Products defined by image files
- **Variation Support:** Multiple variation types per product
- **SKU Extraction:** SKUs extracted from image filenames

## Email System Architecture

### Email Generation Flow
```
Form Data → Data Transformation → Template Parameters → EmailJS → Email Template
```

### Template System
- **Location:** `email_template.html`
- **Engine:** EmailJS template engine
- **Format:** HTML with handlebars-style syntax

### Data Transformation
- **Complex Logic:** `createEmailCategories()` in `utils/index.ts`
- **Product Variations:** Handles multiple variation types
- **Auto-added Items:** Automatically adds related products

## Styling Architecture

### CSS Custom Properties
- **Theme Variables:** College-specific colors and spacing
- **Dynamic Updates:** Runtime theme switching
- **Consistent Design:** Shared design tokens

### Component Styling
- **Inline Styles:** All styling done inline
- **No CSS-in-JS:** No styled-components or emotion
- **Responsive Design:** CSS Grid and Flexbox

## Deployment Architecture

### Build Process
- **Create React App:** Standard CRA build process
- **Static Assets:** Images served from public directory
- **Hash Router:** Compatible with static hosting

### Deployment
- **GitHub Pages:** Static hosting
- **Custom Domain:** `ohiopylecollege.com`
- **Branch Strategy:** `gh-pages` branch for deployment

## Performance Considerations

### Current Issues
1. **Large Bundle:** All college configurations loaded upfront
2. **Image Loading:** No lazy loading for product images
3. **State Updates:** Potential unnecessary re-renders
4. **Email Generation:** Complex synchronous processing

### Optimization Opportunities
1. **Code Splitting:** Split by college
2. **Image Optimization:** WebP format, lazy loading
3. **Memoization:** React.memo for expensive components
4. **Async Processing:** Web Workers for email generation

## Security Considerations

### Current State
- **No Authentication:** Public access to order forms
- **No Input Validation:** Minimal client-side validation
- **EmailJS Credentials:** Exposed in constants file

### Recommendations
1. **Input Sanitization:** Validate and sanitize all inputs
2. **Rate Limiting:** Prevent form spam
3. **Environment Variables:** Move sensitive data to env vars
4. **CSRF Protection:** Add CSRF tokens for form submission 