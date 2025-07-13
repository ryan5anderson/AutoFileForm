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
            const versionName = getVersionDisplayName(version, img);
            categoryItems.push({
              sku,
              name: `${name} (${versionName})`,
              qty: versionValue,
              version
            });
          }
        }
      } else if (cat.hasDisplayOptions) {
        // For display options, create separate items for each option
        const displayOption = formData.displayOptions?.[imagePath];
        
        if (displayOption) {
          if (displayOption.displayOnly && displayOption.displayOnly.trim() !== '' && Number(displayOption.displayOnly) > 0) {
            categoryItems.push({
              sku,
              name: `${name} (Display Only)`,
              qty: displayOption.displayOnly
            });
          }
          
          if (displayOption.displayStandardCasePack && displayOption.displayStandardCasePack.trim() !== '' && Number(displayOption.displayStandardCasePack) > 0) {
            categoryItems.push({
              sku,
              name: `${name} (Display Standard Case Pack)`,
              qty: displayOption.displayStandardCasePack
            });
          }
        }
      } else if (cat.name === 'Sweatpants/Joggers' && formData.sweatpantJoggerOptions) {
        // For sweatpant/jogger, add each of the four options as a line item
        const sj = formData.sweatpantJoggerOptions[imagePath] || { sweatpantSteel: '', sweatpantOxford: '', joggerSteel: '', joggerOxford: '' };
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
    'M100447223 SHVSCD Value DTF Gray Pants Jogger.png': 'M100447223 SHVSCD Value DTF Gray Pants',
    'M100446293 SHPSDS Shake it DTF Gray Pants Jogger.png': 'M100446293 SHPSDS Shake it DTF Gray Pants',
    'M100448649 SHFDDS Force Down DTF Gray Pants Straight-Leg.png': 'M100448649 SHFDDS Force Down DTF Gray Pants',
  };

  if (sweatpantDisplayMapping[imageName]) return sweatpantDisplayMapping[imageName];

  return baseName;
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

export const getVersionDisplayName = (version: string, imageName?: string): string => {
  // List of images that should use 'Tie-dye' prefix
  const tieDyeImages = [
    'M100965414 SHOUDC OU Go Green DTF on Forest.png',
    'M100482538 SHHODC Hover DTF on Black or Forest .png',
    'M100437896 SHOUDC Over Under DTF on Forest.png',
  ];

  let display = '';
  switch (version) {
    case 'tshirt': display = 'T-Shirt'; break;
    case 'longsleeve': display = 'Long Sleeve T-shirt'; break;
    case 'hoodie': display = 'Hoodie'; break;
    case 'crewneck': display = 'Crew Sweatshirt'; break;
    default: display = version;
  }

  if (imageName && tieDyeImages.includes(imageName)) {
    return `Tie-dye ${display}`;
  }
  return display;
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

export function getQuantityMultiples(imageName: string, categoryName: string): number[] {
  // Lowercase helpers
  const name = imageName.toLowerCase();
  const cat = categoryName.toLowerCase();

  // Explicit override for three specific tie-dye images
  const tieDyeSKUs = [
    'm100965414 shoudc ou go green dtf on forest.png',
    'm100482538 shhodc hover dtf on black or forest .png',
    'm100437896 shoudc over under dtf on forest.png',
  ];
  if (tieDyeSKUs.includes(name)) return [8, 16, 24, 32, 40, 48];

  // Tie-dye (always takes precedence)
  if (name.includes('tie-dye') || cat.includes('tie-dye')) return [8, 16, 24, 32, 40, 48];

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