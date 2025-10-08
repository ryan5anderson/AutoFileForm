import { Category, FormData, EmailCategory, EmailItem, TemplateParams, ShirtVersion } from '../../types';
import { PROVIDER_EMAIL } from '../../constants';
import { getRackToCardMapping } from './imagePath';
import { getVersionDisplayName } from './naming';
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
      
      if (cat.hasShirtVersions && cat.shirtVersions) {
        // For shirt categories, create separate items for each version using size counts totals
        const sizeByVersion = formData.shirtSizeCounts?.[imagePath] || {};
        for (const version of cat.shirtVersions) {
          const counts = sizeByVersion[version as keyof ShirtVersion];
          const vTotal = counts ? Object.values(counts).reduce((a,b)=>a+b,0) : 0;
          if (vTotal > 0) {
            const versionName = getVersionDisplayName(version, img);
            // Build size detail like S7 M7 XL7
            const sizeOrder: ('S'|'M'|'L'|'XL'|'XXL'|'S/M'|'L/XL')[] = ['S','M','L','XL','XXL','S/M','L/XL'];
            const sizePieces = counts ? sizeOrder
              .map(sz => {
                const val = counts[sz] || 0;
                return val > 0 ? `${sz}${val}` : '';
              })
              .filter(Boolean)
              .join(' ') : '';
            categoryItems.push({
              sku,
              name: `${name} (${versionName}${sizePieces ? ` - ${sizePieces}` : ''})`,
              qty: String(vTotal),
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
      } else if (cat.hasPantOptions && formData.pantOptions) {
        // For pants with style/color options
        const pOptions = formData.pantOptions[imagePath];
        if (pOptions) {
          // Sweatpants
          if (pOptions.sweatpants?.steel && Number(pOptions.sweatpants.steel) > 0) {
            categoryItems.push({
              sku,
              name: `${name} (Sweatpants - Steel)`,
              qty: pOptions.sweatpants.steel
            });
          }
          if (pOptions.sweatpants?.oxford && Number(pOptions.sweatpants.oxford) > 0) {
            categoryItems.push({
              sku,
              name: `${name} (Sweatpants - Oxford)`,
              qty: pOptions.sweatpants.oxford
            });
          }
          // Joggers
          if (pOptions.joggers?.steel && Number(pOptions.joggers.steel) > 0) {
            categoryItems.push({
              sku,
              name: `${name} (Joggers - Steel)`,
              qty: pOptions.joggers.steel
            });
          }
          if (pOptions.joggers?.oxford && Number(pOptions.joggers.oxford) > 0) {
            categoryItems.push({
              sku,
              name: `${name} (Joggers - Oxford)`,
              qty: pOptions.joggers.oxford
            });
          }
        }
      } else if (cat.name === 'Sweatpants/Joggers' && formData.sweatpantJoggerOptions) {
        // For sweatpant/jogger (legacy), add each of the four options as a line item
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
