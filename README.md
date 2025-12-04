# AutoFileForm - College Merchandise Order System

A comprehensive React-based order management system for college retail stores to create, submit, and manage product orders with complex product variations. The application features a full admin dashboard, Firebase integration for order persistence, and a modular, feature-based architecture following modern React best practices.

## Features

### Customer-Facing Features
- **Multi-college support**: 6 colleges supported (Michigan State, Arizona State, Oregon University, West Virginia University, Pittsburgh University, Alabama University)
- **Complex product variations**: Shirts with size packs, color options, display configurations, and version-specific options
- **Smart validation**: Real-time validation with visual feedback for size pack requirements and quantity constraints
- **Product detail pages**: Dedicated configuration interface for complex products with version-specific options
- **Order notes**: Per-item notes and order-level notes for special instructions
- **Order summary**: Comprehensive review page showing all selected items with quantities and size breakdowns
- **Order receipts**: Detailed receipt pages with complete order information
- **Automatic email generation**: Professional order emails sent via EmailJS upon submission

### Admin Features
- **Admin Dashboard**: Comprehensive dashboard with order statistics and quick actions
- **Order Management**: View, filter, and manage all orders with status tracking (pending, completed, cancelled)
- **Real-time Updates**: Live order updates using Firebase real-time subscriptions
- **Order Filtering**: Filter orders by status, college, and store number
- **College Management**: Browse and view products for each college in read-only mode
- **Garment Ratio Management**: View and edit garment ratios (pack sizes, size scales, size distributions) per product
- **Product Detail Admin**: Access detailed product information and edit garment ratios directly from product pages
- **Order Receipts**: View detailed receipts for any order with complete product breakdowns

### Technical Features
- **Firebase Integration**: Firestore database for order persistence and garment ratio management
- **Responsive design**: Mobile-first design with college-specific theming
- **Feature-based architecture**: Clean separation of concerns with modular code organization
- **Full TypeScript**: Complete type safety throughout the application
- **Modern React patterns**: Hooks, Context API, and functional components
- **Environment-based configuration**: Secure environment variable management for API keys and secrets

## Technology Stack
- **Frontend Framework**: React 19.1.0 with TypeScript 5.9.3
- **Routing**: React Router DOM 7.7.0 (BrowserRouter for clean URLs)
- **State Management**: React Context API with custom hooks
- **Database**: Firebase Firestore 12.4.0 for order and garment ratio storage
- **Email Service**: EmailJS 3.2.0
- **Styling**: CSS Custom Properties (CSS Variables) with responsive design
- **Build Tool**: Create React App 5.0.1
- **Testing Framework**: React Testing Library (configured, tests to be added)
- **Deployment**: Vercel with custom domain support (ohiopylecollege.com)

## Development

### Quick Start Guide

**Choose the right command:**
- **`npm start`** → Frontend only, uses hardcoded values from config files
  - No API server needed
  - Use for UI development and testing production routes
  
- **`npm run dev:local`** → Full stack with API integration
  - Requires Vercel CLI (`npm i -g vercel`)
  - Connects to real API endpoints
  - Required for `/test-api/*` routes

### Local Development Setup

The application supports two deployment scenarios:

1. **Vercel Deployment** (Production): API routes are handled automatically by Vercel serverless functions
2. **Local Development**: 
   - **Frontend only**: `npm start` (uses static config files)
   - **With API**: `npm run dev:local` (requires Vercel dev server)

### Development Commands

**For Local Testing (Hardcoded Values):**
- `npm start` - Start React development server with static config files (no API required)
  - Uses hardcoded college data from `src/config/colleges/*.json`
  - No Vercel dev server needed
  - Good for frontend development and testing UI without API dependencies

**For Local Development (API Integration):**
- `npm run dev:local` - Start both Vercel dev server and React app concurrently (recommended for API testing)
  - Connects to real API endpoints via Vercel serverless functions
  - Requires Vercel CLI and API server running
  - Use this when testing API integration and `/test-api/*` routes
- `npm run dev:vercel` - Start only Vercel dev server (for API routes)
- `npm run build` - Production build

### Local Development with API Support

**Important:** Choose the right command based on what you're testing:
- **`npm start`** → Frontend only, uses static config files (hardcoded values)
- **`npm run dev:local`** → Full stack, uses real API endpoints

For local development with API functionality, you have two options:

#### Option 1: Use `npm run dev:local` (Recommended)
This command starts both the Vercel dev server (for API routes) and the React app:

```bash
npm run dev:local
```

This will:
- Start Vercel dev server on `http://localhost:3001` (handles `/api/*` routes)
- Start React app on `http://localhost:3000` (proxies API requests to Vercel dev server)
- Automatically wait for the API server to be ready before starting React

#### Option 2: Run Servers Separately
If you prefer to run servers in separate terminals:

**Terminal 1:**
```bash
npm run dev:vercel
# or: vercel dev
```

**Terminal 2:**
```bash
npm start
```

### API Configuration

The application uses Vercel serverless functions located in the `/api` directory:
- `/api/health` - Health check endpoint
- `/api/colleges` - Fetch list of colleges
- `/api/college` - Fetch college order data
- `/api/proxy-image` - Proxy images from external domains

**Environment Variables for API:**
- `TARGET_API_URL` - External API base URL (default: `http://ohiopyleprints.com`)
  - Set in Vercel environment variables for production
  - Can be set in `.env.local` for local development: `TARGET_API_URL=http://ohiopyleprints.com`

**Proxy Configuration:**
- The `src/setupProxy.js` file automatically proxies `/api/*` requests to the Vercel dev server
- Proxy target: `http://localhost:3001` (Vercel dev default port)
- You can change the port by setting `VERCEL_DEV_PORT` environment variable

### Troubleshooting Local API Issues

**Problem: 404 errors on `/api/*` routes**

**Solution:**
1. Make sure Vercel dev server is running (`npm run dev:vercel` or `vercel dev`)
2. Or use `npm run dev:local` to start both servers together
2. Check that the server is running on port 3001 (default)
3. Verify the proxy is working by checking browser console for proxy logs
4. Try accessing `http://localhost:3001/api/health` directly to verify the API server

**Problem: "Cannot connect to Vercel dev server" error**

**Solution:**
- Ensure Vercel CLI is installed: `npm i -g vercel`
- Make sure port 3001 is not in use by another application
- Check that `src/setupProxy.js` exists and is properly configured

**Problem: "Project was deleted, transferred, or you don't have access" error**

**Solution:**
- If you don't have a Vercel project linked, you can still run locally:
  1. Run `vercel link` to link to an existing project, or
  2. Run `vercel dev --yes` which will work locally even without a project link
- The `--yes` flag is already included in the `dev:local` script to skip confirmation prompts
- For local development, Vercel dev will work with your `/api` directory functions even without a project connection

**Problem: API requests work in production but not locally**

**Solution:**
- Local development requires the Vercel dev server to run the serverless functions
- Use `npm run dev` to start both servers, or run `vercel dev` separately
- Verify `TARGET_API_URL` is set correctly in your environment

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase project with Firestore enabled
- EmailJS account and service configured
- Environment variables configured (see Environment Setup below)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AutoFileForm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # EmailJS Configuration
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID_PROD=your_prod_template_id
   REACT_APP_EMAILJS_TEMPLATE_ID_DEV=your_dev_template_id
   REACT_APP_EMAILJS_USER_ID=your_user_id
   REACT_APP_PROVIDER_EMAIL=your_email@example.com

   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Admin Configuration
   REACT_APP_ADMIN_PASSWORD=your_admin_password
   ```

4. **Initialize Firebase**
   - Ensure your Firebase project has Firestore enabled
   - The application will automatically initialize default garment ratios on first access
   - Set up Firestore security rules as needed for your use case

5. **Start development server**

   **Option A: Frontend only (hardcoded values)**
   ```bash
   npm start
   ```
   - Uses static config files from `src/config/colleges/*.json`
   - No API server required
   - Good for UI development and testing

   **Option B: Full stack with API (real endpoints)**
   ```bash
   npm run dev:local
   ```
   - Requires Vercel CLI installed: `npm i -g vercel`
   - Connects to real API endpoints
   - Use this for testing `/test-api/*` routes

6. **Open in browser**
   - Navigate to `http://localhost:3000/` to select your college
   - Routes will be like `http://localhost:3000/michiganstate`
   - Access admin dashboard at `http://localhost:3000/admin`
   - Test API routes at `http://localhost:3000/test-api` (requires `npm run dev:local`)

## Usage

### Customer Order Flow
1. **Select College**: Choose a college from the landing page
2. **Browse Products**: Navigate through product categories using the sidebar
3. **Configure Products**: 
   - Click on products to open detail pages for complex configurations
   - Select sizes, colors, versions, and quantities
   - Add notes for specific items or the entire order
4. **Review Order**: Check the summary page to review all selected items
5. **Submit Order**: Fill in store information and submit
6. **Confirmation**: Receive order receipt and email confirmation

### Admin Dashboard
1. **Access Admin**: Navigate to `/admin` and enter the admin password
2. **View Dashboard**: See order statistics and recent orders
3. **Manage Orders**: 
   - View all orders with filtering options
   - Update order status (pending/completed/cancelled)
   - Delete orders if needed
   - View detailed order receipts
4. **Manage Colleges**: Browse products for each college in read-only mode
5. **Edit Garment Ratios**: 
   - Navigate to a college's products
   - Click on individual products to view garment ratio information
   - Edit pack sizes, size scales, and size distributions
   - Changes are saved to Firebase and affect future orders

### Key Features Explained

#### Garment Ratios
Garment ratios define how products are packaged and distributed:
- **Set Pack**: Number of items per pack (e.g., 7, 12, 24)
- **Size Scale**: Available sizes (e.g., "XS-3X", "S-2X", "6M-12M")
- **Size Distribution**: How many of each size per pack (e.g., 2 Medium, 3 Large, 2 XL)

Ratios can be customized per college and product version, allowing for flexible inventory management.

#### Order Management
- Orders are stored in Firebase Firestore with full product details
- Real-time updates notify admins of new orders immediately
- Order status tracking helps manage fulfillment workflow
- Detailed receipts include all product variations and quantities

#### Product Variations
The system supports complex product configurations:
- **Shirt Versions**: Crew neck, hoodie, tank top, etc.
- **Color Options**: Multiple color choices with size-specific quantities
- **Display Options**: Signage, displays, and promotional materials
- **Size Packs**: Pre-configured size distributions for efficient ordering

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
│       ├── orderReceipt.tsx  # Detailed order receipt view
│       ├── thankyou.tsx      # Confirmation page
│       ├── about.tsx         # About page
│       ├── contact.tsx       # Contact page
│       ├── admin.tsx         # Admin dashboard
│       ├── adminCollegeSelection.tsx  # Admin college selection
│       ├── adminCollegeView.tsx      # Admin college product view
│       ├── adminProductDetail.tsx    # Admin product detail with ratio editing
│       └── allOrders.tsx     # All orders view with filtering
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
│   │   ├── oregonUniversity.json
│   │   ├── westVirginiaUniversity.json
│   │   ├── pittsburghuniversity.json
│   │   └── alabamauniversity.json
│   ├── env.ts                # Environment variable configuration
│   ├── firebase.ts           # Firebase initialization
│   ├── garmentRatios.ts     # Garment ratio utilities
│   ├── garment_ratios_final.json  # Default garment ratios
│   ├── packSizes.ts         # Pack size configuration
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
│   │   ├── StoreInfoForm.tsx
│   │   └── GarmentRatioEditor.tsx  # Admin garment ratio editor
│   ├── hooks/                # Custom hooks
│   │   ├── useOrderForm.ts   # Main order form state management
│   │   └── useGarmentRatios.ts  # Garment ratio data fetching
│   └── utils/                # Feature-specific utilities
│       ├── calculations.ts   # Quantity calculations and validation
│       ├── emailTemplate.ts  # Email template generation
│       ├── imagePath.ts      # Image path utilities
│       └── naming.ts         # Product naming utilities
│
├── services/                 # External service integrations
│   ├── emailService.ts       # EmailJS integration
│   ├── firebaseOrderService.ts  # Firebase Firestore order operations
│   ├── firebaseGarmentRatioService.ts  # Firebase garment ratio management
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

## Deployment

### Production Build
```bash
npm run build
```
This creates an optimized production build in the `build/` directory.

### Deploy to Vercel
The application is configured for automatic deployment on Vercel. Simply push to your main branch and Vercel will automatically build and deploy.

For manual deployment:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

### Environment Variables in Production
For production deployment, ensure all environment variables are set in Vercel:
- Go to your Vercel project settings
- Navigate to Environment Variables
- Add all required `REACT_APP_*` variables
- Redeploy after adding variables

### Firebase Security Rules
Ensure your Firestore security rules are properly configured:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      // Allow read/write for authenticated admins
      // Adjust based on your security requirements
      allow read, write: if request.auth != null;
    }
    match /garmentRatios/{docId} {
      allow read: if true; // Public read for garment ratios
      allow write: if request.auth != null; // Admin write only
    }
  }
}
```

## Additional Notes

- **BrowserRouter**: The application uses BrowserRouter for clean URLs. Vercel handles client-side routing via rewrites in `vercel.json`
- **Firebase Initialization**: Garment ratios are automatically initialized from `garment_ratios_final.json` on first access
- **College Configuration**: Each college has its own JSON configuration file with product categories and options
- **Image Assets**: Product images are stored in the `public/` directory organized by college and category
- **Mobile Optimization**: The application is fully responsive and optimized for mobile devices
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ support

## Contributing

When adding new features:
1. Follow the existing feature-based architecture
2. Maintain TypeScript type safety
3. Update this README with new features or changes
4. Test on multiple browsers and devices
5. Ensure Firebase security rules are updated if needed
