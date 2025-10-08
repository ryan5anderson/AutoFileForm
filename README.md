# AutoFileForm - College Merchandise Order System

A React-based order form system for college retail stores to create and submit product orders with complex product variations. The application has been refactored from a monolithic structure into a modular, feature-based architecture following modern React best practices.

## Features
- **Multi-college support**: Michigan State, Arizona State, and West Virginia University
- **Complex product variations**: Shirts with size packs, color options, display configurations
- **Smart validation**: Real-time validation with visual feedback for size pack requirements
- **Automatic email generation**: Professional order emails sent via EmailJS
- **Responsive design**: Mobile-first design with college-specific theming
- **Feature-based architecture**: Clean separation of concerns with modular code organization
- **Full TypeScript**: Complete type safety throughout the application
- **Modern React patterns**: Hooks, Context API, and functional components
- **Product detail pages**: Dedicated configuration interface for complex products

## Technology Stack
- **Frontend Framework**: React 19.1.0 with TypeScript 4.9.5
- **Routing**: React Router DOM 7.7.0 (HashRouter for GitHub Pages compatibility)
- **State Management**: React Context API with custom hooks
- **Email Service**: EmailJS 3.2.0
- **Styling**: CSS Custom Properties (CSS Variables) with responsive design
- **Build Tool**: Create React App 5.0.1
- **Testing Framework**: React Testing Library (configured, tests to be added)
- **Deployment**: GitHub Pages with custom domain support

## Development
- `npm start` - Development server
- `npm run build` - Production build
- `npm run deploy` - Deploy to GitHub Pages

## Documentation Structure
- `docs/ARCHITECTURE.md` - System architecture overview
- `docs/STATE_MANAGEMENT.md` - State management analysis
- `docs/COMPONENTS.md` - Component architecture and patterns
- `docs/EMAIL_SYSTEM.md` - Email generation and sending
- `docs/ISSUES.md` - Code quality issues and improvements
- `docs/REFACTORING.md` - Recommended refactoring strategies
- `UNUSED_CODE_ANALYSIS.md` - Detailed analysis of unused code and dependencies (see below)

## Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AutoFileForm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000/` to select your college
   - The app uses HashRouter, so routes will be like `http://localhost:3000/#/michiganstate`

## URL Structure

The application uses HashRouter for GitHub Pages compatibility:

- **College Selection**: `/#/`
- **Order Form**: `/#/michiganstate` or `/#/arizonastate` or `/#/westvirginiauniversity`
- **Product Detail**: `/#/michiganstate/product/:category/:productId`
- **Order Summary**: `/#/michiganstate/summary`
- **Order Receipt**: `/#/michiganstate/receipt`
- **Thank You**: `/#/michiganstate/thankyou`
- **About Page**: `/#/about`
- **Contact Page**: `/#/contact`

### Supported Colleges
1. **Michigan State** (`michiganstate`)
2. **Arizona State** (`arizonastate`)
3. **West Virginia University** (`westvirginiauniversity`)

## Project Structure

The project follows a feature-based architecture that promotes maintainability and scalability:

```
src/
├── app/                      # Application shell and routing
│   ├── layout/               # Layout components
│   │   ├── Header.tsx        # App header with navigation
│   │   ├── Footer.tsx        # App footer
│   │   └── CollapsibleSidebar.tsx  # Category navigation sidebar
│   └── routes/               # Route/page components
│       ├── form.tsx          # Main order form page
│       ├── productDetail.tsx # Individual product configuration
│       ├── summary.tsx       # Order review before submission
│       ├── receipt.tsx       # Post-submission order receipt
│       ├── thankyou.tsx      # Confirmation page
│       ├── about.tsx         # About page
│       └── contact.tsx       # Contact page
│
├── components/               # Shared components
│   ├── ui/                   # Reusable UI primitives
│   │   ├── Card.tsx          # Card container component
│   │   ├── Field.tsx         # Form field component
│   │   └── ButtonIcon.tsx    # Icon button component
│   ├── CollegeSelector.tsx   # College selection landing page
│   ├── CollegeRouteWrapper.tsx  # Wrapper for college-specific routes
│   ├── OrderFormPage.tsx     # Order form page wrapper
│   └── ProductDetailPageWrapper.tsx  # Product detail wrapper
│
├── config/                   # Configuration files
│   ├── colleges/             # College-specific JSON configurations
│   │   ├── michiganState.json
│   │   ├── arizonaState.json
│   │   └── westVirginiaUniversity.json
│   └── index.ts              # Configuration loader and types
│
├── contexts/                 # React contexts
│   └── OrderFormContext.tsx  # Global order form state context
│
├── features/                 # Feature-based modules
│   ├── components/           # Feature-specific components
│   │   ├── panels/           # Product configuration panels
│   │   │   ├── ColorVersionPanel.tsx
│   │   │   ├── DisplayOptionsPanel.tsx
│   │   │   ├── QuantityPanel.tsx
│   │   │   ├── QuantityStepper.tsx
│   │   │   ├── ShirtColorPanel.tsx
│   │   │   ├── ShirtVersionPanel.tsx
│   │   │   └── SizePackSelector.tsx
│   │   ├── CategorySection.tsx
│   │   ├── OrderNotesSection.tsx
│   │   ├── OrderSummaryCard.tsx
│   │   └── StoreInfoForm.tsx
│   ├── hooks/                # Custom hooks
│   │   └── useOrderForm.ts   # Main order form state management
│   └── utils/                # Feature-specific utilities
│       ├── calculations.ts   # Quantity calculations and validation
│       ├── emailTemplate.ts  # Email template generation
│       ├── imagePath.ts      # Image path utilities
│       └── naming.ts         # Product naming utilities
│
├── services/                 # External service integrations
│   ├── emailService.ts       # EmailJS integration
│   └── templates/            # Email templates
│       └── email_template.html
│
├── types/                    # TypeScript type definitions
│   └── index.ts              # All application types
│
├── utils/                    # Shared utility functions
│   ├── asset.ts              # Asset path resolution
│   ├── format.ts             # Formatting utilities
│   └── guard.ts              # Type guard utilities
│
├── styles/                   # CSS styling
│   ├── tokens.css            # Design tokens and CSS variables
│   ├── components.css        # Component styles
│   ├── global.css            # Global styles
│   ├── college-pages.css     # College page styles
│   └── product-detail.css    # Product detail page styles
│
└── constants/                # Application constants
    └── index.ts
```

## Architecture Highlights

### Feature-Based Organization
The codebase has been restructured from a monolithic component structure to a feature-based architecture:

- **Separation of Concerns**: Domain logic, UI components, and utilities are properly separated
- **Modular Design**: Features are self-contained with their own components, hooks, and utilities
- **Scalability**: Easy to add new colleges, products, or features without affecting existing code
- **Maintainability**: Clear boundaries between different parts of the application

### Key Architectural Decisions

1. **Configuration-Driven**: College configurations moved to JSON files for easier management
2. **Type Safety**: Strong TypeScript integration throughout the application
3. **Reusable Components**: UI primitives in `components/ui/` for consistent design
4. **Custom Hooks**: Business logic encapsulated in `useOrderForm` hook
5. **Service Layer**: External integrations isolated in services directory
6. **CSS Custom Properties**: Dynamic theming based on college selection

### State Management
- **Pattern**: React Context API + custom hooks (`useOrderForm`)
- **Scope**: Global state via OrderFormContext, scoped to college routes
- **Benefits**: 
  - Simple and predictable state flow
  - No external state management dependencies
  - Easy to test and maintain
  - Type-safe with TypeScript
- **State Persistence**: Form state persists within a session but resets on page reload

### Key Technical Features

1. **Product Configuration System**
   - Size pack selectors with real-time validation
   - Multi-version support (t-shirt, long sleeve, hoodie, crewneck)
   - Color variant management
   - Display options and special configurations
   - Sweatpant/Jogger style selectors

2. **Validation System**
   - Real-time quantity validation with visual feedback
   - Size pack requirements (multiples of 6, 7, or 8 depending on product)
   - Special case handling for tie-dye products
   - Form completeness checking before submission

3. **Email Generation**
   - Automatic SKU extraction from filenames
   - Category-based grouping
   - Version and color information included
   - Order notes support
   - Professional HTML email template

4. **Responsive Design**
   - Mobile-first CSS approach
   - Collapsible sidebar navigation
   - Touch-friendly interfaces
   - Optimized for both desktop and mobile ordering

## Code Quality & Maintenance

### Unused Code Identified

A comprehensive analysis has identified the following unused dependencies and files. See `UNUSED_CODE_ANALYSIS.md` for full details.

**Unused NPM Dependencies (can be removed):**
- `zustand` (v5.0.6) - State management library, not currently used
- `classnames` (v2.5.1) - CSS class utility, not currently used

**Unused Utility Files (can be removed):**
- `src/utils/format.ts` - Formatting utilities with no imports
- `src/utils/guard.ts` - Type guard utilities with no imports
- `src/reportWebVitals.ts` - Web vitals reporting, not imported

**To clean up unused code:**
```bash
# Remove unused dependencies
npm uninstall zustand classnames

# Remove unused files
rm src/utils/format.ts
rm src/utils/guard.ts
rm src/reportWebVitals.ts

# Update src/utils/index.ts to remove the exports
```

**Note**: The codebase is generally very clean with minimal unused code. Most items are leftover from initial Create React App setup.
