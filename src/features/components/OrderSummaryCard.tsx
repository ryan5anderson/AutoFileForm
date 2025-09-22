import React from 'react';
import { getImagePath, getShirtVersionTotal, hasColorVersions } from '../utils';
import { ShirtVersion, ColorVersion, ShirtColorComboVersion, DisplayOption, SweatpantJoggerOption } from '../../types';

interface OrderSummaryCardProps {
  categoryPath: string;
  imageName: string;
  categoryName: string;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  colorVersions?: Record<string, ColorVersion>;
  shirtColorComboVersions?: Record<string, ShirtColorComboVersion>;
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
  colorVersions = {},
  shirtColorComboVersions = {},
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
      const comboVersions = shirtColorComboVersions[imagePath];
      if (comboVersions) {
        const totalQty = Object.values(comboVersions).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
        if (totalQty > 0) {
          return { total: totalQty, details: 'Tie-dye variants' };
        }
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

    // Handle shirt versions
    if (hasShirtVersions) {
      const shirtVersion = shirtVersions[imagePath];
      if (shirtVersion) {
        const totalQty = getShirtVersionTotal(shirtVersion, ['tshirt', 'longsleeve', 'hoodie', 'crewneck']);
        if (totalQty > 0) {
          const details = [];
          if (shirtVersion.tshirt && Number(shirtVersion.tshirt) > 0) {
            details.push(`T-Shirt: ${shirtVersion.tshirt}`);
          }
          if (shirtVersion.longsleeve && Number(shirtVersion.longsleeve) > 0) {
            details.push(`Long Sleeve: ${shirtVersion.longsleeve}`);
          }
          if (shirtVersion.hoodie && Number(shirtVersion.hoodie) > 0) {
            details.push(`Hoodie: ${shirtVersion.hoodie}`);
          }
          if (shirtVersion.crewneck && Number(shirtVersion.crewneck) > 0) {
            details.push(`Crew: ${shirtVersion.crewneck}`);
          }
          return { total: totalQty, details: details.join(', ') };
        }
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