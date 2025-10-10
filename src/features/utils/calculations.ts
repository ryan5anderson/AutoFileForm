import { FormData, EmailCategory, ShirtVersion, SizeCounts, Size } from '../../types';
import { getPackSize } from '../../config/packSizes';

export const validateFormData = (formData: FormData): string | null => {
  // Check all required fields
  if (!formData.company.trim() || !formData.storeNumber.trim() || !formData.storeManager.trim() || !formData.date.trim()) {
    return 'Please fill out all store information fields.';
  }

  // Validate pack sizes for all selected products

  // Validate simple quantities
  if (formData.quantities) {
    for (const [imagePath, quantity] of Object.entries(formData.quantities)) {
      if (quantity && Number(quantity) > 0) {
        // We need to determine the category path from the imagePath
        // For now, we'll use a simple heuristic - this should be improved
        const categoryPath = 'default'; // This needs to be properly determined
        const packSize = getPackSize(categoryPath, undefined, imagePath);
        if (packSize > 1 && Number(quantity) % packSize !== 0) {
          return `Invalid quantity for product. Must be in multiples of ${packSize}.`;
        }
      }
    }
  }

  // Validate shirt size counts
  if (formData.shirtSizeCounts) {
    for (const [imagePath, versions] of Object.entries(formData.shirtSizeCounts)) {
      for (const [version, sizeCounts] of Object.entries(versions as any)) {
        const totalQuantity = Object.values(sizeCounts as SizeCounts).reduce((sum: number, qty: number) => sum + qty, 0);
        if (totalQuantity > 0) {
          // We need to determine the category path - this is complex and may need to be passed in
          const categoryPath = 'tshirt'; // Default assumption - this needs improvement
          const packSize = getPackSize(categoryPath, version, imagePath);
          if (packSize > 1 && totalQuantity % packSize !== 0) {
            return `Invalid total quantity for product. Must be in multiples of ${packSize}.`;
          }
        }
      }
    }
  }

  // Validate shirt color size counts
  if (formData.shirtColorSizeCounts) {
    for (const [imagePath, colorGroups] of Object.entries(formData.shirtColorSizeCounts)) {
      for (const [, versions] of Object.entries(colorGroups as any)) {
        for (const [version, sizeCounts] of Object.entries(versions as any)) {
          const totalQuantity = Object.values(sizeCounts as SizeCounts).reduce((sum: number, qty: number) => sum + qty, 0);
          if (totalQuantity > 0) {
            const categoryPath = 'tshirt'; // Default assumption
            const packSize = getPackSize(categoryPath, version, imagePath);
            if (packSize > 1 && totalQuantity % packSize !== 0) {
              return `Invalid total quantity for product. Must be in multiples of ${packSize}.`;
            }
          }
        }
      }
    }
  }

  return null;
};

export const calculateTotalUnits = (emailCategories: EmailCategory[]): number => {
  return emailCategories.reduce((sum: number, cat: EmailCategory) => 
    sum + cat.items.reduce((catSum: number, item: any) => 
      catSum + Number(item.qty), 0
    ), 0
  );
};

export const getShirtVersionTotal = (shirtVersions: ShirtVersion | undefined, availableVersions?: string[]): number => {
  if (!shirtVersions || !availableVersions) return 0;
  return availableVersions.reduce((sum, version) => {
    const versionValue = shirtVersions[version as keyof ShirtVersion];
    return sum + Number(versionValue || 0);
  }, 0);
};

export type Totals = {
  total: number;
  packs: number;
  remainder: number;
  needed: number;
  isValid: boolean;
};

export function calcTotals(counts: SizeCounts, packSize: number = 7, allowAnyQuantity: boolean = false): Totals {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const isValid = total > 0 && (allowAnyQuantity || total % packSize === 0);
  return {
    total,
    packs: Math.floor(total / packSize),
    remainder: total % packSize,
    needed: allowAnyQuantity ? 0 : (packSize - (total % packSize)) % packSize,
    isValid,
  };
}

export function getQuantityMultiples(imageName: string, categoryName: string, categoryPath?: string, version?: string): number[] {
  // Import getPackSize here to avoid circular dependency issues
  const { getPackSize } = require('../../config/packSizes');

  // Get the pack size for this category/version
  const packSize = categoryPath ? getPackSize(categoryPath, version, imageName) : 7;

  // Generate quantity multiples based on pack size
  // Show up to 6 packs worth of quantities (e.g., for pack size 4: 4, 8, 12, 16, 20, 24)
  const multiples: number[] = [];
  for (let i = 1; i <= 6; i++) {
    multiples.push(packSize * i);
  }

  // Special handling for bottles (allow individual quantities)
  if (categoryName.toLowerCase().includes('bottle')) {
    return [1, 2, 3, 4, 5, 6];
  }

  // For all other categories, return multiples based on pack size
  return multiples;
}

export function getSizeOptions(categoryPath: string, version?: string): Size[] {
  // Socks use different sizing
  if (categoryPath.includes('sock')) {
    return ['SM', 'XL'] as any;
  }

  // T-shirts and hoodies get XXXL option (but not women's t-shirts)
  if ((version === 'tshirt' || version === 'hoodie') && !categoryPath.includes('women')) {
    return ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  }

  // Women's t-shirts get S-XXL
  if (version === 'tshirt' && categoryPath.includes('women')) {
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }

  // Longsleeve and crewneck get S-XXL
  if (version === 'longsleeve' || version === 'crewneck') {
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }

  // Jackets get S-XXL (check both version and category path)
  if (version === 'jacket' || categoryPath.includes('jacket')) {
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }

  // Sweatpants and joggers get S-XL
  if (categoryPath === 'pants' || version === 'sweatpants' || version === 'joggers' || categoryPath.includes('sweatpant') || categoryPath.includes('jogger')) {
    return ['S', 'M', 'L', 'XL'];
  }

  // Shorts get S-XL
  if (version === 'shorts' || categoryPath.includes('short')) {
    return ['S', 'M', 'L', 'XL'];
  }

  // Flannels get S-XL
  if (version === 'flannels' || categoryPath.includes('flannel')) {
    return ['S', 'M', 'L', 'XL'];
  }

  // Default sizes for all other items (including women's t-shirts)
  return ['S', 'M', 'L', 'XL', 'XXL'];
}
