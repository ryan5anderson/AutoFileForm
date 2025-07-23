# Refactoring Strategy

## Overview

This document outlines a comprehensive refactoring strategy to improve the AutoFileForm codebase. The refactoring will address architectural issues, improve code quality, enhance performance, and make the system more maintainable.

## Refactoring Goals

1. **Improve Code Quality:** Reduce complexity, improve type safety, and enhance maintainability
2. **Enhance Performance:** Optimize rendering, reduce bundle size, and improve user experience
3. **Increase Security:** Fix vulnerabilities and implement proper validation
4. **Improve Architecture:** Normalize state management and component structure
5. **Add Testing:** Implement comprehensive test coverage
6. **Enhance Documentation:** Add proper documentation and comments

## Phase 1: Critical Fixes (Week 1-2)

### 1.1 Security Improvements

#### Move Credentials to Environment Variables
**Current:** Credentials hardcoded in constants
**Target:** Environment-based configuration

```typescript
// .env.local
REACT_APP_EMAILJS_SERVICE_ID=service_ehf05es
REACT_APP_EMAILJS_TEMPLATE_ID=template_t1138kn
REACT_APP_EMAILJS_USER_ID=f7BZO-3hAYB-QusoW
REACT_APP_PROVIDER_EMAIL=anderson.t.ryan@gmail.com

// src/config/email.ts
export const EMAILJS_CONFIG = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID!,
  templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID!,
  userId: process.env.REACT_APP_EMAILJS_USER_ID!,
  providerEmail: process.env.REACT_APP_PROVIDER_EMAIL!,
};
```

#### Input Validation Implementation
**Current:** Minimal validation
**Target:** Comprehensive validation system

```typescript
// src/validation/schemas.ts
import { z } from 'zod';

export const StoreInfoSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  storeNumber: z.string().min(1, 'Store number is required'),
  storeManager: z.string().min(1, 'Store manager is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export const ProductQuantitySchema = z.object({
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  sku: z.string().min(1, 'SKU is required'),
});

export const FormDataSchema = z.object({
  storeInfo: StoreInfoSchema,
  products: z.record(z.string(), ProductQuantitySchema),
  orderNotes: z.string().optional(),
});
```

### 1.2 Type Safety Improvements

#### Normalize Data Types
**Current:** Inconsistent types (string vs number)
**Target:** Consistent, type-safe data structures

```typescript
// src/types/normalized.ts
export interface NormalizedFormState {
  storeInfo: StoreInfo;
  products: Record<string, ProductOrder>;
  metadata: FormMetadata;
}

export interface ProductOrder {
  id: string;
  sku: string;
  category: string;
  variations: ProductVariation[];
  totalQuantity: number;
}

export interface ProductVariation {
  type: 'shirt' | 'color' | 'display' | 'sweatpant';
  value: string;
  quantity: number;
}

export interface StoreInfo {
  company: string;
  storeNumber: string;
  storeManager: string;
  date: string;
}
```

#### Replace String Keys with Union Types
**Current:** String keys for dynamic properties
**Target:** Type-safe union types

```typescript
// src/types/variations.ts
export type ShirtVersion = 'tshirt' | 'longsleeve' | 'hoodie' | 'crewneck';
export type Color = 'black' | 'forest' | 'white' | 'gray';
export type ShirtColorCombo = `${ShirtVersion}_${Color}`;

export interface ShirtColorComboVersion {
  [key in ShirtColorCombo]?: number;
}
```

### 1.3 Basic Error Handling

#### Error Boundary Implementation
**Current:** No error boundaries
**Target:** Comprehensive error handling

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback: React.ComponentType<{ error?: Error }> }>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## Phase 2: Architecture Improvements (Week 3-4)

### 2.1 State Management Refactor

#### Implement Context API
**Current:** Prop drilling
**Target:** Context-based state management

```typescript
// src/context/OrderFormContext.tsx
import React, { createContext, useContext, useReducer } from 'react';
import { NormalizedFormState, OrderFormAction } from '../types';

interface OrderFormContextType {
  state: NormalizedFormState;
  dispatch: React.Dispatch<OrderFormAction>;
}

const OrderFormContext = createContext<OrderFormContextType | undefined>(undefined);

export const OrderFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderFormReducer, initialState);

  return (
    <OrderFormContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderFormContext.Provider>
  );
};

export const useOrderForm = () => {
  const context = useContext(OrderFormContext);
  if (!context) {
    throw new Error('useOrderForm must be used within OrderFormProvider');
  }
  return context;
};
```

#### Normalize State Structure
**Current:** Complex nested objects
**Target:** Normalized, flat structure

```typescript
// src/reducers/orderFormReducer.ts
export const orderFormReducer = (
  state: NormalizedFormState,
  action: OrderFormAction
): NormalizedFormState => {
  switch (action.type) {
    case 'UPDATE_STORE_INFO':
      return {
        ...state,
        storeInfo: { ...state.storeInfo, ...action.payload },
      };
    
    case 'UPDATE_PRODUCT_QUANTITY':
      return {
        ...state,
        products: {
          ...state.products,
          [action.payload.productId]: {
            ...state.products[action.payload.productId],
            totalQuantity: action.payload.quantity,
          },
        },
      };
    
    default:
      return state;
  }
};
```

### 2.2 Component Extraction

#### Extract Reusable Components
**Current:** Large, monolithic components
**Target:** Small, focused components

```typescript
// src/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ children, className, variant = 'default' }) => {
  const cardStyles = {
    default: 'bg-white border border-gray-200 rounded-lg p-4',
    elevated: 'bg-white shadow-lg rounded-lg p-4',
    outlined: 'bg-white border-2 border-gray-300 rounded-lg p-4',
  };

  return (
    <div className={`${cardStyles[variant]} ${className || ''}`}>
      {children}
    </div>
  );
};

// src/components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
}) => {
  const buttonStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${buttonStyles[variant]} ${sizeStyles[size]} rounded font-medium disabled:opacity-50`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

#### Component Composition
**Current:** Props drilling
**Target:** Component composition

```typescript
// src/components/CategorySection.tsx
interface CategorySectionProps {
  category: Category;
  children?: React.ReactNode;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ category, children }) => {
  return (
    <Card>
      <CategoryHeader category={category} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </Card>
  );
};

// Usage
<CategorySection category={category}>
  {category.products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</CategorySection>
```

### 2.3 Performance Optimization

#### Implement React.memo
**Current:** Components re-render unnecessarily
**Target:** Optimized rendering

```typescript
// src/components/ProductCard.tsx
export const ProductCard = React.memo<ProductCardProps>(({
  product,
  onQuantityChange,
  readOnly = false,
}) => {
  const handleQuantityChange = useCallback((quantity: number) => {
    onQuantityChange(product.id, quantity);
  }, [product.id, onQuantityChange]);

  return (
    <Card>
      <ProductImage src={product.imageUrl} alt={product.name} />
      <ProductInfo name={product.name} sku={product.sku} />
      {!readOnly && (
        <QuantitySelector
          value={product.totalQuantity}
          onChange={handleQuantityChange}
        />
      )}
    </Card>
  );
});
```

#### Code Splitting
**Current:** All code loaded upfront
**Target:** Lazy-loaded components

```typescript
// src/components/lazy.tsx
import { lazy } from 'react';

export const SummaryPage = lazy(() => import('./SummaryPage'));
export const ReceiptPage = lazy(() => import('./ReceiptPage'));
export const ThankYouPage = lazy(() => import('./ThankYouPage'));

// src/components/OrderFormPage.tsx
import { Suspense } from 'react';
import { SummaryPage, ReceiptPage, ThankYouPage } from './lazy';

const OrderFormPage: React.FC = () => {
  // ... existing logic

  if (page === 'summary') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <SummaryPage {...summaryProps} />
      </Suspense>
    );
  }

  // ... other pages
};
```

## Phase 3: Testing and Documentation (Week 5-6)

### 3.1 Testing Implementation

#### Unit Tests for Components
```typescript
// src/components/__tests__/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 'test-product',
    name: 'Test Product',
    sku: 'TEST123',
    imageUrl: '/test-image.png',
    totalQuantity: 0,
  };

  const mockOnQuantityChange = jest.fn();

  beforeEach(() => {
    mockOnQuantityChange.mockClear();
  });

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onQuantityChange={mockOnQuantityChange} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('TEST123')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  it('calls onQuantityChange when quantity is updated', () => {
    render(<ProductCard product={mockProduct} onQuantityChange={mockOnQuantityChange} />);
    
    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '5' } });
    
    expect(mockOnQuantityChange).toHaveBeenCalledWith('test-product', 5);
  });
});
```

#### Integration Tests
```typescript
// src/__tests__/orderFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderFormPage } from '../components/OrderFormPage';
import { OrderFormProvider } from '../context/OrderFormContext';

describe('Order Flow', () => {
  it('completes full order flow', async () => {
    render(
      <OrderFormProvider>
        <OrderFormPage />
      </OrderFormProvider>
    );

    // Fill store information
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'Test Company' } });
    fireEvent.change(screen.getByLabelText('Store Number'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Store Manager'), { target: { value: 'John Doe' } });

    // Add product quantities
    const quantityInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(quantityInputs[0], { target: { value: '5' } });

    // Submit form
    fireEvent.click(screen.getByText('Review Order'));

    // Verify summary page
    await waitFor(() => {
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    // Confirm order
    fireEvent.click(screen.getByText('Confirm Order'));

    // Verify receipt page
    await waitFor(() => {
      expect(screen.getByText('Order Receipt')).toBeInTheDocument();
    });
  });
});
```

#### Custom Hook Tests
```typescript
// src/hooks/__tests__/useOrderForm.test.ts
import { renderHook, act } from '@testing-library/react';
import { useOrderForm } from '../useOrderForm';

describe('useOrderForm', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useOrderForm());

    expect(result.current.state.storeInfo.company).toBe('');
    expect(result.current.state.products).toEqual({});
  });

  it('updates store information', () => {
    const { result } = renderHook(() => useOrderForm());

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_STORE_INFO',
        payload: { company: 'Test Company' },
      });
    });

    expect(result.current.state.storeInfo.company).toBe('Test Company');
  });
});
```

### 3.2 Documentation Improvements

#### JSDoc Comments
```typescript
/**
 * ProductCard component displays individual product information with quantity selection.
 * 
 * @param product - The product to display
 * @param onQuantityChange - Callback function when quantity changes
 * @param readOnly - Whether the component is in read-only mode
 * 
 * @example
 * ```tsx
 * <ProductCard
 *   product={product}
 *   onQuantityChange={(productId, quantity) => updateQuantity(productId, quantity)}
 *   readOnly={false}
 * />
 * ```
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuantityChange, readOnly }) => {
  // Component implementation
};
```

#### Architecture Documentation
```markdown
# Component Architecture

## Overview
The AutoFileForm application follows a component-based architecture with clear separation of concerns.

## Component Hierarchy
```
OrderFormPage (Container)
├── FormPage (Form Interface)
│   ├── StoreInfoForm (Store Information)
│   ├── CategorySection (Product Categories)
│   │   └── ProductCard (Individual Products)
│   └── OrderNotesSection (Order Notes)
├── SummaryPage (Order Review)
└── ReceiptPage (Order Confirmation)
```

## State Management
The application uses React Context API for state management with a normalized state structure.

## Data Flow
1. User input triggers state updates
2. State changes cause component re-renders
3. Form submission triggers email generation
4. Email service sends order confirmation
```

## Phase 4: Configuration and Deployment (Week 7-8)

### 4.1 Dynamic Configuration

#### Configuration Management
```typescript
// src/config/colleges.ts
export interface CollegeConfig {
  id: string;
  name: string;
  logo: string;
  theme: ThemeConfig;
  products: ProductCatalog;
  validation: ValidationRules;
}

export const loadCollegeConfig = async (collegeId: string): Promise<CollegeConfig> => {
  const response = await fetch(`/api/colleges/${collegeId}`);
  if (!response.ok) {
    throw new Error(`Failed to load college configuration: ${collegeId}`);
  }
  return response.json();
};

// src/hooks/useCollegeConfig.ts
export const useCollegeConfig = (collegeId: string) => {
  const [config, setConfig] = useState<CollegeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadCollegeConfig(collegeId)
      .then(setConfig)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [collegeId]);

  return { config, loading, error };
};
```

#### Environment Configuration
```typescript
// src/config/environment.ts
export const ENV_CONFIG = {
  email: {
    serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID!,
    templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID!,
    userId: process.env.REACT_APP_EMAILJS_USER_ID!,
    providerEmail: process.env.REACT_APP_PROVIDER_EMAIL!,
  },
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  },
  features: {
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    enableDebugMode: process.env.NODE_ENV === 'development',
  },
};
```

### 4.2 Deployment Automation

#### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

#### Environment Setup
```bash
# scripts/setup-env.sh
#!/bin/bash

# Create environment files
cat > .env.local << EOF
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_USER_ID=your_user_id
REACT_APP_PROVIDER_EMAIL=your_email
REACT_APP_API_BASE_URL=https://api.yourapp.com
REACT_APP_ENABLE_ANALYTICS=true
EOF

echo "Environment file created successfully!"
```

## Success Metrics

### Code Quality Metrics
- **Test Coverage:** >80%
- **Type Safety:** >95%
- **Component Complexity:** <50 lines per component
- **State Management:** Normalized, type-safe

### Performance Metrics
- **Bundle Size:** <500KB (gzipped)
- **Initial Load Time:** <2 seconds
- **Time to Interactive:** <3 seconds

### Maintainability Metrics
- **Cyclomatic Complexity:** <10 per function
- **Code Duplication:** <5%
- **Documentation Coverage:** >90%

## Risk Mitigation

### Technical Risks
1. **Breaking Changes:** Implement feature flags and gradual rollout
2. **Performance Regression:** Continuous performance monitoring
3. **Data Loss:** Comprehensive backup and rollback strategies

### Business Risks
1. **Downtime:** Blue-green deployment strategy
2. **User Experience:** A/B testing for major changes
3. **Data Integrity:** Comprehensive validation and testing

## Timeline Summary

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| 1 | Week 1-2 | Critical Fixes | Security, Type Safety, Error Handling |
| 2 | Week 3-4 | Architecture | State Management, Components, Performance |
| 3 | Week 5-6 | Quality | Testing, Documentation |
| 4 | Week 7-8 | Deployment | Configuration, CI/CD |

## Conclusion

This refactoring strategy provides a comprehensive approach to improving the AutoFileForm codebase. By following this phased approach, we can systematically address all major issues while maintaining system functionality and minimizing risk.

The strategy prioritizes critical fixes first, then moves to architectural improvements, followed by quality enhancements, and finally deployment automation. Each phase builds upon the previous one, ensuring a stable and maintainable codebase. 