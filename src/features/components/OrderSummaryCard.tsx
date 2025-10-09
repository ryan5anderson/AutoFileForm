import React from 'react';
import { getImagePath } from '../utils';
import { ShirtVersion, DisplayOption, SweatpantJoggerOption, PantOption, SizeCounts, Size } from '../../types';

interface OrderSummaryCardProps {
  categoryPath: string;
  imageName: string;
  categoryName: string;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  shirtSizeCounts?: Record<string, Partial<Record<keyof ShirtVersion, SizeCounts>>>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  pantOptions?: Record<string, PantOption>;
  college?: string;
  hasShirtVersions?: boolean;
  hasPantOptions?: boolean;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  categoryPath,
  imageName,
  categoryName,
  quantities,
  shirtVersions = {},
  shirtSizeCounts = {},
  displayOptions = {},
  sweatpantJoggerOptions = {},
  pantOptions = {},
  college,
  hasShirtVersions = false,
  hasPantOptions = false
}) => {
  const imagePath = getImagePath(categoryPath, imageName);

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
        const processStyleCounts = (styleOptions: any, styleName: string) => {
          if (!styleOptions) return { total: 0, details: [] };

          let styleTotal = 0;
          const details: string[] = [];

          Object.entries(styleOptions).forEach(([colorName, sizeCounts]: [string, any]) => {
            if (sizeCounts && typeof sizeCounts === 'object') {
              const colorTotal = Object.values(sizeCounts).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0);
              if (colorTotal > 0) {
                styleTotal += colorTotal;

                // Build size detail like S7 M7 XL7
                const sizeOrder: Size[] = ['S','M','L','XL','XXL','XXXL','S/M','L/XL'];
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
          if (sjOptions.sweatpantOxford && Number(sjOptions.sweatpantOxford) > 0) {
            details.push(`Oxford: ${sjOptions.sweatpantOxford}`);
          }
          if (sjOptions.joggerSteel && Number(sjOptions.joggerSteel) > 0) {
            details.push(`Jogger Steel: ${sjOptions.joggerSteel}`);
          }
          if (sjOptions.joggerOxford && Number(sjOptions.joggerOxford) > 0) {
            details.push(`Jogger Oxford: ${sjOptions.joggerOxford}`);
          }
          return { total: totalQty, details: details.join(', ') };
        }
      }
      return null;
    }

    // Handle shirt versions (size breakdown)
    if (hasShirtVersions) {
      const sizeByVersion = shirtSizeCounts[imagePath] || {};
      const versionOrder: (keyof ShirtVersion)[] = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'];
      const totalsByVersion = versionOrder.map((vk) => {
        const c = sizeByVersion[vk];
        return c ? Object.values(c).reduce((a,b)=>a+b,0) : 0;
      });
      const totalQty = totalsByVersion.reduce((a,b)=>a+b,0);
      if (totalQty > 0) {
        const labels: Record<string, string> = { tshirt: 'T-Shirt', longsleeve: 'Long Sleeve', hoodie: 'Hoodie', crewneck: 'Crew' };
        const details: string[] = [];
        versionOrder.forEach((vk, i) => {
          const vTotal = totalsByVersion[i];
          if (vTotal > 0) {
            const c = sizeByVersion[vk];
            const sizeOrder: Size[] = ['S','M','L','XL','XXL','XXXL','S/M','L/XL'];
            const sizePieces = c ? sizeOrder
              .map((sz: Size) => {
                const val = c[sz] || 0;
                return val > 0 ? `${sz}${val}` : '';
              })
              .filter(Boolean)
              .join(' ') : '';
            details.push(`${labels[vk as keyof typeof labels]}: ${vTotal}${sizePieces ? ` (${sizePieces})` : ''}`);
          }
        });
        return { total: totalQty, details: details.join('; ') };
      }
      return null;
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
      <>
        <div style={{ fontWeight: '600', marginBottom: '2px' }}>
          Qty: {quantityInfo.total}
        </div>
        {quantityInfo.details !== 'Quantity' && (
          <div style={{ 
            fontSize: '0.65rem', 
            opacity: 0.9,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {quantityInfo.details}
          </div>
        )}
      </>
    </div>
  );
};

export default OrderSummaryCard; 