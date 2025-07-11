import { Category, FormData, EmailCategory, TemplateParams, ShirtVersion } from '../types';
import { categories, PROVIDER_EMAIL } from '../constants';

export const getAllImagePaths = (): string[] => {
  return categories.flatMap(cat => cat.images.map(img => `${cat.path}/${img}`));
};

export const validateFormData = (formData: FormData): string | null => {
  // Check all required fields
  if (!formData.storeNumber.trim() || !formData.storeManager.trim() || !formData.date.trim()) {
    return 'Please fill out all store information fields.';
  }
  
  const allImagePaths = getAllImagePaths();
  for (const path of allImagePaths) {
    const category = categories.find(cat => cat.images.some(img => `${cat.path}/${img}` === path));
    
    if (category?.hasShirtVersions && category.shirtVersions) {
      // For shirt categories, check that ALL versions have a quantity
      const shirtVersions = formData.shirtVersions?.[path];
      if (!shirtVersions) {
        return 'Please enter a quantity for all shirt versions for every product.';
      }
      
      const missingVersions = category.shirtVersions.filter(version => {
        const versionValue = shirtVersions[version as keyof ShirtVersion];
        return !versionValue || versionValue.trim() === '';
      });
      
      if (missingVersions.length > 0) {
        const missingNames = missingVersions.map(version => getVersionDisplayName(version)).join(', ');
        return `Please enter a quantity for all shirt versions: ${missingNames}`;
      }
    } else {
      // For non-shirt categories, check regular quantity
      if (!formData.quantities[path] || formData.quantities[path].trim() === '') {
        return 'Please enter a quantity for every product.';
      }
    }
  }
  
  return null;
};

export const createEmailCategories = (formData: FormData): EmailCategory[] => {
  return categories.map((cat: Category) => ({
    category: cat.name,
    items: cat.images.flatMap((img: string) => {
      const imagePath = `${cat.path}/${img}`;
      const sku = img.split(' ')[0]; // Extract SKU (first part before space)
      const name = img.replace(/\.png$/, ''); // Full product name
      
      if (cat.hasShirtVersions && cat.shirtVersions) {
        // For shirt categories, create separate items for each version
        const shirtVersions = formData.shirtVersions?.[imagePath];
        const items = [];
        
        for (const version of cat.shirtVersions) {
          const versionValue = shirtVersions?.[version as keyof ShirtVersion];
          if (versionValue && versionValue.trim() !== '') {
            const versionName = getVersionDisplayName(version);
            items.push({
              sku,
              name: `${name} (${versionName})`,
              qty: versionValue,
              version
            });
          }
        }
        
        return items;
      } else {
        // For non-shirt categories, use regular quantity
        const quantity = formData.quantities[imagePath] || '0';
        return [{
          sku,
          name,
          qty: quantity
        }];
      }
    })
  }));
};

export const calculateTotalUnits = (emailCategories: EmailCategory[]): number => {
  return emailCategories.reduce((sum: number, cat: EmailCategory) => 
    sum + cat.items.reduce((catSum: number, item) => 
      catSum + Number(item.qty), 0
    ), 0
  );
};

export const createTemplateParams = (formData: FormData): TemplateParams => {
  const emailCategories = createEmailCategories(formData);
  const total_units = calculateTotalUnits(emailCategories);

  return {
    store_number: formData.storeNumber,
    manager_name: formData.storeManager,
    date: formData.date,
    categories: emailCategories,
    total_units: total_units.toString(),
    provider_email: PROVIDER_EMAIL,
  };
};

export const getProductName = (imageName: string): string => {
  return imageName.replace(/\.png$/, '');
};

export const getImagePath = (categoryPath: string, imageName: string): string => {
  return `${categoryPath}/${imageName}`;
};

export const getShirtVersionTotal = (shirtVersions: ShirtVersion | undefined, availableVersions?: string[]): number => {
  if (!shirtVersions || !availableVersions) return 0;
  return availableVersions.reduce((sum, version) => {
    const versionValue = shirtVersions[version as keyof ShirtVersion];
    return sum + Number(versionValue || 0);
  }, 0);
};

export const getVersionDisplayName = (version: string): string => {
  switch (version) {
    case 'tshirt': return 'T-Shirt';
    case 'longsleeve': return 'Long Sleeve';
    case 'hoodie': return 'Hoodie';
    case 'crewneck': return 'Crewneck';
    default: return version;
  }
}; 