import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Category, ShirtVersion, DisplayOption, SweatpantJoggerOption, PantOption, ColorOption, ShirtColorSizeCounts, SizeCounts } from '../../../shared/types';
import OrderSummaryCard from './OrderSummaryCard';
import Card from '../../../shared/ui/Card';
import { getImagePath, getProductName, getRackDisplayName, getShirtVersionTotal, hasColorOptions } from '../utils';
import { asset, getCollegeFolderName } from '../../../shared/utils/asset';
import styles from './CategorySection.module.css';

interface CategorySectionProps {
  category: Category;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  shirtSizeCounts?: Record<string, Partial<Record<keyof ShirtVersion, SizeCounts>>>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  pantOptions?: Record<string, PantOption>;
  colorOptions?: Record<string, ColorOption>;
  shirtColorSizeCounts?: ShirtColorSizeCounts;
  invalidProductPaths?: string[];
  validProductPaths?: string[];
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onSizeCountsChange?: (imagePath: string, version: keyof ShirtVersion, counts: SizeCounts) => void;
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
  displayOptions = {},
  sweatpantJoggerOptions = {},
  pantOptions = {},
  colorOptions = {},
  shirtColorSizeCounts = {},
  invalidProductPaths = [],
  validProductPaths = [],
  onQuantityChange,
  onShirtVersionChange,
  onSizeCountsChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  readOnly = false,
  college
}) => {
  const navigate = useNavigate();

  // Helper function to check if an item has any quantity
  const hasQuantity = (imagePath: string, imageName: string) => {
    // Handle display options
    if (category.name === 'Display Options') {
      const displayOption = displayOptions[imagePath];
      if (displayOption) {
        const totalQty = Number(displayOption.displayOnly || 0) + Number(displayOption.displayStandardCasePack || 0);
        return totalQty > 0;
      }
      return false;
    }

    // Handle pants with style/color/size options
    if (category.hasPantOptions) {
      const pOptions = pantOptions[imagePath];
      if (pOptions) {
        const calculateTotal = (styleOptions: any) => {
          if (!styleOptions) return 0;
          return Object.values(styleOptions).reduce((styleTotal: number, colorOptions: any) => {
            if (!colorOptions || typeof colorOptions !== 'object') return styleTotal;
            return styleTotal + Object.values(colorOptions).reduce((colorTotal: number, sizeCount: unknown) => colorTotal + (typeof sizeCount === 'number' ? sizeCount : 0), 0);
          }, 0);
        };

        const sweatpantsTotal = calculateTotal(pOptions.sweatpants);
        const joggersTotal = calculateTotal(pOptions.joggers);
        return (sweatpantsTotal + joggersTotal) > 0;
      }
      return false;
    }

    // Handle sweatpants/joggers (legacy)
    if (category.name === 'Sweatpants/Joggers') {
      const sjOptions = sweatpantJoggerOptions[imagePath];
      if (sjOptions) {
        const totalQty = Object.values(sjOptions).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
        return totalQty > 0;
      }
      return false;
    }

    // Handle shirt versions (tshirt, longsleeve, hoodie, crewneck)
    if (category.hasShirtVersions) {
      // Check for color-based size counts first
      if (hasColorOptions(imageName)) {
        const colorSizeCountsByVersion = shirtColorSizeCounts[imagePath];
        if (colorSizeCountsByVersion) {
          const totalQty = Object.values(colorSizeCountsByVersion).reduce((sum, byColor) => {
            if (!byColor) return sum;
            const colorTotal = Object.values(byColor).reduce((colorSum, counts) => {
              if (!counts) return colorSum;
              const sizeTotal = Object.values(counts).reduce((a: number, b: number) => a + b, 0);
              return colorSum + sizeTotal;
            }, 0);
            return sum + colorTotal;
          }, 0);
          if (totalQty > 0) return true;
        }
      }

      // Regular size counts
      const sizeCountsByVersion = shirtSizeCounts[imagePath];
      if (sizeCountsByVersion) {
        const totalQty = Object.values(sizeCountsByVersion).reduce((sum, counts) => {
          if (!counts) return sum;
          const versionTotal = Object.values(counts).reduce((a, b) => (a as number) + (b as number), 0);
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

    // Handle products with size options (check shirtSizeCounts first for all products with size options)
    if (category.hasSizeOptions) {
      // Check for color-based size counts first
      if (hasColorOptions(imageName)) {
        const colorSizeCountsByVersion = shirtColorSizeCounts[imagePath];
        if (colorSizeCountsByVersion) {
          const totalQty = Object.values(colorSizeCountsByVersion).reduce((sum, byColor) => {
            if (!byColor) return sum;
            const colorTotal = Object.values(byColor).reduce((colorSum, counts) => {
              if (!counts) return colorSum;
              const sizeTotal = Object.values(counts).reduce((a: number, b: number) => a + b, 0);
              return colorSum + sizeTotal;
            }, 0);
            return sum + colorTotal;
          }, 0);
          if (totalQty > 0) return true;
        }
      }

      // For products with size options, check if they have data in shirtSizeCounts
      const sizeCountsByVersion = shirtSizeCounts[imagePath];
      if (sizeCountsByVersion) {
        const totalQty = Object.values(sizeCountsByVersion).reduce((sum, counts) => {
          if (!counts) return sum;
          const versionTotal = Object.values(counts).reduce((a, b) => (a as number) + (b as number), 0);
          return sum + versionTotal;
        }, 0);
        if (totalQty > 0) return true;
      }

      // For products with size options but no shirt versions, also check regular quantities
      if (!category.hasShirtVersions) {
        const quantity = quantities[imagePath];
        if (quantity && Number(quantity) > 0) {
          return true;
        }

        // Also check for color-based quantities
        if (hasColorOptions(imageName)) {
          const colorQty = colorOptions[imagePath];
          if (colorQty) {
            const totalQty = Object.values(colorQty).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
            if (totalQty > 0) return true;
          }
        }
      }

      return false;
    }

    // Handle non-shirt items with color options (like hats)
    if (hasColorOptions(imageName)) {
      const colorQty = colorOptions[imagePath];
      if (colorQty) {
        const totalQty = Object.values(colorQty).reduce((sum, qty) => sum + Number(qty || 0), 0);
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
      className={clsx('section', 'scroll-margin-top', styles.categorySection)}
    >
      <div className="section__header">
        <h3 className="section__title">{category.name}</h3>
      </div>
      {category.hasDisplayOptions && !readOnly && (
        <div className={styles.displayOptionsSection}>
          <strong>Display Only:</strong> Just the display unit without garments.<br />
          <strong>Display Standard Case Pack:</strong> Display unit includes garments.
        </div>
      )}
      <div className={clsx('section__grid', styles.sectionGrid)}>
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
          
          // Check if this product has validation errors or valid quantities
          const hasValidationError = invalidProductPaths.includes(imagePath);
          const hasValidQuantity = validProductPaths.includes(imagePath);
          const shouldHighlight = hasValidationError;

          return (
            <Card
              key={img}
              className={clsx(
                !readOnly && 'card--clickable',
                shouldHighlight && 'card--validation-error card--validation-highlight'
              )}
              onClick={handleCardClick}
            >
              {/* Red exclamation icon for invalid quantities */}
              {shouldHighlight && (
                <div className={styles.validationIcon}>
                  !
                </div>
              )}

              {/* Blue cart icon for valid quantities */}
              {hasValidQuantity && !shouldHighlight && (
                <div className={styles.successIcon}>
                  🛒
                </div>
              )}

              {/* Red overlay for invalid quantities */}
              {shouldHighlight && (
                <div className={styles.validationOverlay} />
              )}
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
                    shirtColorSizeCounts={shirtColorSizeCounts}
                    displayOptions={displayOptions}
                    sweatpantJoggerOptions={sweatpantJoggerOptions}
                    pantOptions={pantOptions}
                    colorOptions={colorOptions}
                    college={college}
                    hasShirtVersions={category.hasShirtVersions}
                    hasSizeOptions={category.hasSizeOptions}
                    hasPantOptions={category.hasPantOptions}
                    invalidProductPaths={invalidProductPaths}
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