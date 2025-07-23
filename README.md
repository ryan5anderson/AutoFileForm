# AutoFileForm - College Merchandise Order System

A React-based order form system for college retail stores to create and submit product orders with complex product variations.

## Features
- Multi-college support (Michigan State, Arizona State)
- Complex product variations (shirts, colors, display options)
- Automatic email generation and sending
- Responsive design with college-specific theming

## Architecture
- **State Management**: React useState (considering Zustand migration)
- **Routing**: React Router with college-based routing
- **Email**: EmailJS integration
- **Styling**: CSS custom properties for theming

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
4. Navigate to `http://localhost:3000/#/michiganstate` or `http://localhost:3000/#/arizonastate`

## Project Structure
```
src/
├── components/          # React components
├── constants/           # Configuration and constants
├── hooks/              # Custom React hooks
├── services/           # External service integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # CSS and styling
```
