import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, ShirtVersion, ColorVersion, ShirtColorComboVersion, DisplayOption, SweatpantJoggerOption } from '../../types';
import ProductCard from './panels/QuantityPanel';
import ShirtVersionCard from './panels/ShirtVersionPanel';
import ColorVersionCard from './panels/ColorVersionPanel';
import ShirtColorVersionCard from './panels/ShirtColorPanel';
import DisplayOptionCard from './panels/DisplayOptionsPanel';
import OrderSummaryCard from './OrderSummaryCard';
import { Card, ButtonIcon } from '../../components/ui';
import { getImagePath, hasColorVersions, getProductName, getRackDisplayName, getShirtVersionTotal } from '../utils';
import { asset, getCollegeFolderName } from '../../utils/asset';

interface CategorySectionProps {
  category: Category;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  shirtSizeCounts?: Record<string, Partial<Record<keyof ShirtVersion, import('../../types').SizeCounts>>>;
  colorVersions?: Record<string, ColorVersion>;
  shirtColorComboVersions?: Record<string, ShirtColorComboVersion>;
  shirtColorComboSizeCounts?: Record<string, Record<string, import('../../types').SizeCounts>>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onSizeCountsChange?: (imagePath: string, version: keyof ShirtVersion, counts: import('../../types').SizeCounts) => void;
  onColorVersionChange?: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  onShirtColorComboChange?: (imagePath: string, version: string, color: string, value: string) => void;
  onShirtColorComboSizeCountsChange?: (imagePath: string, version: string, color: string, counts: import('../../types').SizeCounts) => void;
  onDisplayOptionChange?: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  readOnly?: boolean;
  college?: string;
}


const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  quantities,
  shirtVersions = {},
  shirtSizeCounts = {},
  colorVersions = {},
  shirtColorComboVersions = {},
  shirtColorComboSizeCounts = {},
  displayOptions = {},
  sweatpantJoggerOptions = {},
  onQuantityChange,
  onShirtVersionChange,
  onSizeCountsChange,
  onColorVersionChange,
  onShirtColorComboChange,
  onShirtColorComboSizeCountsChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  readOnly = false,
  college
}) => {
  const navigate = useNavigate();

  // Helper function to check if an item has any quantity
  const hasQuantity = (imagePath: string, imageName: string) => {
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
        return totalQty > 0;
      }
      return false;
    }

    // Handle display options
    if (category.name === 'Display Options') {
      const displayOption = displayOptions[imagePath];
      if (displayOption) {
        const totalQty = Number(displayOption.displayOnly || 0) + Number(displayOption.displayStandardCasePack || 0);
        return totalQty > 0;
      }
      return false;
    }

    // Handle sweatpants/joggers
    if (category.name === 'Sweatpants/Joggers') {
      const sjOptions = sweatpantJoggerOptions[imagePath];
      if (sjOptions) {
        const totalQty = Object.values(sjOptions).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
        return totalQty > 0;
      }
      return false;
    }

    // Handle color versions
    if (hasColorVersions(imageName)) {
      const colorVersion = colorVersions[imagePath];
      if (colorVersion) {
        const totalQty = Object.values(colorVersion).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
        return totalQty > 0;
      }
      return false;
    }

    // Handle shirt versions (prefer size counts if present)
    if (category.hasShirtVersions) {
      const sizeCountsByVersion = shirtSizeCounts[imagePath];
      if (sizeCountsByVersion) {
        const totalQty = Object.values(sizeCountsByVersion).reduce((sum, counts) => {
          if (!counts) return sum;
          const versionTotal = Object.values(counts).reduce((a: number, b: number) => a + b, 0);
          return sum + versionTotal;
        }, 0);
        if (totalQty > 0) return true;
      }
      const shirtVersion = shirtVersions[imagePath];
      if (shirtVersion) {
        const totalQty = getShirtVersionTotal(shirtVersion, ['tshirt', 'longsleeve', 'hoodie', 'crewneck']);
        return totalQty > 0;
      }
      return false;
    }

    // Handle regular quantities
    const quantity = quantities[imagePath];
    return quantity && Number(quantity) > 0;
  };

  // Filter images to only show those with quantities in read-only mode
  const filteredImages = category.images.filter((img: string) => {
    if (!readOnly) return true; // Show all items in form mode
    const imagePath = getImagePath(category.path, img);
    return hasQuantity(imagePath, img);
  });

  // Don't render the category section if no items have quantities in read-only mode
  if (readOnly && filteredImages.length === 0) {
    return null;
  }

  const getSectionId = (categoryName: string) => {
    return categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
  };

  return (
    <section 
      id={getSectionId(category.name)}
      className="section scroll-margin-top"
    >
      <div className="section__header">
        <h3 className="section__title">{category.name}</h3>
      </div>
      {category.hasDisplayOptions && (
        <div style={{
          marginBottom: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
          color: 'var(--color-text)',
          lineHeight: '1.5'
        }}>
          <strong>Display Only:</strong> Just the display unit without garments.<br />
          <strong>Display Standard Case Pack:</strong> Display unit includes garments.
        </div>
      )}
      <div className="section__grid" style={{ alignItems: 'start' }}>
        {filteredImages.map((img: string) => {
          const imagePath = getImagePath(category.path, img);
          
          const handleCardClick = () => {
            if (!readOnly) {
              // Navigate to product detail page
              const encodedCategory = encodeURIComponent(category.path);
              const encodedProductId = encodeURIComponent(img);
              navigate(`/${college}/product/${encodedCategory}/${encodedProductId}`);
            }
          };
          
          return (
            <Card
              key={img}
              className={!readOnly ? 'card--clickable' : ''}
            >
              <Card.Header
                onClick={handleCardClick}
              >
                <h3 className="card__title">
                  {category.name === 'Display Options' ? getRackDisplayName(img) : getProductName(img)}
                </h3>

                <div className="card__image-container">
                  <img
                    src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
                    alt={img}
                    className="card__image"
                  />
                </div>

                {!readOnly && (
                  <p className="card__action-text">
                    Tap to configure options
                  </p>
                )}

                {readOnly && (
                  <OrderSummaryCard
                    categoryPath={category.path}
                    imageName={img}
                    categoryName={category.name}
                    quantities={quantities}
                    shirtVersions={shirtVersions}
                    shirtSizeCounts={shirtSizeCounts}
                    colorVersions={colorVersions}
                    shirtColorComboVersions={shirtColorComboVersions}
                    displayOptions={displayOptions}
                    sweatpantJoggerOptions={sweatpantJoggerOptions}
                    college={college}
                    hasShirtVersions={category.hasShirtVersions}
                  />
                )}
              </Card.Header>
            </Card>
          );
        })}
      </div>

    </section>
  );
};

export default CategorySection; 