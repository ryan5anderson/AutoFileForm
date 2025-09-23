import React from 'react';
import { getImagePath, getShirtVersionTotal, hasColorVersions } from '../utils';
import { ShirtVersion, ColorVersion, ShirtColorComboVersion, DisplayOption, SweatpantJoggerOption, SizeCounts, Size } from '../../types';

interface OrderSummaryCardProps {
  categoryPath: string;
  imageName: string;
  categoryName: string;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  shirtSizeCounts?: Record<string, Partial<Record<keyof ShirtVersion, SizeCounts>>>;
  colorVersions?: Record<string, ColorVersion>;
  shirtColorComboVersions?: Record<string, ShirtColorComboVersion>;
  // imagePath -> comboKey -> SizeCounts (tie-dye)
  shirtColorComboSizeCounts?: Record<string, Record<string, SizeCounts>>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  college?: string;
  hasShirtVersions?: boolean;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  categoryPath,
  imageName,
  categoryName,
  quantities,
  shirtVersions = {},
  shirtSizeCounts = {},
  colorVersions = {},
  shirtColorComboVersions = {},
  shirtColorComboSizeCounts = {},
  displayOptions = {},
  sweatpantJoggerOptions = {},
  college,
  hasShirtVersions = false
}) => {
  const imagePath = getImagePath(categoryPath, imageName);

  const getQuantityInfo = () => {
    // Handle tie-dye special case
    const tieDyeImages = [
      'M100965414 SHOUDC OU Go Green DTF on Forest.png',
      'M100482538 SHHODC Hover DTF on Black or Forest .png',
      'M100437896 SHOUDC Over Under DTF on Forest.png',
      'M102595496 SH2FDC Custom DTF on Maroon .png',
    ];
    
    if (tieDyeImages.includes(imageName)) {
      const byCombo = shirtColorComboSizeCounts[imagePath] || {};
      const totals = Object.values(byCombo).map((c) => Object.values(c || {}).reduce((a:number,b:number)=>a+b,0));
      const totalQty = totals.reduce((a,b)=>a+b,0);
      if (totalQty > 0) {
        return { total: totalQty, details: 'Tie-dye variants' };
      }
      return null;
    }

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

    // Handle sweatpants/joggers
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

    // Handle color versions
    if (hasColorVersions(imageName)) {
      const colorVersion = colorVersions[imagePath];
      if (colorVersion) {
        const totalQty = Object.values(colorVersion).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
        if (totalQty > 0) {
          const details = [];
          if (colorVersion.black && Number(colorVersion.black) > 0) {
            details.push(`Black: ${colorVersion.black}`);
          }
          if (colorVersion.forest && Number(colorVersion.forest) > 0) {
            details.push(`Forest: ${colorVersion.forest}`);
          }
          if (colorVersion.white && Number(colorVersion.white) > 0) {
            details.push(`White: ${colorVersion.white}`);
          }
          if (colorVersion.gray && Number(colorVersion.gray) > 0) {
            details.push(`Gray: ${colorVersion.gray}`);
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
            const sizeOrder: Size[] = ['S','M','L','XL','XXL','S/M','L/XL'];
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