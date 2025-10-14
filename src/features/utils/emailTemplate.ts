import { Category, FormData, EmailCategory, EmailItem, TemplateParams, ShirtVersion, SizeCounts } from '../../types';
import { PROVIDER_EMAIL } from '../../constants';
import { getRackToCardMapping } from './imagePath';
import { getVersionDisplayName } from './naming';
import { calculateTotalUnits } from './calculations';
import { getFilteredShirtVersions } from './index';

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
        // For shirt categories, check for color-based size counts first, then regular size counts
        const colorSizeCountsByVersion = formData.shirtColorSizeCounts?.[imagePath];
        const sizeByVersion = formData.shirtSizeCounts?.[imagePath] || {};
        const filteredVersions = getFilteredShirtVersions(img, cat.shirtVersions);

        // Check for color-based size counts first
        if (colorSizeCountsByVersion) {
          // Combine all colors and sizes for this product version
          const combinedBreakdown: string[] = [];

          for (const version of filteredVersions) {
            const byColor = colorSizeCountsByVersion[version as keyof ShirtVersion];
            if (byColor) {
              const colorBreakdown = Object.entries(byColor)
                .filter(([_, counts]) => counts && Object.values(counts).some(qty => qty > 0))
                .map(([colorName, counts]) => {
                  if (!counts) return '';
                  const sizeOrder: ('S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL'|'SM')[] = ['S','M','L','XL','XXL','XXXL','S/M','L/XL','SM'];
                  const sizePieces = sizeOrder
                    .map(sz => {
                      const val = counts[sz] || 0;
                      return val > 0 ? `${sz}${val}` : '';
                    })
                    .filter(Boolean)
                    .join(' ');

                  const totalForColor = Object.values(counts).reduce((a, b) => a + b, 0);
                  return `${colorName}: ${totalForColor}${sizePieces ? ` (${sizePieces})` : ''}`;
                })
                .filter(Boolean)
                .join(', ');

              if (colorBreakdown) {
                const versionName = getVersionDisplayName(version, img);
                const totalForVersion = Object.values(byColor).reduce((sum, counts) =>
                  sum + Object.values(counts || {}).reduce((a, b) => a + b, 0), 0);

                if (totalForVersion > 0) {
                  combinedBreakdown.push(`${versionName}: ${totalForVersion} (${colorBreakdown})`);
                }
              }
            }
          }

          if (combinedBreakdown.length > 0) {
            const totalQty = combinedBreakdown.reduce((sum, item) => {
              const match = item.match(/: (\d+)/);
              return sum + (match ? parseInt(match[1]) : 0);
            }, 0);

            categoryItems.push({
              sku,
              name: `${name} (${combinedBreakdown.join('; ')})`,
              qty: String(totalQty)
            });
          }
        } else {
          // Fall back to regular size counts (no colors)
          for (const version of filteredVersions) {
            const counts = sizeByVersion[version as keyof ShirtVersion];
            const vTotal = counts ? Object.values(counts).reduce((a,b)=>a+b,0) : 0;
            if (vTotal > 0) {
              const versionName = getVersionDisplayName(version, img);
              // Build size detail like S7 M7 XL7
              const sizeOrder: ('S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL'|'SM')[] = ['S','M','L','XL','XXL','XXXL','S/M','L/XL','SM'];
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
        }
      } else if (cat.hasSizeOptions) {
        // For size options categories (flannels, jackets, etc.), create items using size counts
        const sizeByVersion = (formData.shirtSizeCounts?.[imagePath] || {}) as Record<string, SizeCounts>;

        // Determine which version keys to look for based on product type
        let versionOrder: string[];
        if (cat.hasShirtVersions) {
          // For T-shirts and similar products with shirt versions
          versionOrder = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'];
        } else {
          // For products like jackets, flannels, etc. - use whatever keys are actually present
          versionOrder = Object.keys(sizeByVersion);
        }

        for (const version of versionOrder) {
          const counts = sizeByVersion[version] as SizeCounts;
          const vTotal = counts ? Object.values(counts).reduce((a,b)=>a+b,0) : 0;
          if (vTotal > 0) {
            // Build size detail like S7 M7 XL7
            const sizeOrder: ('S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL'|'SM')[] = ['S','M','L','XL','XXL','XXXL','S/M','L/XL','SM'];
            const sizePieces = counts ? sizeOrder
              .map(sz => {
                const val = counts[sz] || 0;
                return val > 0 ? `${sz}${val}` : '';
              })
              .filter(Boolean)
              .join(' ') : '';

            // For shirt versions, use the standard labels
            let versionLabel = version;
            if (cat.hasShirtVersions) {
              const labels: Record<string, string> = { tshirt: 'T-Shirt', longsleeve: 'Long Sleeve', hoodie: 'Hoodie', crewneck: 'Crew' };
              versionLabel = labels[version as keyof typeof labels] || version;
            }

            categoryItems.push({
              sku,
              name: `${name} (${versionLabel}${sizePieces ? ` - ${sizePieces}` : ''})`,
              qty: String(vTotal)
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
        // For pants with style/color/size options
        const pOptions = formData.pantOptions[imagePath];
        if (pOptions) {
          // Helper function to process size counts for a specific style and color
          const processSizeCounts = (styleName: string, colorName: string, sizeCounts: any) => {
            if (!sizeCounts || typeof sizeCounts !== 'object') return;

            // Build size detail like S7 M7 XL7
            const sizeOrder: ('S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL'|'SM')[] = ['S','M','L','XL','XXL','XXXL','S/M','L/XL','SM'];
            const sizePieces = sizeOrder
              .map(sz => {
                const val = sizeCounts[sz] || 0;
                return val > 0 ? `${sz}${val}` : '';
              })
              .filter(Boolean)
              .join(' ');

            const totalQty = Object.values(sizeCounts).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0);

            if (totalQty > 0) {
              categoryItems.push({
                sku,
                name: `${name} (${styleName} - ${colorName}${sizePieces ? ` - ${sizePieces}` : ''})`,
                qty: String(totalQty)
              });
            }
          };

          // Process Sweatpants
          if (pOptions.sweatpants) {
            processSizeCounts('Sweatpants', 'Steel', pOptions.sweatpants.steel);
            processSizeCounts('Sweatpants', 'Black', pOptions.sweatpants.black);
            processSizeCounts('Sweatpants', 'Dark Navy', pOptions.sweatpants.darkNavy);
          }

          // Process Joggers
          if (pOptions.joggers) {
            processSizeCounts('Joggers', 'Steel', pOptions.joggers.steel);
            processSizeCounts('Joggers', 'Dark Heather', pOptions.joggers.darkHeather);
          }
        }
      } else if (cat.name === 'Sweatpants/Joggers' && formData.sweatpantJoggerOptions) {
        // For sweatpant/jogger (legacy), add each of the four options as a line item
        const sj = formData.sweatpantJoggerOptions[imagePath] || { sweatpantSteel: '', sweatpantBlack: '', sweatpantDarkNavy: '', joggerSteel: '', joggerDarkHeather: '' };
        const options = [
          { key: 'sweatpantSteel', label: 'Straight-Leg Steel' },
          { key: 'sweatpantBlack', label: 'Straight-Leg Black' },
          { key: 'sweatpantDarkNavy', label: 'Straight-Leg Dark Navy' },
          { key: 'joggerSteel', label: 'Jogger Steel' },
          { key: 'joggerDarkHeather', label: 'Jogger Dark Heather' },
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
