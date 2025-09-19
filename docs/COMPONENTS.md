# Component Architecture Analysis

## Component Hierarchy

```
OrderFormPage (Main Container)
├── FormPage
│   ├── Header
│   ├── StoreInfoForm
│   ├── CategorySection (for each category)
│   │   ├── ProductCard
│   │   ├── ShirtVersionCard
│   │   ├── ColorVersionCard
│   │   ├── ShirtColorVersionCard
│   │   ├── DisplayOptionCard
│   │   └── OrderSummaryCard
│   ├── OrderNotesSection
│   └── Footer
├── SummaryPage
│   ├── Header
│   ├── CategorySection (read-only)
│   └── Footer
├── ReceiptPage
└── ThankYouPage
```

## Core Components Analysis

### 1. OrderFormPage (Main Container)

**Location:** `src/components/OrderFormPage.tsx`
**Purpose:** Top-level component that handles routing and page state

#### Responsibilities
- College-specific configuration loading
- Dynamic theming based on college
- Page state management (form/summary/receipt/thankyou)
- Hook integration

#### Key Features
```typescript
// Dynamic theming
React.useEffect(() => {
  if (college === 'arizonastate') {
    document.documentElement.style.setProperty('--color-primary', '#8c2434');
  } else if (college === 'michiganstate') {
    document.documentElement.style.setProperty('--color-primary', '#166534');
  }
}, [college]);
```

#### Issues
- **Hardcoded College Logic:** College-specific logic embedded in component
- **No Error Boundaries:** No error handling for invalid college configurations
- **Tight Coupling:** Directly imports college configurations

### 2. FormPage

**Location:** `src/components/FormPage.tsx`
**Purpose:** Main form interface with all input components

#### Component Structure
```typescript
interface FormPageProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
  onQuantityChange: (imagePath: string, value: string) => void;
  onShirtVersionChange: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onColorVersionChange: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  onDisplayOptionChange: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  onShirtColorComboChange: (imagePath: string, version: string, color: string, value: string) => void;
  collegeConfig?: CollegeConfig;
  college?: string;
}
```

#### Issues
- **Prop Drilling:** 10+ props passed down from parent
- **Complex Interface:** Overly complex props interface
- **No Component Composition:** All logic in single component

### 3. CategorySection

**Location:** `src/components/CategorySection.tsx`
**Purpose:** Renders product categories with their associated products

#### Component Structure
```typescript
interface CategorySectionProps {
  category: Category;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  colorVersions?: Record<string, ColorVersion>;
  shirtColorComboVersions?: Record<string, ShirtColorComboVersion>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onColorVersionChange?: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  onShirtColorComboChange?: (imagePath: string, version: string, color: string, value: string) => void;
  onDisplayOptionChange?: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  readOnly?: boolean;
  college?: string;
}
```

#### Key Features
- **Conditional Rendering:** Different UI based on category type
- **Product Grid:** Responsive grid layout for products
- **Modal Support:** Product detail modals

#### Issues
- **Complex Conditional Logic:** Multiple conditional rendering paths
- **Large Component:** 413 lines of code
- **Mixed Responsibilities:** UI rendering + business logic

### 4. ProductCard

**Location:** `src/components/ProductCard.tsx`
**Purpose:** Individual product display with quantity inputs

#### Component Structure
```typescript
interface ProductCardProps {
  categoryPath: string;
  categoryName: string;
  imageName: string;
  quantity?: string;
  onQuantityChange?: (imagePath: string, value: string) => void;
  showQuantityInput?: boolean;
  readOnly?: boolean;
  sweatpantJoggerOption?: SweatpantJoggerOption;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  hideImage?: boolean;
  college?: string;
}
```

#### Key Features
- **Dynamic Image Loading:** College-specific image paths
- **Quantity Multiples:** Predefined quantity options
- **Special Product Handling:** Sweatpant/jogger variations

#### Issues
- **Hardcoded Logic:** Special case handling for specific products
- **Complex Props:** Too many optional props
- **Inline Styles:** All styling done inline

## Component Patterns

### 1. Conditional Rendering Pattern

**Current Approach:**
```typescript
{category.hasDisplayOptions && (
  <div style={{...}}>
    <strong>Display Only:</strong> Just the display unit without garments.<br />
    <strong>Display Standard Case Pack:</strong> Display unit includes garments.
  </div>
)}
```

**Issues:**
- Inline JSX for conditional content
- No reusable components for common patterns
- Hard to maintain and test

### 2. Event Handler Pattern

**Current Approach:**
```typescript
const handleQuantityChange = (imagePath: string, value: string) => {
  onQuantityChange?.(imagePath, value);
};
```

**Issues:**
- Simple pass-through handlers
- No validation or transformation
- Inconsistent error handling

### 3. Styling Pattern

**Current Approach:**
```typescript
<div style={{ 
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-3)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)'
}}>
```

**Issues:**
- All styling inline
- No reusable style objects
- Difficult to maintain consistency

## Component Architecture Issues

### 1. Prop Drilling
**Problem:** State and handlers passed through multiple component levels

**Impact:**
- Difficult to maintain
- Components tightly coupled
- Hard to test individual components

**Solution:** Context API or state management library

### 2. Component Size
**Problem:** Large components with multiple responsibilities

**Impact:**
- Hard to understand and maintain
- Difficult to test
- Poor reusability

**Solution:** Component composition and separation of concerns

### 3. Conditional Logic
**Problem:** Complex conditional rendering scattered throughout components

**Impact:**
- Hard to follow component logic
- Difficult to maintain
- Poor testability

**Solution:** Extract conditional logic into custom hooks or utilities

### 4. Styling Approach
**Problem:** All styling done inline with no reusable patterns

**Impact:**
- Inconsistent styling
- Difficult to maintain
- Poor performance

**Solution:** CSS modules, styled-components, or design system

## Recommended Component Improvements

### 1. Component Composition

**Current:**
```typescript
<CategorySection
  category={category}
  quantities={formData.quantities}
  shirtVersions={formData.shirtVersions}
  // ... many more props
/>
```

**Proposed:**
```typescript
<CategorySection>
  <CategoryHeader category={category} />
  <ProductGrid>
    {category.products.map(product => (
      <ProductCard key={product.id} product={product} />
    ))}
  </ProductGrid>
</CategorySection>
```

### 2. Custom Hooks for Business Logic

**Current:**
```typescript
// Business logic mixed with UI
const handleQuantityChange = (imagePath: string, value: string) => {
  setFormData(prev => ({
    ...prev,
    quantities: { ...prev.quantities, [imagePath]: value }
  }));
};
```

**Proposed:**
```typescript
// Custom hook for quantity management
const useQuantityManager = () => {
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    // Business logic here
  }, []);
  
  return { updateQuantity };
};
```

### 3. Reusable UI Components

**Current:**
```typescript
// Inline styling everywhere
<div style={{ 
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-3)'
}}>
```

**Proposed:**
```typescript
// Reusable Card component
<Card>
  <CardHeader>{title}</CardHeader>
  <CardBody>{children}</CardBody>
</Card>
```

### 4. Error Boundaries

**Current:**
```typescript
// No error handling
if (!collegeConfig) {
  return <div>College not found</div>;
}
```

**Proposed:**
```typescript
// Error boundary component
<ErrorBoundary fallback={<CollegeNotFound />}>
  <OrderFormPage />
</ErrorBoundary>
```

## Component Testing Strategy

### Current State
- No visible test files
- No testing strategy documented
- Components not designed for testability

### Recommended Testing Approach

#### 1. Unit Tests
```typescript
// Test individual components
describe('ProductCard', () => {
  it('should render product image', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByAltText(mockProduct.name)).toBeInTheDocument();
  });
});
```

#### 2. Integration Tests
```typescript
// Test component interactions
describe('CategorySection', () => {
  it('should update quantity when product quantity changes', () => {
    const mockOnQuantityChange = jest.fn();
    render(<CategorySection onQuantityChange={mockOnQuantityChange} />);
    // Test interaction
  });
});
```

#### 3. Custom Hook Tests
```typescript
// Test business logic
describe('useOrderForm', () => {
  it('should validate form data', () => {
    const { result } = renderHook(() => useOrderForm(mockCategories));
    // Test validation logic
  });
});
```

## Performance Optimization

### Current Issues
1. **Unnecessary Re-renders:** Components re-render on every state change
2. **Large Component Trees:** Deep component hierarchies
3. **No Memoization:** Expensive calculations not memoized

### Optimization Strategies

#### 1. React.memo
```typescript
const ProductCard = React.memo(({ product, onQuantityChange }) => {
  // Component logic
});
```

#### 2. useMemo for Expensive Calculations
```typescript
const totalQuantity = useMemo(() => {
  return Object.values(quantities).reduce((sum, qty) => sum + Number(qty), 0);
}, [quantities]);
```

#### 3. useCallback for Event Handlers
```typescript
const handleQuantityChange = useCallback((productId: string, quantity: string) => {
  onQuantityChange(productId, quantity);
}, [onQuantityChange]);
```

#### 4. Component Splitting
```typescript
// Split large components into smaller, focused components
const CategorySection = ({ category }) => (
  <div>
    <CategoryHeader category={category} />
    <ProductGrid products={category.products} />
  </div>
);
```

## Migration Strategy

### Phase 1: Component Extraction
1. Extract reusable UI components
2. Create custom hooks for business logic
3. Implement error boundaries

### Phase 2: State Management
1. Implement Context API or Zustand
2. Reduce prop drilling
3. Normalize component interfaces

### Phase 3: Performance Optimization
1. Add React.memo to expensive components
2. Implement useMemo and useCallback
3. Optimize re-render patterns

### Phase 4: Testing
1. Add unit tests for components
2. Add integration tests for workflows
3. Add custom hook tests 