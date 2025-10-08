import { FormData, EmailCategory, ShirtVersion, SizeCounts } from '../../types';

export const validateFormData = (formData: FormData): string | null => {
  // Check all required fields
  if (!formData.company.trim() || !formData.storeNumber.trim() || !formData.storeManager.trim() || !formData.date.trim()) {
    return 'Please fill out all store information fields.';
  }
  
  // All product quantities are now optional - no validation needed for quantities
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

export function calcTotals(counts: SizeCounts, packSize: number = 7): Totals {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return {
    total,
    packs: Math.floor(total / packSize),
    remainder: total % packSize,
    needed: (packSize - (total % packSize)) % packSize,
    isValid: total > 0 && total % packSize === 0,
  };
}

export function getQuantityMultiples(imageName: string, categoryName: string): number[] {
  // Lowercase helpers
  const name = imageName.toLowerCase();
  const cat = categoryName.toLowerCase();

  // Women (force 8)
  if (cat.includes('women')) return [8, 16, 24, 32, 40, 48];

  // Crew/Crewneck/Crew Sweatshirt
  if (name.includes('crew') || cat.includes('crew')) return [6, 12, 18, 24, 30, 36];

  // Hoodie
  if (name.includes('hoodie') || cat.includes('hoodie')) return [8, 16, 24, 32, 40, 48];

  // T-shirts (Unisex, Long Sleeve)
  if (cat.includes('tshirt') || cat.includes('longsleeve') || cat.includes('long sleeve') || cat === 'longsleeve' || cat === 'long sleeve' || cat === 'tshirt') return [7, 14, 21, 28, 35, 42];

  // Sweatpants/Joggers
  if (cat.includes('sweatpant') || cat.includes('jogger')) return [6, 12, 18, 24, 30, 36];

  // Shorts
  if (cat.includes('short')) return [8, 16, 24, 32, 40, 48];

  // Flannels
  if (cat.includes('flannel')) return [8, 16, 24, 32, 40, 48];

  // Jackets
  if (cat.includes('jacket') || cat.includes('raincoat')) return [6, 12, 18, 24, 30, 36];

  // Cap & knit Cap
  if (cat.includes('cap') || cat.includes('beanie') || cat.includes('hat')) return [6, 12, 18, 24, 30, 36];

  // Socks
  if (cat.includes('sock')) return [6, 12, 18, 24, 30, 36];

  // Bottle
  if (cat.includes('bottle')) return [1, 2, 3, 4, 5, 6];

  // Default
  return [6, 12, 18, 24, 30, 36];
}
