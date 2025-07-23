# Email System Analysis

## Email System Overview

The email system transforms complex form data into structured email format and sends it via EmailJS. It handles multiple product variations, auto-adds related products, and generates professional order emails.

## Email Service Architecture

### Service Layer
**Location:** `src/services/emailService.ts`

```typescript
export const sendOrderEmail = async (templateParams: TemplateParams): Promise<void> => {
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );
    alert('Order receipt sent to provider');
  } catch (err) {
    console.error('EmailJS error:', err);
    throw new Error('Failed to send email. Please check your EmailJS configuration and try again.');
  }
};
```

### Configuration
**Location:** `src/constants/index.ts`

```typescript
export const EMAILJS_SERVICE_ID = 'service_ehf05es';
export const EMAILJS_TEMPLATE_ID = 'template_t1138kn';
export const EMAILJS_USER_ID = 'f7BZO-3hAYB-QusoW';
export const PROVIDER_EMAIL = 'anderson.t.ryan@gmail.com';
```

## Email Generation Process

### 1. Data Transformation
**Location:** `src/utils/index.ts` - `createEmailCategories()`

The email generation process transforms form data into structured email categories:

```typescript
export const createEmailCategories = (formData: FormData, categories: Category[]): EmailCategory[] => {
  const emailCategories: EmailCategory[] = [];
  const rackToCardMapping = getRackToCardMapping();
  const autoAddedCards: EmailItem[] = [];

  // Process regular categories
  categories.forEach((cat: Category) => {
    const categoryItems: EmailItem[] = [];
    
    cat.images.forEach((img: string) => {
      const imagePath = `${cat.path}/${img}`;
      const sku = img.split(' ')[0]; // Extract SKU (first part before space)
      const name = img.replace(/\.(png|jpg)$/, ''); // Full product name
      
      // Complex conditional logic for different product types...
    });
  });
};
```

### 2. Product Type Handling

#### Regular Products
```typescript
// For non-shirt categories, use regular quantity
const quantity = formData.quantities[imagePath] || '0';
if (Number(quantity) > 0) {
  categoryItems.push({
    sku,
    name,
    qty: quantity
  });
}
```

#### Shirt Versions
```typescript
// For shirt categories, create separate items for each version
const shirtVersions = formData.shirtVersions?.[imagePath];
for (const version of cat.shirtVersions) {
  const versionValue = shirtVersions?.[version as keyof ShirtVersion];
  if (versionValue && versionValue.trim() !== '') {
    const versionName = getVersionDisplayName(version, img);
    categoryItems.push({
      sku,
      name: `${name} (${versionName})`,
      qty: versionValue,
      version
    });
  }
}
```

#### Color Versions
```typescript
// For color categories, create separate items for each color
const colorVersions = formData.colorVersions?.[imagePath];
for (const color of cat.colorVersions || []) {
  const colorValue = colorVersions[color as keyof ColorVersion];
  if (colorValue && colorValue.trim() !== '') {
    const colorName = getColorDisplayName(color);
    categoryItems.push({
      sku,
      name: `${name} (${colorName})`,
      qty: colorValue
    });
  }
}
```

#### Display Options
```typescript
// For display options, create separate items for each option
const displayOption = formData.displayOptions?.[imagePath];
if (displayOption.displayOnly && Number(displayOption.displayOnly) > 0) {
  categoryItems.push({
    sku,
    name: `${name} (Display Only)`,
    qty: displayOption.displayOnly
  });
}
```

### 3. Special Case Handling

#### Shirt Color Combo Versions
```typescript
if (img === 'M100482538 SHHODC Hover DTF on Black or Forest .png') {
  // Special case for shirt with both versions and colors (color-major order)
  const comboVersions = formData.shirtColorComboVersions?.[imagePath];
  if (comboVersions && cat.colorVersions && cat.shirtVersions) {
    for (const color of cat.colorVersions) {
      for (const version of cat.shirtVersions) {
        const comboKey = `${version}_${color}`;
        const value = comboVersions[comboKey];
        if (value && value.trim() !== '' && Number(value) > 0) {
          const versionName = getVersionDisplayName(version, img);
          const colorName = getColorDisplayName(color);
          categoryItems.push({
            sku,
            name: `${name} (${versionName} ${colorName})`,
            qty: value,
            version
          });
        }
      }
    }
  }
}
```

#### Sweatpant/Jogger Options
```typescript
if (cat.name === 'Sweatpants/Joggers' && formData.sweatpantJoggerOptions) {
  const sj = formData.sweatpantJoggerOptions[imagePath] || { 
    sweatpantSteel: '', sweatpantOxford: '', joggerSteel: '', joggerOxford: '' 
  };
  const options = [
    { key: 'sweatpantSteel', label: 'Straight-Leg Steel' },
    { key: 'sweatpantOxford', label: 'Straight-Leg Oxford' },
    { key: 'joggerSteel', label: 'Jogger Steel' },
    { key: 'joggerOxford', label: 'Jogger Oxford' },
  ];
  options.forEach(opt => {
    const qty = sj[opt.key as keyof typeof sj];
    if (qty && Number(qty) > 0) {
      categoryItems.push({
        sku,
        name: `${name} (${opt.label})`,
        qty
      });
    }
  });
}
```

### 4. Auto-Added Products

#### Rack to Card Mapping
```typescript
export const getRackToCardMapping = (): Record<string, { sku: string; name: string }> => {
  return {
    'rack/Michigan_State_University_3FT_Inline_500px.jpg': {
      sku: 'MAGNET_BANNER',
      name: 'Magnet Banner card'
    },
    'rack/Michigan_state_University_Premium Floor Display 2.0_500px.jpg': {
      sku: 'M100516676',
      name: 'M100516676 SHWGCH PFD Header Card'
    },
    'rack/Michigan_State_University_Tier2_Display_Floor_500px.jpg': {
      sku: 'M100516533',
      name: 'M100516533 SHWGCS Spinner Header Card'
    }
  };
};
```

#### Auto-Added Cards Logic
```typescript
// If this is a rack item, add corresponding cards
if (cat.name === 'Display Options') {
  const cardMapping = rackToCardMapping[imagePath];
  if (cardMapping) {
    // Add the card for each quantity of the rack item
    for (let i = 0; i < Number(quantity); i++) {
      autoAddedCards.push({
        sku: cardMapping.sku,
        name: cardMapping.name,
        qty: '1'
      });
    }
  }
}
```

## Email Template System

### Template Location
**File:** `email_template.html`

### Template Structure
```html
<div style="font-family: system-ui, Arial, sans-serif; font-size: 14px; color: #333;">
  <!-- Header -->
  <div style="border-top: 6px solid #166534; padding: 16px">
    <span style="font-size: 18px; font-weight: 600; color: #166534;">
      Internal Purchase Order
    </span>
  </div>

  <!-- Store Information -->
  <div style="font-size: 14px; padding-bottom: 8px; border-bottom: 2px solid #333;">
    <strong>Store #:</strong> {{store_number}} &nbsp;|&nbsp;
    <strong>Manager:</strong> {{manager_name}} &nbsp;|&nbsp;
    <strong>Date:</strong> {{date}}
  </div>

  <!-- Product Categories -->
  {{#categories}}
  <h3 style="margin: 24px 0 8px 0; color: #166534">{{category}}</h3>
  <table style="width: 100%; border-collapse: collapse">
    <thead>
      <tr>
        <th style="text-align: left; padding: 4px 0">Item #</th>
        <th style="text-align: left; padding: 4px 0">Description</th>
        <th style="text-align: right; padding: 4px 0">Qty</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr>
        <td style="padding: 2px 4px">{{sku}}</td>
        <td style="padding: 2px 4px">{{name}}</td>
        <td style="padding: 2px 4px; text-align: right; font-weight: bold">{{qty}}</td>
      </tr>
      {{/items}}
    </tbody>
  </table>
  {{/categories}}

  <!-- Order Notes -->
  {{#order_notes}}
  <div style="margin: 24px 0; padding: 16px; background-color: #f8f9fa;">
    <h3 style="margin: 0 0 8px 0; color: #166534;">Order Notes</h3>
    <div style="white-space: pre-wrap;">{{order_notes}}</div>
  </div>
  {{/order_notes}}

  <!-- Total Units -->
  <table style="width: 100%; border-collapse: collapse; text-align: right">
    <tr>
      <td style="width: 70%"></td>
      <td style="padding: 8px 0"><strong>Total Units</strong></td>
      <td style="padding: 8px 0"><strong>{{total_units}}</strong></td>
    </tr>
  </table>
</div>
```

## Email System Issues

### 1. Complex Data Transformation
**Problem:** Extremely complex email generation logic with hardcoded product handling

**Impact:**
- Difficult to maintain and debug
- Hard to add new product types
- Potential for bugs in special case handling

**Example Issues:**
```typescript
// Hardcoded product logic
if (img === 'M100482538 SHHODC Hover DTF on Black or Forest .png') {
  // Special case handling
}

// Hardcoded category logic
if (cat.name === 'Sweatpants/Joggers' && formData.sweatpantJoggerOptions) {
  // Special handling
}
```

### 2. Hardcoded Product Logic
**Problem:** Product-specific logic scattered throughout email generation

**Impact:**
- Not scalable for new products
- Difficult to maintain
- Inconsistent handling

### 3. No Error Handling
**Problem:** No validation or error handling for malformed data

**Impact:**
- Potential for runtime errors
- No graceful degradation
- Poor user experience

### 4. Email Template Limitations
**Problem:** Hardcoded template with limited customization

**Impact:**
- Not configurable per college
- Hard to modify styling
- No template versioning

### 5. Security Issues
**Problem:** EmailJS credentials exposed in constants

**Impact:**
- Security vulnerability
- Credentials in version control
- No environment-specific configuration

## Email System Improvements

### 1. Normalized Email Generation

**Current Approach:**
```typescript
// Complex conditional logic
if (img === 'specific-product.png') {
  // Special handling
} else if (cat.hasShirtVersions) {
  // Shirt handling
} else if (cat.hasColorVersions) {
  // Color handling
}
```

**Proposed Approach:**
```typescript
interface EmailGenerator {
  canHandle(product: Product): boolean;
  generateItems(product: Product, formData: FormData): EmailItem[];
}

class ShirtVersionGenerator implements EmailGenerator {
  canHandle(product: Product): boolean {
    return product.hasShirtVersions;
  }
  
  generateItems(product: Product, formData: FormData): EmailItem[] {
    // Standardized shirt version logic
  }
}
```

### 2. Configuration-Driven Email Generation

```typescript
interface EmailConfig {
  productTypes: ProductTypeConfig[];
  autoAddRules: AutoAddRule[];
  templateConfig: TemplateConfig;
}

interface ProductTypeConfig {
  type: string;
  generator: EmailGenerator;
  validation: ValidationRule[];
}
```

### 3. Error Handling and Validation

```typescript
class EmailValidationError extends Error {
  constructor(public field: string, public message: string) {
    super(message);
  }
}

const validateEmailData = (formData: FormData, categories: Category[]): void => {
  // Comprehensive validation
  if (!formData.company) {
    throw new EmailValidationError('company', 'Company is required');
  }
  // More validation rules...
};
```

### 4. Template System Improvements

```typescript
interface EmailTemplate {
  id: string;
  name: string;
  html: string;
  variables: TemplateVariable[];
}

interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
}
```

### 5. Environment Configuration

```typescript
// Environment variables
const EMAILJS_CONFIG = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  userId: process.env.REACT_APP_EMAILJS_USER_ID,
  providerEmail: process.env.REACT_APP_PROVIDER_EMAIL,
};
```

## Email System Testing

### Current State
- No visible test files for email system
- No testing strategy documented
- Complex logic not tested

### Recommended Testing Approach

#### 1. Unit Tests for Email Generation
```typescript
describe('createEmailCategories', () => {
  it('should generate correct email items for shirt versions', () => {
    const formData = createMockFormData();
    const categories = createMockCategories();
    
    const result = createEmailCategories(formData, categories);
    
    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(2); // tshirt and hoodie
  });
});
```

#### 2. Integration Tests for Email Service
```typescript
describe('sendOrderEmail', () => {
  it('should send email with correct template parameters', async () => {
    const mockEmailJS = jest.spyOn(emailjs, 'send');
    const templateParams = createMockTemplateParams();
    
    await sendOrderEmail(templateParams);
    
    expect(mockEmailJS).toHaveBeenCalledWith(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );
  });
});
```

#### 3. Template Tests
```typescript
describe('Email Template', () => {
  it('should render correctly with all variables', () => {
    const template = loadEmailTemplate();
    const variables = createMockVariables();
    
    const result = renderTemplate(template, variables);
    
    expect(result).toContain('Internal Purchase Order');
    expect(result).toContain(variables.store_number);
  });
});
```

## Performance Considerations

### Current Issues
1. **Synchronous Processing:** Complex email generation blocks UI
2. **Large Data Processing:** No optimization for large orders
3. **No Caching:** Email generation not cached

### Optimization Strategies

#### 1. Async Processing
```typescript
const generateEmailAsync = async (formData: FormData, categories: Category[]) => {
  return new Promise<EmailCategory[]>((resolve) => {
    setTimeout(() => {
      const result = createEmailCategories(formData, categories);
      resolve(result);
    }, 0);
  });
};
```

#### 2. Web Workers
```typescript
// Move email generation to web worker
const emailWorker = new Worker('/email-worker.js');
emailWorker.postMessage({ formData, categories });
emailWorker.onmessage = (event) => {
  const emailCategories = event.data;
  // Process results
};
```

#### 3. Memoization
```typescript
const memoizedEmailGeneration = useMemo(() => {
  return createEmailCategories(formData, categories);
}, [formData, categories]);
```

## Migration Strategy

### Phase 1: Error Handling
1. Add comprehensive validation
2. Implement error boundaries
3. Add graceful error handling

### Phase 2: Code Refactoring
1. Extract email generators
2. Normalize data transformation
3. Remove hardcoded logic

### Phase 3: Configuration
1. Move to environment variables
2. Implement template system
3. Add configuration validation

### Phase 4: Testing
1. Add unit tests for email generation
2. Add integration tests for email service
3. Add template tests 