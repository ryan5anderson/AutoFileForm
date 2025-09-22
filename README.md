# AutoFileForm - College Merchandise Order System

A React-based order form system for college retail stores to create and submit product orders with complex product variations. The application has been recently refactored from a monolithic structure into a modular, feature-based architecture.

## Features
- Multi-college support (Michigan State, Arizona State)
- Complex product variations (shirts, colors, display options)
- Automatic email generation and sending
- Responsive design with college-specific theming
- Feature-based modular architecture
- TypeScript throughout with strong type safety
- Modern React patterns with hooks and context

## Technology Stack
- **Frontend Framework**: React 19.1.0 with TypeScript 4.9.5
- **Routing**: React Router DOM 7.7.0 
- **State Management**: React useState with custom hooks (Zustand 5.0.6 available)
- **Email Service**: EmailJS 3.2.0
- **Styling**: CSS Custom Properties with CSS Modules
- **Build Tool**: Create React App
- **Testing**: React Testing Library
- **Deployment**: GitHub Pages

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

## Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Navigate to `http://localhost:3000/orderform/` to select your college

## URL Structure
- **College Selection**: `http://localhost:3000/orderform/`
- **Order Form**: `http://localhost:3000/orderform/#/michiganstate` or `http://localhost:3000/orderform/#/arizonastate`
- **Order Summary**: `http://localhost:3000/orderform/#/michiganstate/summary`
- **Order Receipt**: `http://localhost:3000/orderform/#/michiganstate/receipt`
- **Thank You**: `http://localhost:3000/orderform/#/michiganstate/thankyou`

## Project Structure

The project has been refactored into a feature-based architecture that promotes maintainability and scalability:

```
src/
├── app/                 # Application shell and routing
│   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   └── routes/         # Route components (form, summary, receipt, thankyou)
├── components/          # Shared UI components
│   ├── ui/             # Reusable UI primitives (Card, Field, Button)
│   ├── CollegeSelector.tsx
│   └── OrderFormPage.tsx
├── config/             # Configuration files
│   ├── colleges/       # College-specific JSON configurations
│   └── index.ts        # Configuration loader
├── features/           # Feature-based modules
│   ├── components/     # Feature-specific components
│   │   ├── panels/     # Product option panels
│   │   ├── CategorySection.tsx
│   │   ├── StoreInfoForm.tsx
│   │   └── OrderSummaryCard.tsx
│   ├── hooks/          # Feature-specific hooks
│   │   └── useOrderForm.ts
│   └── utils/          # Feature-specific utilities
│       ├── calculations.ts
│       ├── imagePath.ts
│       ├── naming.ts
│       └── emailTemplate.ts
├── services/           # External service integrations
│   ├── emailService.ts
│   └── templates/      # Email templates
├── types/              # TypeScript type definitions
├── utils/              # Shared utility functions
│   ├── format.ts
│   ├── guard.ts
│   └── index.ts
├── styles/             # CSS styling
│   ├── tokens.css      # Design tokens
│   ├── components.css  # Component styles
│   ├── global.css      # Global styles
│   └── college-pages.css
└── constants/          # Application constants
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
- **Primary**: React useState with custom hooks pattern
- **Benefits**: Simple, predictable state flow without external dependencies
- **Future**: Zustand available for more complex state needs as the app grows
