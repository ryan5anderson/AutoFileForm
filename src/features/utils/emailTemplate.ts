import { Category, FormData, EmailCategory, EmailItem, TemplateParams, ShirtVersion, ColorVersion } from '../../types';
import { PROVIDER_EMAIL } from '../../constants';
import { getRackToCardMapping } from './imagePath';
import { getVersionDisplayName, getColorDisplayName, hasColorVersions } from './naming';
import { calculateTotalUnits } from './calculations';

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
      
      if (img === 'M100482538 SHHODC Hover DTF on Black or Forest .png' || img === 'M102595496 SH2FDC Custom DTF on Maroon .png') {
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

    const autoAddedItems = Object.values(groupedCards);
    if (autoAddedItems.length > 0) {
      emailCategories.push({
        category: 'Auto-Added Cards',
        items: autoAddedItems
      });
    }
  }

  return emailCategories;
};

export const createTemplateParams = (formData: FormData, categories: Category[]): TemplateParams => {
  const emailCategories = createEmailCategories(formData, categories);
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
