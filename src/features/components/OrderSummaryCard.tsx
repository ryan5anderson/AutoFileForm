import React from 'react';

import { ShirtVersion, DisplayOption, SweatpantJoggerOption, PantOption, SizeCounts, Size, ShirtColorSizeCounts, InfantSizeCounts } from '../../types';
import { hasColorOptions } from '../utils';

interface OrderSummaryCardProps {
  categoryPath: string;
  imageName: string;
  categoryName: string;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  shirtSizeCounts?: Record<string, Record<string, SizeCounts>>;
  shirtColorSizeCounts?: ShirtColorSizeCounts;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  pantOptions?: Record<string, PantOption>;
  colorOptions?: Record<string, Record<string, string>>;
  infantSizeCounts?: Record<string, InfantSizeCounts>;
  invalidProductPaths?: string[];
  college?: string;
  hasShirtVersions?: boolean;
  hasSizeOptions?: boolean;
  hasPantOptions?: boolean;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  categoryPath,
  imageName,
  categoryName,
  quantities,
  shirtVersions = {},
  shirtSizeCounts = {},
  shirtColorSizeCounts = {},
  displayOptions = {},
  sweatpantJoggerOptions = {},
  pantOptions = {},
  colorOptions = {},
  infantSizeCounts = {},
  invalidProductPaths = [],
  college,
  hasShirtVersions = false,
  hasSizeOptions = false,
  hasPantOptions = false
}) => {
  const imagePath = `${categoryPath}/${imageName}`;

  const getQuantityInfo = () => {
    // Handle display options
    if (categoryName === 'Display Options') {
      const displayOption = displayOptions[imagePath];
      if (displayOption) {
        const totalQty = Number(displayOption.displayOnly || 0) + Number(displayOption.displayStandardCasePack || 0);
        if (totalQty > 0) {
          const details = [];
          if (displayOption.displayOnly && Number(displayOption.displayOnly) > 0) {
            details.push(`Display Only: ${displayOption.displayOnly}`);
          }
          if (displayOption.displayStandardCasePack && Number(displayOption.displayStandardCasePack) > 0) {
            details.push(`Case Pack: ${displayOption.displayStandardCasePack}`);
          }
          return { total: totalQty, details: details.join(', ') };
        }
      }
      return null;
    }

    // Handle pants with style/color/size options
    if (hasPantOptions) {
      const pOptions = pantOptions[imagePath];
      if (pOptions) {
        const processStyleCounts = (styleOptions: Record<string, SizeCounts> | undefined, styleName: string) => {
          if (!styleOptions) return { total: 0, details: [] };

          let styleTotal = 0;
          const details: string[] = [];

          Object.entries(styleOptions).forEach(([colorName, sizeCounts]) => {
            if (sizeCounts && typeof sizeCounts === 'object') {
              const colorTotal = Object.values(sizeCounts).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0);
              if (colorTotal > 0) {
                styleTotal += colorTotal;

                // Build size detail like S7 M7 XL7
                const sizeOrder: Size[] = ['XS','S','M','L','XL','XXL','XXXL','S/M','L/XL'];
                const sizePieces = sizeOrder
                  .map(sz => {
                    const val = sizeCounts[sz] || 0;
                    return val > 0 ? `${sz}${val}` : '';
                  })
                  .filter(Boolean)
                  .join(' ');

                details.push(`${styleName} ${colorName}: ${colorTotal}${sizePieces ? ` (${sizePieces})` : ''}`);
              }
            }
          });

          return { total: styleTotal, details };
        };

        const sweatpantsInfo = processStyleCounts(pOptions.sweatpants, 'Sweatpants');
        const joggersInfo = processStyleCounts(pOptions.joggers, 'Joggers');

        const totalQty = sweatpantsInfo.total + joggersInfo.total;
        const allDetails = [...sweatpantsInfo.details, ...joggersInfo.details];

        if (totalQty > 0) {
          return { total: totalQty, details: allDetails.join(', ') };
        }
      }
      return null;
    }

    // Handle sweatpants/joggers (legacy)
    if (categoryName === 'Sweatpants/Joggers') {
      const sjOptions = sweatpantJoggerOptions[imagePath];
      if (sjOptions) {
        const totalQty = Object.values(sjOptions).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
        if (totalQty > 0) {
          const details = [];
          if (sjOptions.sweatpantSteel && Number(sjOptions.sweatpantSteel) > 0) {
            details.push(`Steel: ${sjOptions.sweatpantSteel}`);
          }
          if (sjOptions.sweatpantBlack && Number(sjOptions.sweatpantBlack) > 0) {
            details.push(`Black: ${sjOptions.sweatpantBlack}`);
          }
          if (sjOptions.sweatpantDarkNavy && Number(sjOptions.sweatpantDarkNavy) > 0) {
            details.push(`Dark Navy: ${sjOptions.sweatpantDarkNavy}`);
          }
          if (sjOptions.joggerSteel && Number(sjOptions.joggerSteel) > 0) {
            details.push(`Jogger Steel: ${sjOptions.joggerSteel}`);
          }
          if (sjOptions.joggerDarkHeather && Number(sjOptions.joggerDarkHeather) > 0) {
            details.push(`Jogger Dark Heather: ${sjOptions.joggerDarkHeather}`);
          }
          return { total: totalQty, details: details.join(', ') };
        }
      }
      return null;
    }

    // Handle infant products with 6M/12M sizes FIRST (only check by image name, not category name)
    // This allows youth products in "Youth & Infant" category to use shirtSizeCounts
    // Must check BEFORE size options/shirt versions checks to avoid conflicts
    if (imageName.toLowerCase().includes('infant') || imageName.toLowerCase().includes('onsie')) {
      const infantCounts = infantSizeCounts[imagePath];
      if (infantCounts) {
        const totalQty = Object.values(infantCounts).reduce((sum: number, count: number) => sum + count, 0);
        if (totalQty > 0) {
          const details: string[] = [];
          if (infantCounts['6M'] > 0) {
            details.push(`6M: ${infantCounts['6M']}`);
          }
          if (infantCounts['12M'] > 0) {
            details.push(`12M: ${infantCounts['12M']}`);
          }
          return { total: totalQty, details: details.join(', ') };
        }
      }
      return null;
    }

    // Handle shirt versions or size options (size breakdown)
    if (hasShirtVersions) {
      // Check for color-based size counts first
      if (shirtColorSizeCounts[imagePath]) {
        const colorSizeCountsByVersion = shirtColorSizeCounts[imagePath];
        const versionOrder: (keyof ShirtVersion)[] = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'];
        const totalQty = versionOrder.reduce((sum, vk) => {
          const byColor = colorSizeCountsByVersion[vk];
          if (!byColor) return sum;
          return sum + Object.values(byColor).reduce((colorSum, counts) => {
            if (!counts) return colorSum;
            return colorSum + Object.values(counts).reduce((sizeSum: number, qty: number) => sizeSum + qty, 0);
          }, 0);
        }, 0);

        if (totalQty > 0) {
          const labels: Record<string, string> = { tshirt: 'T-Shirt', longsleeve: 'Long Sleeve', hoodie: 'Hoodie', crewneck: 'Crew' };
          
          // Group by color first
          const colorGroups: Map<string, string[]> = new Map();

          versionOrder.forEach((vk) => {
            const byColor = colorSizeCountsByVersion[vk];
            if (byColor) {
              const versionName = labels[vk as keyof typeof labels];
              Object.entries(byColor)
                .filter(([_, counts]) => counts && Object.values(counts).some(qty => qty > 0))
                .forEach(([colorName, counts]) => {
                  if (!counts) return;
                  const sizeOrder: Size[] = ['XS','S','M','L','XL','XXL','XXXL','S/M','L/XL'];
                  
                  sizeOrder.forEach(sz => {
                    const val = counts[sz] || 0;
                    if (val > 0) {
                      if (!colorGroups.has(colorName)) {
                        colorGroups.set(colorName, []);
                      }
                      colorGroups.get(colorName)!.push(`${versionName} ${sz}:${val}`);
                    }
                  });
                });
            }
          });

          // Format as "Color: Version Size:qty ; Version Size:qty"
          const colorLines: string[] = [];
          colorGroups.forEach((versionSizes, colorName) => {
            colorLines.push(`${colorName}: ${versionSizes.join(' ; ')}`);
          });

          return { total: totalQty, details: colorLines.join(' ; ') };
        }
      }

      // Regular size counts - combine all versions into one line
      const sizeByVersion = shirtSizeCounts[imagePath] || {};
      const versionOrder: (keyof ShirtVersion)[] = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'];
      const versionDetails: string[] = [];
      let totalQty = 0;

      versionOrder.forEach((vk) => {
        const c = sizeByVersion[vk];
        const vTotal = c ? Object.values(c).reduce((a,b)=>a+b,0) : 0;
        if (vTotal > 0) {
          totalQty += vTotal;
          const labels: Record<string, string> = { tshirt: 'T-Shirt', longsleeve: 'Long Sleeve', hoodie: 'Hoodie', crewneck: 'Crew' };
          const sizeOrder: Size[] = ['XS','S','M','L','XL','XXL','XXXL','S/M','L/XL'];
          const sizePieces = c ? sizeOrder
            .map((sz: Size) => {
              const val = c[sz] || 0;
              return val > 0 ? `${sz}: ${val}` : '';
            })
            .filter(Boolean)
            .join(', ') : '';
          const detail = `${labels[vk as keyof typeof labels]}${sizePieces ? ` ${sizePieces}` : ''}`;
          versionDetails.push(detail);
        }
      });

      if (totalQty > 0) {
        return { total: totalQty, details: versionDetails.join(' ; ') };
      }
      return null;
    }

    // Handle size options for non-shirt categories (flannels, jackets, shorts, socks)
    // Check if this category has size options but not shirt versions
    if (hasSizeOptions) {
      // Check for color-based size counts first
      if (shirtColorSizeCounts[imagePath]) {
        const colorSizeCountsByVersion = shirtColorSizeCounts[imagePath];
        const versionOrder: (keyof ShirtVersion)[] = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'];
        const totalsByVersion = versionOrder.map((vk) => {
          const byColor = colorSizeCountsByVersion[vk];
          if (!byColor) return 0;
          return Object.values(byColor).reduce((colorSum, counts) => {
            if (!counts) return colorSum;
            return colorSum + Object.values(counts).reduce((sizeSum: number, qty: number) => sizeSum + qty, 0);
          }, 0);
        });
        const totalQty = totalsByVersion.reduce((a: number, b: number) => a + b, 0);
        if (totalQty > 0) {
          const labels: Record<string, string> = { tshirt: 'T-Shirt', longsleeve: 'Long Sleeve', hoodie: 'Hoodie', crewneck: 'Crew' };
          const details: string[] = [];
          versionOrder.forEach((vk, i) => {
            const vTotal = totalsByVersion[i];
            if (vTotal > 0) {
              const byColor = colorSizeCountsByVersion[vk];
              if (byColor) {
                const colorBreakdown = Object.entries(byColor)
                  .filter(([_, counts]) => counts && Object.values(counts).some(qty => qty > 0))
                  .map(([colorName, counts]) => {
                    if (!counts) return '';
                    const sizeOrder: Size[] = ['XS','S','M','L','XL','XXL','XXXL','S/M','L/XL'];
                    const sizePieces = sizeOrder
                      .map(sz => {
                        const val = counts[sz] || 0;
                        return val > 0 ? `${sz}${val}` : '';
                      })
                      .filter(Boolean)
                      .join(' ');
                    return `${colorName}: ${Object.values(counts).reduce((a, b) => a + b, 0)}${sizePieces ? ` (${sizePieces})` : ''}`;
                  })
                  .filter(Boolean)
                  .join(', ');
                details.push(`${labels[vk as keyof typeof labels]}: ${vTotal} (${colorBreakdown})`);
              }
            }
          });
          return { total: totalQty, details: details.join('; ') };
        }
      }

      // Check for regular size counts
      if (shirtSizeCounts[imagePath]) {
        const sizeByVersion = shirtSizeCounts[imagePath] || {};

        // Determine which version keys to look for based on product type
        let versionOrder: string[];
        if (hasShirtVersions) {
          // For T-shirts and similar products with shirt versions
          versionOrder = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'];
        } else {
          // For products like jackets, flannels, etc. - use whatever keys are actually present
          versionOrder = Object.keys(sizeByVersion);
        }

        const totalsByVersion = versionOrder.map((vk) => {
          const c = sizeByVersion[vk];
          return c ? Object.values(c).reduce((a,b)=>a+b,0) : 0;
        });
        const totalQty = totalsByVersion.reduce((a: number, b: number) => a + b, 0);
        if (totalQty > 0) {
          const details: string[] = [];
          versionOrder.forEach((vk, i) => {
            const vTotal = totalsByVersion[i];
            if (vTotal > 0) {
              const c = sizeByVersion[vk];
              // Include sock sizes in the size order
              const sizeOrder: Size[] = ['XS','S','M','L','XL','XXL','XXXL','S/M','L/XL','SM'];
              const sizePieces = c ? sizeOrder
                .map((sz: Size) => {
                  const val = c[sz] || 0;
                  return val > 0 ? `${sz} ${val}` : '';
                })
                .filter(Boolean)
                .join(' ') : '';

              // For shirt versions, use the standard labels
              let versionLabel = vk;
              if (hasShirtVersions) {
                const labels: Record<string, string> = { tshirt: 'T-Shirt', longsleeve: 'Long Sleeve', hoodie: 'Hoodie', crewneck: 'Crew' };
                versionLabel = labels[vk as keyof typeof labels] || vk;
              }

              // Special handling for socks - show just the size breakdown
              if (imageName.toLowerCase().includes('sock') && sizePieces) {
                details.push(sizePieces);
              } else {
                details.push(`${versionLabel}: ${vTotal}${sizePieces ? ` (${sizePieces})` : ''}`);
              }
            }
          });
          return { total: totalQty, details: details.join('; ') };
        }
      }

      // For products with size options but no shirt versions, check regular quantities
      if (!hasShirtVersions) {
        const quantity = quantities[imagePath];
        if (quantity && Number(quantity) > 0) {
          return { total: Number(quantity), details: 'Quantity' };
        }

        // Also check for color-based quantities
        if (hasColorOptions(imageName)) {
          const colorQty = colorOptions[imagePath];
          if (colorQty) {
            const totalQty = Object.values(colorQty).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
            if (totalQty > 0) {
              return { total: totalQty, details: 'Quantity' };
            }
          }
        }
      }

      return null;
    }

    // Handle non-shirt items with color options (like hats)
    if (hasColorOptions(imageName)) {
      const colorQty = colorOptions[imagePath];
      if (colorQty) {
        const totalQty = Object.values(colorQty).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
        if (totalQty > 0) {
          // Create one-line format like "White 6 Grays 6"
          const colorBreakdown = Object.entries(colorQty)
            .filter(([_, qty]) => Number(qty) > 0)
            .map(([colorName, qty]) => `${colorName} ${qty}`)
            .join(' ');

          return { total: totalQty, details: colorBreakdown };
        }
      }
    }

    // Handle regular quantities
    const quantity = quantities[imagePath];
    if (quantity && Number(quantity) > 0) {
      return { total: Number(quantity), details: 'Quantity' };
    }

    return null;
  };

  const quantityInfo = getQuantityInfo();

  if (!quantityInfo) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '8px',
      left: '8px',
      right: '8px',
      background: 'var(--color-primary)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: 'var(--radius)',
      fontSize: '0.75rem',
      fontWeight: '500',
      zIndex: 1,
      opacity: 0.9
    }}>
      <div>
        <div style={{ fontWeight: '600', marginBottom: '2px' }}>
          Qty: {quantityInfo.total}
        </div>
        {quantityInfo.details !== 'Quantity' && (
          <div style={{
            fontSize: '0.65rem',
            opacity: 0.9,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            {quantityInfo.details}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummaryCard; 