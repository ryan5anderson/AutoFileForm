import React, { useState } from 'react';
import { Category, ShirtVersion, ColorVersion, ShirtColorComboVersion, DisplayOption, SweatpantJoggerOption } from '../types';
import ProductCard from './ProductCard';
import ShirtVersionCard from './ShirtVersionCard';
import ColorVersionCard from './ColorVersionCard';
import ShirtColorVersionCard from './ShirtColorVersionCard';
import DisplayOptionCard from './DisplayOptionCard';
import OrderSummaryCard from './OrderSummaryCard';
import { getImagePath, hasColorVersions, getProductName, getRackDisplayName, getShirtVersionTotal } from '../utils';

interface CategorySectionProps {
  category: Category;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  colorVersions?: Record<string, ColorVersion>;
  shirtColorComboVersions?: Record<string, ShirtColorComboVersion>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onColorVersionChange?: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  onShirtColorComboChange?: (imagePath: string, version: string, color: string, value: string) => void;
  onDisplayOptionChange?: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  readOnly?: boolean;
  college?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  quantities,
  shirtVersions = {},
  colorVersions = {},
  shirtColorComboVersions = {},
  displayOptions = {},
  sweatpantJoggerOptions = {},
  onQuantityChange,
  onShirtVersionChange,
  onColorVersionChange,
  onShirtColorComboChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  readOnly = false,
  college
}) => {
  const [modalProduct, setModalProduct] = useState<null | { img: string; imagePath: string }>(null);

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
        const totalQty = Object.values(comboVersions).reduce((sum, qty) => sum + Number(qty || 0), 0);
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
        const totalQty = Object.values(sjOptions).reduce((sum, qty) => sum + Number(qty || 0), 0);
        return totalQty > 0;
      }
      return false;
    }

    // Handle color versions
    if (hasColorVersions(imageName)) {
      const colorVersion = colorVersions[imagePath];
      if (colorVersion) {
        const totalQty = Object.values(colorVersion).reduce((sum, qty) => sum + Number(qty || 0), 0);
        return totalQty > 0;
      }
      return false;
    }

    // Handle shirt versions
    if (category.hasShirtVersions) {
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
  const filteredImages = category.images.filter((img) => {
    if (!readOnly) return true; // Show all items in form mode
    const imagePath = getImagePath(category.path, img);
    return hasQuantity(imagePath, img);
  });

  // Don't render the category section if no items have quantities in read-only mode
  if (readOnly && filteredImages.length === 0) {
    return null;
  }

  return (
    <section className="category-section">
      <h3>{category.name}</h3>
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
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: 'var(--space-3)' 
      }}>
        {filteredImages.map((img) => {
          const imagePath = getImagePath(category.path, img);
          return (
            <div
              key={img}
              style={{
                cursor: readOnly ? 'default' : 'pointer',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'box-shadow 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'relative',
              }}
              onClick={() => !readOnly && setModalProduct({ img, imagePath })}
            >
              <img
                src={process.env.PUBLIC_URL + `/${college === 'arizonastate' ? 'ArizonaState' : 'MichiganState'}/${imagePath}`}
                alt={img}
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid var(--color-border)'
                }}
              />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--color-text)',
                textAlign: 'center',
                marginTop: 'var(--space-2)'
              }}>
                {category.name === 'Display Options' ? getRackDisplayName(img) : getProductName(img)}
              </div>
              {!readOnly && (
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  marginTop: 'auto',
                  paddingTop: 'var(--space-2)',
                  fontStyle: 'italic'
                }}>
                  tap to order
                </div>
              )}
              {readOnly && (
                <OrderSummaryCard
                  categoryPath={category.path}
                  imageName={img}
                  categoryName={category.name}
                  quantities={quantities}
                  shirtVersions={shirtVersions}
                  colorVersions={colorVersions}
                  shirtColorComboVersions={shirtColorComboVersions}
                  displayOptions={displayOptions}
                  sweatpantJoggerOptions={sweatpantJoggerOptions}
                  college={college}
                  hasShirtVersions={category.hasShirtVersions}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Modal Overlay */}
      {modalProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => { setModalProduct(null); }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              minWidth: '320px',
              maxWidth: '900px',
              width: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => { setModalProduct(null); }}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#888',
                zIndex: 2
              }}
              aria-label="Close"
            >
              ×
            </button>
            {/* Product Title at Top Center */}
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                fontWeight: 900,
                fontSize: '2rem',
                color: 'var(--color-primary)',
                marginBottom: '2rem',
                letterSpacing: '0.01em',
                position: 'sticky',
                top: 0,
                background: 'white',
                zIndex: 1,
                padding: '0.75rem 0 1.5rem 0',
                boxSizing: 'border-box',
              }}
              className="modal-title"
            >
              {category.name === 'Display Options' ? getRackDisplayName(modalProduct.img) : getProductName(modalProduct.img)}
            </div>
            {/* Main 2-column grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
                gap: '2.5rem',
                width: '100%',
                alignItems: 'stretch',
                boxSizing: 'border-box',
                overflowX: 'hidden',
              }}
              className="modal-grid"
            >
              {/* Left: Product Image, vertically centered */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                minHeight: '320px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}>
                <img
                  src={process.env.PUBLIC_URL + `/${college === 'arizonastate' ? 'ArizonaState' : 'MichiganState'}/${modalProduct.imagePath}`}
                  alt={modalProduct.img}
                  style={{
                    width: '100%',
                    maxWidth: '340px',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                />
              </div>
              {/* Right: Select Options and Notes */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                width: '100%',
                maxWidth: '420px',
                gap: '2.5rem',
                minWidth: 0,
                position: 'relative',
                boxSizing: 'border-box',
              }}>
                {/* Select Options Section */}
                <div style={{ width: '100%' }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    marginBottom: '1.25rem',
                    color: 'var(--color-primary)',
                    letterSpacing: '0.01em',
                  }}>
                    Select Options
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    width: '100%'
                  }}>
                    {(() => {
                      if (!modalProduct) return null;
                      const { img, imagePath } = modalProduct;
                      // Tie-dye special case
                      const tieDyeImages = [
                        'M100965414 SHOUDC OU Go Green DTF on Forest.png',
                        'M100482538 SHHODC Hover DTF on Black or Forest .png',
                        'M100437896 SHOUDC Over Under DTF on Forest.png',
                        'M102595496 SH2FDC Custom DTF on Maroon .png',
                      ];
                      const isTieDye = tieDyeImages.includes(img);
                      const filteredShirtVersions = isTieDye && category.shirtVersions
                        ? category.shirtVersions.filter(v => v !== 'crewneck')
                        : category.shirtVersions;
                      const cardProps = {
                        categoryPath: category.path,
                        imageName: img,
                        hideImage: true,
                        college,
                        dropdownStyle: {
                          width: '100%',
                          minWidth: '120px',
                          padding: '0.5rem 1rem',
                          border: '1.5px solid var(--color-border)',
                          borderRadius: 'var(--radius)',
                          fontSize: '1rem',
                          background: 'var(--color-input-bg)',
                          textAlign: 'left',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        },
                        labelStyle: {
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                          marginBottom: 4,
                          display: 'block',
                          fontSize: '1rem',
                        },
                        inputWrapperStyle: {
                          marginBottom: '0.5rem',
                        },
                      };
                      if (category.hasDisplayOptions) {
                        const displayOption = displayOptions[imagePath] || { displayOnly: '', displayStandardCasePack: '' };
                        return (
                          <DisplayOptionCard
                            {...cardProps}
                            displayOption={displayOption}
                            onDisplayOptionChange={onDisplayOptionChange}
                          />
                        );
                      } else if (img === 'M100482538 SHHODC Hover DTF on Black or Forest .png' || img === 'M102595496 SH2FDC Custom DTF on Maroon .png') {
                        const comboVersion = shirtColorComboVersions[imagePath] || {};
                        return (
                          <ShirtColorVersionCard
                            {...cardProps}
                            shirtColorComboVersion={comboVersion}
                            availableVersions={filteredShirtVersions}
                            availableColors={category.colorVersions}
                            onShirtColorComboChange={onShirtColorComboChange}
                          />
                        );
                      } else if (hasColorVersions(img)) {
                        const colorVersion = colorVersions[imagePath] || { black: '', forest: '', white: '', gray: '' };
                        return (
                          <ColorVersionCard
                            {...cardProps}
                            colorVersions={colorVersion}
                            availableColors={category.colorVersions}
                            onColorVersionChange={onColorVersionChange}
                          />
                        );
                      } else if (category.hasShirtVersions) {
                        const shirtVersion = shirtVersions[imagePath] || { tshirt: '', longsleeve: '', hoodie: '', crewneck: '' };
                        return (
                          <ShirtVersionCard
                            {...cardProps}
                            shirtVersions={shirtVersion}
                            availableVersions={filteredShirtVersions}
                            onShirtVersionChange={onShirtVersionChange}
                          />
                        );
                      } else {
                        const quantity = quantities[imagePath] || '';
                        return (
                          <ProductCard
                            {...cardProps}
                            categoryName={category.name}
                            quantity={quantity}
                            onQuantityChange={onQuantityChange}
                            sweatpantJoggerOption={category.name === 'Sweatpants/Joggers' ? (sweatpantJoggerOptions?.[imagePath] || {sweatpantSteel: '', sweatpantOxford: '', joggerSteel: '', joggerOxford: ''}) : undefined}
                            onSweatpantJoggerOptionChange={category.name === 'Sweatpants/Joggers' ? onSweatpantJoggerOptionChange : undefined}
                          />
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
            {/* Responsive styles */}
            <style>{`
              @media (max-width: 800px) {
                .modal-grid {
                  grid-template-columns: 1fr !important;
                  gap: 1.5rem !important;
                  overflow-x: hidden !important;
                }
                .modal-title {
                  text-align: center !important;
                  font-size: 1.3rem !important;
                  position: static !important;
                  padding: 1rem 0 !important;
                }
              }
              select:focus {
                border-color: var(--color-primary) !important;
                box-shadow: 0 0 0 2px rgba(22,101,52,0.15);
              }
              select:hover {
                border-color: var(--color-primary) !important;
              }
            `}</style>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorySection; 