import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from '../../components/ui';
import { Category, ShirtVersion, DisplayOption, SweatpantJoggerOption, PantOption, ColorOption, ShirtColorSizeCounts, InfantSizeCounts, SizeCounts } from '../../types';
import { asset, getCollegeFolderName } from '../../utils/asset';
import { getDisplayProductName, getRackDisplayName, getShirtVersionTotal, hasColorOptions, getVersionDisplayName } from '../utils';

import OrderSummaryCard from './OrderSummaryCard';


interface CategorySectionProps {
  category: Category;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  shirtSizeCounts?: Record<string, Partial<Record<keyof ShirtVersion, import('../../types').SizeCounts>>>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  pantOptions?: Record<string, PantOption>;
  colorOptions?: Record<string, ColorOption>;
  shirtColorSizeCounts?: ShirtColorSizeCounts;
  infantSizeCounts?: Record<string, InfantSizeCounts>;
  invalidProductPaths?: string[];
  validProductPaths?: string[];
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onSizeCountsChange?: (imagePath: string, version: keyof ShirtVersion, counts: import('../../types').SizeCounts) => void;
  onDisplayOptionChange?: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  readOnly?: boolean;
  college?: string;
  isAdmin?: boolean;
  imageSrcResolver?: (categoryPath: string, imageName: string, imagePath: string) => string;
  productTitleResolver?: (categoryPath: string, imageName: string, imagePath: string) => string;
  productDetailPathResolver?: (categoryPath: string, imageName: string, imagePath: string) => string;
  showTapToSelectText?: boolean;
  /** API school mode: ordered product selections by productId */
  apiOrderedByProduct?: Record<string, { activeVariant: string; variantQuantities: Record<string, Record<string, number>> }>;
  /** API school mode: product map by productId */
  apiProductMap?: Record<string, { variantOptions?: string[]; defaultVariant?: string }>;
  /** API school mode: get cart items for In Cart bar - returns variant totals and optional size details */
  getApiCartItems?: (imagePath: string, imageName: string) => { label: string; qty: number; sizeDetail?: string }[];
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
  infantSizeCounts = {},
  invalidProductPaths = [],
  validProductPaths = [],
  onQuantityChange,
  onShirtVersionChange,
  onSizeCountsChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  readOnly = false,
  college,
  isAdmin = false,
  imageSrcResolver,
  productTitleResolver,
  productDetailPathResolver,
  showTapToSelectText = true,
  apiOrderedByProduct,
  apiProductMap,
  getApiCartItems,
}) => {
  const navigate = useNavigate();

  // Helper function to get cart variations for a product
  const getCartVariations = (imagePath: string, imageName: string): string[] => {
    const variations: string[] = [];

    // Handle shirt versions (tshirt, longsleeve, hoodie, crewneck)
    if (category.hasShirtVersions) {
      // Check color-based size counts first - group colors by version
      const colorSizeCountsByVersion = shirtColorSizeCounts?.[imagePath];
      if (colorSizeCountsByVersion) {
        Object.entries(colorSizeCountsByVersion).forEach(([version, byColor]) => {
          if (byColor) {
            const colorsWithQuantity: string[] = [];
            Object.entries(byColor).forEach(([colorName, counts]) => {
              if (counts) {
                const hasQuantity = Object.values(counts).some((qty) => qty > 0);
                if (hasQuantity) {
                  // Format color names nicely
                  const formattedColor = colorName.charAt(0).toUpperCase() + colorName.slice(1);
                  colorsWithQuantity.push(formattedColor);
                }
              }
            });
            
            if (colorsWithQuantity.length > 0) {
              const displayName = getVersionDisplayName(version);
              // Group colors in parentheses: "T-Shirt (Black, Forest)"
              if (colorsWithQuantity.length > 1) {
                variations.push(`${displayName} (${colorsWithQuantity.join(', ')})`);
              } else {
                variations.push(`${displayName} (${colorsWithQuantity[0]})`);
              }
            }
          }
        });
      }

      // Check regular size counts (no colors, just versions)
      const sizeCountsByVersion = shirtSizeCounts[imagePath];
      if (sizeCountsByVersion) {
        Object.entries(sizeCountsByVersion).forEach(([version, counts]) => {
          if (counts) {
            const hasQuantity = Object.values(counts).some((qty) => qty > 0);
            if (hasQuantity) {
              const displayName = getVersionDisplayName(version);
              if (!variations.includes(displayName)) {
                variations.push(displayName);
              }
            }
          }
        });
      }

      // Check legacy shirt versions
      const shirtVersion = shirtVersions[imagePath];
      if (shirtVersion) {
        Object.entries(shirtVersion).forEach(([version, qty]) => {
          if (qty && Number(qty) > 0) {
            const displayName = getVersionDisplayName(version);
            if (!variations.includes(displayName)) {
              variations.push(displayName);
            }
          }
        });
      }
    }

    // Handle pant options (sweatpants/joggers with colors)
    if (category.hasPantOptions) {
      const pOptions = pantOptions[imagePath];
      if (pOptions) {
        // Check sweatpants
        if (pOptions.sweatpants) {
          const hasSweatpants = Object.values(pOptions.sweatpants).some((sizeCounts) => {
            if (!sizeCounts) return false;
            return Object.values(sizeCounts).some((qty) => qty > 0);
          });
          if (hasSweatpants) {
            const colors: string[] = [];
            Object.entries(pOptions.sweatpants).forEach(([color, sizeCounts]) => {
              if (sizeCounts) {
                const hasQty = Object.values(sizeCounts).some((qty) => qty > 0);
                if (hasQty) {
                  // Format color names nicely
                  const colorName = color === 'darkNavy' ? 'Dark Navy' : 
                                  color === 'darkHeather' ? 'Dark Heather' :
                                  color.charAt(0).toUpperCase() + color.slice(1);
                  colors.push(colorName);
                }
              }
            });
            if (colors.length > 0) {
              variations.push(`Sweatpants (${colors.join(', ')})`);
            }
          }
        }

        // Check joggers
        if (pOptions.joggers) {
          const hasJoggers = Object.values(pOptions.joggers).some((sizeCounts) => {
            if (!sizeCounts) return false;
            return Object.values(sizeCounts).some((qty) => qty > 0);
          });
          if (hasJoggers) {
            const colors: string[] = [];
            Object.entries(pOptions.joggers).forEach(([color, sizeCounts]) => {
              if (sizeCounts) {
                const hasQty = Object.values(sizeCounts).some((qty) => qty > 0);
                if (hasQty) {
                  const colorName = color === 'darkHeather' ? 'Dark Heather' :
                                  color === 'darkNavy' ? 'Dark Navy' :
                                  color.charAt(0).toUpperCase() + color.slice(1);
                  colors.push(colorName);
                }
              }
            });
            if (colors.length > 0) {
              variations.push(`Joggers (${colors.join(', ')})`);
            }
          }
        }
      }
    }

    // Handle legacy sweatpants/joggers
    if (category.name === 'Sweatpants/Joggers') {
      const sjOptions = sweatpantJoggerOptions[imagePath];
      if (sjOptions) {
        const types: string[] = [];
        Object.entries(sjOptions).forEach(([option, qty]) => {
          if (qty && Number(qty) > 0) {
            // Format option names: "sweatpantSteel" -> "Sweatpants (Steel)"
            if (option.startsWith('sweatpant')) {
              const color = option.replace('sweatpant', '');
              const colorName = color === 'DarkNavy' ? 'Dark Navy' :
                              color === 'DarkHeather' ? 'Dark Heather' :
                              color.charAt(0).toUpperCase() + color.slice(1);
              types.push(`Sweatpants (${colorName})`);
            } else if (option.startsWith('jogger')) {
              const color = option.replace('jogger', '');
              const colorName = color === 'DarkHeather' ? 'Dark Heather' :
                              color === 'DarkNavy' ? 'Dark Navy' :
                              color.charAt(0).toUpperCase() + color.slice(1);
              types.push(`Joggers (${colorName})`);
            }
          }
        });
        variations.push(...types);
      }
    }

    // Handle color options (for items like hats)
    if (hasColorOptions(imageName)) {
      const colorQty = colorOptions[imagePath];
      if (colorQty) {
        const selectedColors: string[] = [];
        Object.entries(colorQty).forEach(([colorName, qty]) => {
          if (qty && Number(qty) > 0) {
            selectedColors.push(colorName.charAt(0).toUpperCase() + colorName.slice(1));
          }
        });
        if (selectedColors.length > 0) {
          variations.push(...selectedColors);
        }
      }
    }

    return variations;
  };

  // Helper function to get total quantity for a product across all supported selection models
  const getQuantityTotal = (imagePath: string, imageName: string): number => {
    // Handle display options
    if (category.name === 'Display Options') {
      const displayOption = displayOptions[imagePath];
      if (displayOption) {
        return Number(displayOption.displayOnly || 0) + Number(displayOption.displayStandardCasePack || 0);
      }
      return 0;
    }

    // Handle pants with style/color/size options
    if (category.hasPantOptions) {
      const pOptions = pantOptions[imagePath];
      if (pOptions) {
        const calculateTotal = (styleOptions: Record<string, SizeCounts> | undefined) => {
          if (!styleOptions) return 0;
          return Object.values(styleOptions).reduce((styleTotal: number, colorOptions) => {
            if (!colorOptions || typeof colorOptions !== 'object') return styleTotal;
            return styleTotal + Object.values(colorOptions).reduce((colorTotal: number, sizeCount: unknown) => colorTotal + (typeof sizeCount === 'number' ? sizeCount : 0), 0);
          }, 0);
        };

        const sweatpantsTotal = calculateTotal(pOptions.sweatpants);
        const joggersTotal = calculateTotal(pOptions.joggers);
        return sweatpantsTotal + joggersTotal;
      }
      return 0;
    }

    // Handle infant products (only check by image name, not category name)
    // This allows youth products in "Youth & Infant" category to use shirtSizeCounts
    if (imageName.toLowerCase().includes('infant') || imageName.toLowerCase().includes('onsie')) {
      const infantCounts = infantSizeCounts[imagePath];
      if (infantCounts) {
        return Object.values(infantCounts).reduce((sum, count) => sum + count, 0);
      }
      return 0;
    }

    // Handle sweatpants/joggers (legacy)
    if (category.name === 'Sweatpants/Joggers') {
      const sjOptions = sweatpantJoggerOptions[imagePath];
      if (sjOptions) {
        return Object.values(sjOptions).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
      }
      return 0;
    }

    // Handle shirt versions (tshirt, longsleeve, hoodie, crewneck)
    if (category.hasShirtVersions) {
      // Check for color-based size counts first (regardless of filename pattern)
      const colorSizeCountsByVersion = shirtColorSizeCounts?.[imagePath];
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
        if (totalQty > 0) return totalQty;
      }

      // Regular size counts
      const sizeCountsByVersion = shirtSizeCounts[imagePath];
      if (sizeCountsByVersion) {
        const totalQty = Object.values(sizeCountsByVersion).reduce((sum, counts) => {
          if (!counts) return sum;
          const versionTotal = Object.values(counts).reduce((a: number, b: number) => a + b, 0);
          return sum + versionTotal;
        }, 0);
        if (totalQty > 0) return totalQty;
      }
      const shirtVersion = shirtVersions[imagePath];
      if (shirtVersion) {
        return getShirtVersionTotal(shirtVersion, ['tshirt', 'longsleeve', 'hoodie', 'crewneck']);
      }
      return 0;
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
          if (totalQty > 0) return totalQty;
        }
      }

      // For products with size options, check if they have data in shirtSizeCounts
      const sizeCountsByVersion = shirtSizeCounts[imagePath];
      if (sizeCountsByVersion) {
        const totalQty = Object.values(sizeCountsByVersion).reduce((sum, counts) => {
          if (!counts) return sum;
          const versionTotal = Object.values(counts).reduce((a: number, b: number) => a + b, 0);
          return sum + versionTotal;
        }, 0);
        if (totalQty > 0) return totalQty;
      }

      // For products with size options but no shirt versions, also check regular quantities
      if (!category.hasShirtVersions) {
        const quantity = quantities[imagePath];
        if (quantity && Number(quantity) > 0) {
          return Number(quantity);
        }

        // Also check for color-based quantities
        if (hasColorOptions(imageName)) {
          const colorQty = colorOptions[imagePath];
          if (colorQty) {
            return Object.values(colorQty).reduce((sum: number, qty) => sum + Number(qty || 0), 0);
          }
        }
      }

      return 0;
    }

    // Handle non-shirt items with color options (like hats)
    if (hasColorOptions(imageName)) {
      const colorQty = colorOptions[imagePath];
      if (colorQty) {
        return Object.values(colorQty).reduce((sum, qty) => sum + Number(qty || 0), 0);
      }
      return 0;
    }

    // Handle regular quantities
    const quantity = quantities[imagePath];
    return Number(quantity || 0);
  };

  // Helper function to check if an item has any quantity
  const hasQuantity = (imagePath: string, imageName: string) => {
    return getQuantityTotal(imagePath, imageName) > 0;
  };

  // Filter images to only show those with quantities in read-only mode
  // Exception: If all form data is empty (e.g., admin preview mode), show all products
  const hasAnyFormData = Object.keys(quantities).length > 0 || 
    Object.keys(shirtVersions).length > 0 ||
    Object.keys(displayOptions).length > 0 ||
    Object.keys(sweatpantJoggerOptions).length > 0 ||
    Object.keys(pantOptions).length > 0 ||
    Object.keys(colorOptions).length > 0 ||
    Object.keys(shirtSizeCounts).length > 0 ||
    Object.keys(shirtColorSizeCounts).length > 0 ||
    Object.keys(infantSizeCounts).length > 0;

  const filteredImages = category.images.filter((img: string) => {
    if (!readOnly) return true; // Show all items in form mode
    // If read-only but no form data exists, show all products (admin preview mode)
    if (!hasAnyFormData) return true;
    // Otherwise, only show products with quantities (summary/receipt mode)
    const imagePath = `${category.path}/${img}`;
    return hasQuantity(imagePath, img);
  });

  // Don't render the category section if no items have quantities in read-only mode
  // Exception: If all form data is empty, always show (admin preview mode)
  if (readOnly && filteredImages.length === 0 && hasAnyFormData) {
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
      {category.hasDisplayOptions && !readOnly && (
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
          <strong>Display Only:</strong> Just the display unit without products.<br />
          <strong>Display Standard Case Pack:</strong> Display unit includes products.
        </div>
      )}
      <div className="section__grid" style={{ alignItems: 'start' }}>
        {filteredImages.map((img: string) => {
          const imagePath = `${category.path}/${img}`;
          
          const handleCardClick = () => {
            const returnNavigationState = {
              returnFromProduct: true,
              returnScrollY: window.scrollY,
            };
            if (!readOnly) {
              if (productDetailPathResolver) {
                navigate(productDetailPathResolver(category.path, img, imagePath), {
                  state: returnNavigationState,
                });
              } else {
                // Navigate to product detail page
                const encodedCategory = encodeURIComponent(category.path);
                const encodedProductId = encodeURIComponent(img);
                navigate(`/${college}/product/${encodedCategory}/${encodedProductId}`, {
                  state: returnNavigationState,
                });
              }
            } else if (isAdmin && college) {
              // Navigate to admin product detail page
              const encodedCategory = encodeURIComponent(category.path);
              const encodedProductId = encodeURIComponent(img);
              navigate(`/admin/college/${college}/product/${encodedCategory}/${encodedProductId}`, {
                state: returnNavigationState,
              });
            }
          };
          
          // Check if this product has validation errors or valid quantities
          const hasValidationError = invalidProductPaths.includes(imagePath);
          const shouldHighlight = hasValidationError;
          const totalQuantity = getQuantityTotal(imagePath, img);
          const hasAnyQuantity = totalQuantity > 0;
          const isInCartState = hasAnyQuantity && !shouldHighlight && !readOnly && Boolean(apiProductMap);
          const formatApiCartItem = (item: { label: string; qty: number; sizeDetail?: string }) =>
            `${item.label}: ${item.qty}${item.sizeDetail ? ` (${item.sizeDetail})` : ''}`;
          const apiCartItems = getApiCartItems ? getApiCartItems(imagePath, img) : [];
          const cartDetails = getApiCartItems
            ? apiCartItems.map(formatApiCartItem)
            : getCartVariations(imagePath, img);
          const selectedOptions = cartDetails.length > 0
            ? cartDetails
            : totalQuantity > 0
              ? [`Quantity: ${totalQuantity}`]
              : [];

          // Ensure onClick is always set when card should be clickable
          const shouldBeClickable = !readOnly || (isAdmin && college);
          
          return (
            <Card
              key={img}
              className={`${shouldBeClickable ? 'card--clickable' : ''} ${shouldHighlight ? 'card--validation-error' : ''} ${apiProductMap ? 'card--api-school' : ''} ${isInCartState ? 'card--in-cart' : ''}`}
              style={shouldHighlight ? {
                position: 'relative',
                overflow: 'hidden'
              } : undefined}
              onClick={shouldBeClickable ? handleCardClick : undefined}
            >
              {/* Red exclamation icon for invalid quantities */}
              {shouldHighlight && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 20,
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#dc2626',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                  }}
                >
                  !
                </div>
              )}

              {/* Red overlay for invalid quantities */}
              {shouldHighlight && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(220, 38, 38, 0.15)',
                    zIndex: 10,
                    pointerEvents: 'none',
                    borderRadius: 'var(--radius-lg)'
                  }}
                />
              )}
              <Card.Header>
                {/* Selected state badge for in-cart products */}
                {isInCartState && (
                  <div className="card__status-badge">
                    In Cart
                  </div>
                )}
                <h3 className={`card__title ${isInCartState ? 'card__title--in-cart' : 'card__title--default'}`}>
                  {productTitleResolver
                    ? productTitleResolver(category.path, img, imagePath)
                    : (category.name === 'Display Options' ? getRackDisplayName(img) : getDisplayProductName(img))}
                </h3>

                <div className="card__image-container">
                  <img
                    src={
                      imageSrcResolver
                        ? imageSrcResolver(category.path, img, imagePath)
                        : asset(`${getCollegeFolderName(college || '')}/${imagePath}`)
                    }
                    alt={img}
                    className="card__image"
                  />
                </div>

                {!readOnly && apiProductMap && (() => {
                  const product = apiProductMap[img];
                  const variants = product?.variantOptions;
                  const hasMultipleVariants = variants && variants.length > 1;
                  return (
                    <>
                      {hasMultipleVariants && !isInCartState && (
                        <p className="card__variant-text">
                          Available on{'\n'}
                          {variants.map((v, i) => (
                            <span key={v}>
                              {getVersionDisplayName(v)}
                              {i < variants.length - 1 ? ' \u2022 ' : ''}
                            </span>
                          ))}
                        </p>
                      )}
                      {isInCartState ? (
                        <div className="card__selected-footer">
                          {selectedOptions.length > 0 && (
                            <div className="card__selected-options">
                              {selectedOptions.map((option, optionIdx) => (
                                <span key={`${option}-${optionIdx}`} className="card__selected-option-chip">
                                  {option}
                                </span>
                              ))}
                            </div>
                          )}
                          {totalQuantity > 0 && (
                            <p className="card__selected-qty">
                              Quantity selected: {totalQuantity}
                            </p>
                          )}
                          <span className="card__selected-action">
                            Edit selection
                          </span>
                        </div>
                      ) : (
                        <span className="card__choose-btn">
                          Choose Apparel
                        </span>
                      )}
                    </>
                  );
                })()}

                {!readOnly && showTapToSelectText && !apiProductMap && (
                  <p className="card__action-text">
                    Tap to select options
                  </p>
                )}

                {readOnly && hasAnyFormData && apiProductMap && getApiCartItems && (
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
                        Qty: {totalQuantity}
                      </div>
                      {selectedOptions.length > 0 && (
                        <div style={{
                          fontSize: '0.65rem',
                          opacity: 0.9,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {selectedOptions.map((option, optionIdx) => (
                            <div key={`${option}-${optionIdx}`}>
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {readOnly && hasAnyFormData && (!apiProductMap || !getApiCartItems) && (
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
                    infantSizeCounts={infantSizeCounts}
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