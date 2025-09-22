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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Helper function to toggle card expansion
  const toggleCardExpansion = (imagePath: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imagePath)) {
        newSet.delete(imagePath);
      } else {
        newSet.add(imagePath);
      }
      return newSet;
    });
  };

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

  const getSectionId = (categoryName: string) => {
    return categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
  };

  return (
    <section 
      id={getSectionId(category.name)}
      className="category-section"
      style={{ scrollMarginTop: '120px' }}
    >
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
          const isExpanded = expandedCards.has(imagePath);
          
          return (
            <div
              key={img}
              className={`product-card ${isExpanded ? 'expanded' : ''}`}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isExpanded 
                  ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                  : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                position: 'relative',
                transform: isExpanded ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding: '1rem',
                  cursor: readOnly ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'white',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                  position: 'relative',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!readOnly) {
                    toggleCardExpansion(imagePath);
                  }
                }}
              >
                {/* Product Title - Top Center */}
                <h3 style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  letterSpacing: '-0.01em',
                }}>
                  {category.name === 'Display Options' ? getRackDisplayName(img) : getProductName(img)}
                </h3>

                {/* Product Image - Focal Point */}
                <div style={{
                  width: '160px',
                  height: '160px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '2px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  marginBottom: '0.75rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                  <img
                    src={process.env.PUBLIC_URL + `/${college === 'arizonastate' ? 'ArizonaState' : 'MichiganState'}/${imagePath}`}
                    alt={img}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                {/* Action Text */}
                {!readOnly && (
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    fontWeight: '500',
                    textAlign: 'center',
                  }}>
                    {isExpanded ? 'Tap to minimize' : 'Tap to configure options'}
                  </p>
                )}

                {/* Expand/Collapse Button */}
                {!readOnly && (
                  <button
                    type="button"
                    style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      background: isExpanded 
                        ? 'linear-gradient(135deg, var(--color-primary) 0%, #059669 100%)' 
                        : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      color: isExpanded ? 'white' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      boxShadow: isExpanded 
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                        : '0 1px 2px rgba(0, 0, 0, 0.05)',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCardExpansion(imagePath);
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                )}

                {/* Quantity Badge for Summary View */}
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

              {/* Expandable Content */}
              {!readOnly && (
                <div
                  className="expandable-content config-panel"
                  style={{
                    maxHeight: isExpanded ? '800px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isExpanded ? 1 : 0,
                    padding: isExpanded ? 'clamp(1rem, 2.5vw, 2rem)' : '0',
                  }}
                >
                  <h4 className="config-title">
                    Options
                  </h4>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'clamp(10px, 2vw, 16px)',
                      width: '100%',
                    }}>
                      {(() => {
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
              )}
            </div>
          );
        })}
      </div>

      {/* Global Styles for Expandable Cards */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-20px);
            padding-top: 0;
            padding-bottom: 0;
          }
          to {
            opacity: 1;
            max-height: 800px;
            transform: translateY(0);
            padding-top: 1.5rem;
            padding-bottom: 1.5rem;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .product-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .product-card.expanded {
          background: #ffffff; /* keep card white */
          transform: scale(1.02); /* subtle enlargement */
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); /* stronger highlight */
          border: 2px solid #cbd5e1; /* subtle border to show selection */
          transition: transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease;
        }
        
        .expandable-content {
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .expandable-content > div {
          animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .product-card {
            margin-bottom: 0.5rem;
          }
        }
        
        /* Enhanced Focus styles */
        select:focus,
        input:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(22, 101, 52, 0.1) !important;
          outline: none !important;
          transform: translateY(-1px);
        }
        
        select:hover,
        input:hover {
          border-color: #9ca3af !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Smooth transitions for all interactive elements */
        select,
        input,
        button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* Card hover effects */
        .product-card:not(.expanded):hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Arrow button default */
        .product-card button {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #64748b;
        }

        /* Arrow when expanded (darker grey) */
        .product-card.expanded button {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
          color: #f9fafb !important;
        }

        /* Button hover effects */
        button:hover {
          transform: scale(1.05) !important;
        }
        
        button:active {
          transform: scale(0.95) !important;
        }
        
        /* Configuration panel polish */
        .config-panel {
          background: #ffffff; /* keep panel white */
          border: none; /* remove border */
          border-radius: 0; /* remove border radius */
        }

        /* When expandable-content is also config-panel, keep rounded corners */
        .expandable-content.config-panel {
          border-top: none;
        }

        /* Do not let anything draw outside the card */
        .product-card,
        .expandable-content,
        .config-panel {
          overflow: hidden;
        }

        /* Ensure expandable content with config panel styling is visible */
        .expandable-content.config-panel {
          display: block;
        }


        /* Columns/controls must never exceed container width */
        .field,
        .field-label,
        .field-control,
        .field-control > * {
          box-sizing: border-box;
          max-width: 100%;
        }

        /* Title */
        .config-title {
          margin: 0 0 clamp(0.75rem, 2vw, 1.25rem) 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        /* Each label/control row */
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px 0;
          background: transparent;
          border: none;
          border-radius: 0;
          margin-bottom: 16px;
        }


        /* Label text */
        .field-label {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
          line-height: 1.2;
          letter-spacing: -0.01em;
          white-space: normal;            /* allow wrapping */
          overflow-wrap: break-word;      /* wrap at word boundaries when possible */
          word-break: normal;             /* do NOT break inside words/letters */
        }

        /* Control container: ensure same height and fluid width */
        .field-control {
          display: block;
          width: 100%;
        }

        .field-control > * {
          width: 100%;
          min-width: 0;          /* critical with CSS grid so inputs don't overflow */
          max-width: 100%;
          min-height: 44px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.875rem;
          font-weight: 500;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
          box-sizing: border-box;
          display: block;
          visibility: visible;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }

        /* Custom dropdown arrow for select elements */
        .field-control select {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 40px;
        }

        /* Focus & hover states */
        .field-control > *:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(22, 101, 52, 0.1);
          outline: none;
          transform: translateY(-1px);
        }

        .field-control > *:hover {
          border-color: #9ca3af;
        }

        /* Tighten small inputs (numeric qty) while keeping height */
        .field-control input[type="number"],
        .field-control input[type="text"] {
          text-align: right;
        }
      `}</style>
    </section>
  );
};

export default CategorySection; 