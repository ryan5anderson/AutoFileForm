import { Category, FormData, EmailCategory, EmailItem, TemplateParams, ShirtVersion, ColorVersion } from '../types';
import { categories, PROVIDER_EMAIL } from '../constants';

export const getAllImagePaths = (): string[] => {
  return categories.flatMap(cat => cat.images.map(img => `${cat.path}/${img}`));
};

// Mapping of rack images to their corresponding card items
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

export const validateFormData = (formData: FormData): string | null => {
  // Check all required fields
  if (!formData.company.trim() || !formData.storeNumber.trim() || !formData.storeManager.trim() || !formData.date.trim()) {
    return 'Please fill out all store information fields.';
  }
  
  // All product quantities are now optional - no validation needed for quantities
  return null;
};

export const createEmailCategories = (formData: FormData): EmailCategory[] => {
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
      
      if (img === 'M100482538 SHHODC Hover DTF on Black or Forest .png') {
        // Special case for shirt with both versions and colors (color-major order)
        const comboVersions = formData.shirtColorComboVersions?.[imagePath];
        if (comboVersions && cat.colorVersions && cat.shirtVersions) {
          for (const color of cat.colorVersions) {
            for (const version of cat.shirtVersions) {
              const comboKey = `${version}_${color}`;
              const value = comboVersions[comboKey];
              if (value && value.trim() !== '' && Number(value) > 0) {
                const versionName = getVersionDisplayName(version);
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
      } else if (hasColorVersions(img)) {
        // For color categories, create separate items for each color
        const colorVersions = formData.colorVersions?.[imagePath];
        
        if (colorVersions) {
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
        }
      } else if (cat.hasShirtVersions && cat.shirtVersions) {
        // For shirt categories, create separate items for each version
        const shirtVersions = formData.shirtVersions?.[imagePath];
        
        for (const version of cat.shirtVersions) {
          const versionValue = shirtVersions?.[version as keyof ShirtVersion];
          if (versionValue && versionValue.trim() !== '') {
            const versionName = getVersionDisplayName(version);
            categoryItems.push({
              sku,
              name: `${name} (${versionName})`,
              qty: versionValue,
              version
            });
          }
        }
      } else {
        // For non-shirt categories, use regular quantity
        const quantity = formData.quantities[imagePath] || '0';
        if (Number(quantity) > 0) {
          categoryItems.push({
            sku,
            name,
            qty: quantity
          });

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
        }
      }
    });

    if (categoryItems.length > 0) {
      emailCategories.push({
        category: cat.name,
        items: categoryItems
      });
    }
  });

  // Add auto-added cards as a separate category
  if (autoAddedCards.length > 0) {
    // Group cards by SKU and sum quantities
    const groupedCards: Record<string, EmailItem> = {};
    autoAddedCards.forEach(card => {
      if (groupedCards[card.sku]) {
        groupedCards[card.sku].qty = (Number(groupedCards[card.sku].qty) + Number(card.qty)).toString();
      } else {
        groupedCards[card.sku] = { ...card };
      }
    });

    emailCategories.push({
      category: 'Auto-Added Cards',
      items: Object.values(groupedCards)
    });
  }

  return emailCategories;
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
    company: formData.company,
    store_number: formData.storeNumber,
    manager_name: formData.storeManager,
    date: formData.date,
    order_notes: formData.orderNotes,
    categories: emailCategories,
    total_units: total_units.toString(),
    provider_email: PROVIDER_EMAIL,
  };
};

export const getProductName = (imageName: string): string => {
  const baseName = imageName.replace(/\.(png|jpg)$/, '');
  
  // Custom display names for specific sweatpant items
  const sweatpantDisplayMapping: Record<string, string> = {
    'M100447223 SHVSCD Value DTF Gray Pants .png': 'M100447223 SHVSCD Value DTF Gray Pants Jogger',
    'M100446293 SHPSDS Shake it DTF Gray Pants.png': 'M100446293 SHPSDS Shake it DTF Gray Pants Jogger',
    'M100448649 SHFDDS Force Down DTF Gray Pants.png': 'M100448649 SHFDDS Force Down DTF Gray Pants Straight-Leg'
  };
  
  return sweatpantDisplayMapping[imageName] || baseName;
};

export const getRackDisplayName = (imageName: string): string => {
  // Map rack image names to display names
  const rackDisplayMapping: Record<string, string> = {
    'Michigan_State_University_3FT_Inline_500px.jpg': 'Michigan State University Inline Display',
    'Michigan_state_University_Premium Floor Display 2.0_500px.jpg': 'Michigan State University Premium Floor Display',
    'Michigan_State_University_Tier2_Display_Floor_500px.jpg': 'Michigan State University Floor Display'
  };
  
  return rackDisplayMapping[imageName] || getProductName(imageName);
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

export const hasColorVersions = (imageName: string): boolean => {
  const itemsWithColorVersions = [
    'M100482538 SHHODC Hover DTF on Black or Forest .png',
    'M100489153 SHE1CH Custom Hat on White or Grays .png',
    'M100488283 SHE1CH Custom Logo on White or Gray.png'
  ];
  return itemsWithColorVersions.includes(imageName);
};

export const getColorDisplayName = (color: string): string => {
  switch (color) {
    case 'black': return 'Black';
    case 'forest': return 'Forest';
    case 'white': return 'White Quantity';
    case 'gray': return 'Gray Quantity';
    default: return color;
  }
}; 