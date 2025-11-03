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
