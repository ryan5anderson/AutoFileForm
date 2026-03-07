import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getPackSizeFromRatiosSync, getSizeScaleFromRatiosSync } from '../../config/garmentRatios';
import { getPackSize, allowsAnyQuantity, getPackSizeSync } from '../../config/packSizes';
import ColorQuantitySelector from '../../features/components/panels/ColorQuantitySelector';
import ColorSizeSelector from '../../features/components/panels/ColorSizeSelector';
import DisplayOptionCard from '../../features/components/panels/DisplayOptionsPanel';
import InfantSizeSelector from '../../features/components/panels/InfantSizeSelector';
import PantOptionsPanel from '../../features/components/panels/PantOptionsPanel';
import ProductCard from '../../features/components/panels/QuantityPanel';
import SizePackSelector from '../../features/components/panels/SizePackSelector';
import StyleCardSelector from '../../features/components/panels/StyleCardSelector';
import { calculateTotalItems, getDisplayProductName, getRackDisplayName, getVersionDisplayName, hasColorOptions, getColorOptions, getSizeOptions, getFilteredShirtVersions } from '../../features/utils';
import { Category, SizeCounts, PantOption, InfantSizeCounts, FormData, ShirtVersion, DisplayOption, SweatpantJoggerOption } from '../../types';
import { asset, getCollegeFolderName } from '../../utils/asset';
import '../../styles/product-detail.css';

interface ProductDetailPageProps {
  categories: Category[];
  formData: FormData;
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onSizeCountsChange?: (imagePath: string, version: keyof ShirtVersion, counts: SizeCounts) => void;
  onDisplayOptionChange?: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  onPantOptionChange?: (imagePath: string, option: PantOption) => void;
  onColorOptionChange?: (imagePath: string, color: string, value: string) => void;
  onShirtColorSizeCountsChange?: (imagePath: string, version: keyof ShirtVersion, color: string, counts: SizeCounts) => void;
  onInfantSizeCountsChange?: (imagePath: string, counts: InfantSizeCounts) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  categories,
  formData,
  onQuantityChange,
  onShirtVersionChange,
  onSizeCountsChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  onPantOptionChange,
  onColorOptionChange,
  onShirtColorSizeCountsChange,
  onInfantSizeCountsChange,
}) => {
  const { college, category: categoryPath, productId } = useParams();
  const navigate = useNavigate();

  // Decode the product ID (image filename)
  const imageName = productId ? decodeURIComponent(productId) : '';
  const decodedCategoryPath = categoryPath ? decodeURIComponent(categoryPath) : '';

  // Find the category from the categories list
  const category = categories.find(cat => cat.path === decodedCategoryPath);

  // Check if this is an applique product (should use simple quantity, not tabs)
  const isApplique = imageName.toLowerCase().includes('applique');

  // State for active tab (for shirt versions and display options) - MUST be before any early returns
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (category?.hasDisplayOptions) {
      return 'displayOnly';
    }
    if (category?.hasShirtVersions && category.shirtVersions) {
      const filteredVersions = getFilteredShirtVersions(
        imageName,
        category.shirtVersions,
        category.tieDyeImages,
        category.crewOnlyImages,
        category.hoodOnlyImages
      );
      // Require user selection when more than one style is available.
      if (filteredVersions.length > 1) {
        return '';
      }
      return filteredVersions[0] || category.shirtVersions[0] || '';
    }
    return '';
  });

  // State for pack sizes (loaded from Firebase with college-specific overrides)
  const [packSizes, setPackSizes] = useState<{ [key: string]: number }>({});

  // Load pack sizes on mount
  useEffect(() => {
    const loadPackSizes = async () => {
      if (!category || !college) return;
      try {
        const sizes: { [key: string]: number } = {};
        
        // Load pack size for default version
        const defaultPackSize = await getPackSize(category.path, undefined, imageName, college);
        sizes['default'] = defaultPackSize;
        
        // Load pack sizes for each shirt version if applicable
        if (category.hasShirtVersions && category.shirtVersions) {
          for (const version of category.shirtVersions) {
            const versionPackSize = await getPackSize(category.path, version, imageName, college);
            sizes[version] = versionPackSize;
          }
        }
        
        setPackSizes(sizes);
      } catch (error) {
        console.error('Error loading pack sizes:', error);
        // Fallback to sync version if async fails
        const { getPackSizeFromRatiosSync } = await import('../../config/garmentRatios');
        const fallbackSize = getPackSizeFromRatiosSync(category.path, undefined) || 7;
        setPackSizes({ default: fallbackSize });
      }
    };

    loadPackSizes();
  }, [category, college, imageName]);

  // Scroll to top when product page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [imageName, categoryPath]);

  const imagePath = category ? `${category.path}/${imageName}` : '';
  const productName = category
    ? (category.name === 'Display Options'
      ? getRackDisplayName(imageName)
      : getDisplayProductName(imageName))
    : '';
  const orderTotalItems = useMemo(() => calculateTotalItems(formData), [formData]);
  const selectedGarmentTotal = useMemo(() => {
    if (!imagePath) return 0;

    if (category?.hasShirtVersions) {
      if (!activeTab) return 0;

      let versionTotal = 0;
      const versionKey = activeTab as keyof ShirtVersion;

      const sizeCountsForVersion = formData.shirtSizeCounts?.[imagePath]?.[versionKey];
      if (sizeCountsForVersion) {
        versionTotal += Object.values(sizeCountsForVersion).reduce((sum, value) => sum + value, 0);
      }

      const colorCountsForVersion = formData.shirtColorSizeCounts?.[imagePath]?.[versionKey];
      if (colorCountsForVersion) {
        Object.values(colorCountsForVersion).forEach((counts) => {
          if (!counts) return;
          versionTotal += Object.values(counts).reduce((sum, value) => sum + value, 0);
        });
      }

      return versionTotal;
    }

    let total = 0;

    total += parseInt(formData.quantities?.[imagePath] || '0', 10) || 0;

    Object.values(formData.colorOptions?.[imagePath] || {}).forEach((qty) => {
      total += parseInt(qty || '0', 10) || 0;
    });

    Object.values(formData.shirtSizeCounts?.[imagePath] || {}).forEach((counts) => {
      if (!counts) return;
      total += Object.values(counts).reduce((sum, value) => sum + value, 0);
    });

    Object.values(formData.shirtColorSizeCounts?.[imagePath] || {}).forEach((colorMap) => {
      if (!colorMap) return;
      Object.values(colorMap).forEach((counts) => {
        if (!counts) return;
        total += Object.values(counts).reduce((sum, value) => sum + value, 0);
      });
    });

    Object.values(formData.infantSizeCounts?.[imagePath] || {}).forEach((qty) => {
      total += qty || 0;
    });

    const pantOption = formData.pantOptions?.[imagePath];
    if (pantOption?.sweatpants) {
      Object.values(pantOption.sweatpants).forEach((counts) => {
        if (!counts) return;
        total += Object.values(counts).reduce((sum, value) => sum + value, 0);
      });
    }
    if (pantOption?.joggers) {
      Object.values(pantOption.joggers).forEach((counts) => {
        if (!counts) return;
        total += Object.values(counts).reduce((sum, value) => sum + value, 0);
      });
    }

    Object.values(formData.sweatpantJoggerOptions?.[imagePath] || {}).forEach((qty) => {
      total += parseInt(qty || '0', 10) || 0;
    });

    const displayOption = formData.displayOptions?.[imagePath];
    if (displayOption) {
      total += parseInt(displayOption.displayOnly || '0', 10) || 0;
      total += parseInt(displayOption.displayStandardCasePack || '0', 10) || 0;
    }

    return total;
  }, [activeTab, category?.hasShirtVersions, formData, imagePath]);

  // Early return AFTER all hooks
  if (!category || !imageName) {
    return (
      <div className="product-detail-error">
        <h2>Product not found</h2>
        <button onClick={() => navigate(`/${college}`)} className="btn-primary">
          Back to Form
        </button>
      </div>
    );
  }

  const handleDone = () => {
    // Navigate back and pass state to restore scroll position
    navigate(`/${college}`, {
      state: {
        scrollToCategory: category.name,
        returnFromProduct: true
      }
    });
  };

  const cardProps = {
    categoryPath: category.path,
    imageName: imageName,
    hideImage: true,
    college,
  };

  // Determine which configuration panel to render
  const renderConfigurationPanel = () => {
    // Determine version for size scale check
    let versionForCheck = 'tshirt'; // default fallback
    if (category.shirtVersions && category.shirtVersions.length > 0) {
      const filteredVersions = getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages, category.crewOnlyImages, category.hoodOnlyImages);
      versionForCheck = filteredVersions.length > 0 ? filteredVersions[0] : category.shirtVersions[0];
    } else if (category.path.includes('jacket')) {
      versionForCheck = 'jacket';
    } else if (category.path.includes('sweatpant')) {
      versionForCheck = 'sweatpants';
    } else if (category.path.includes('short')) {
      versionForCheck = 'shorts';
    } else if (category.path.includes('flannel')) {
      versionForCheck = 'flannels';
    } else if (category.path.includes('sock')) {
      versionForCheck = 'socks';
    }
    
    // Check if size scale is "N/A" - if so, use quantity selector interface
    const sizeScale = getSizeScaleFromRatiosSync(category.path, versionForCheck, college);
    if (sizeScale === 'N/A') {
      const setPack = getPackSizeFromRatiosSync(category.path, versionForCheck, college);
      // If Set Pack is null/undefined, fall back to packSizes config (for stickers, plush, etc.)
      // If Set Pack is 0 or 1, step should be 1. Otherwise use Set Pack value
      let packSize = (setPack === 0 || setPack === 1) ? 1 : (setPack || null);
      if (packSize === null) {
        // Fall back to packSizes config when Set Pack is null (e.g., stickers, plush)
        packSize = getPackSizeSync(category.path, versionForCheck, imageName);
      }
      
      // Check if this product has color options (for non-shirt items like hats)
      const colors = hasColorOptions(imageName) ? getColorOptions(imageName) : [];
      const hasColors = colors.length > 0;
      
      if (hasColors) {
        // For non-shirt items with colors (like hats), show ColorQuantitySelector
        const colorQuantities = formData.colorOptions?.[imagePath] || {};
        return (
          <ColorQuantitySelector
            colors={colors}
            colorQuantities={colorQuantities}
            onChange={(color, value) => onColorOptionChange?.(imagePath, color, value)}
            packSize={packSize}
          />
        );
      } else {
        // Regular quantity selector
        const quantity = formData.quantities?.[imagePath] || '';
        return (
          <ProductCard
            {...cardProps}
            categoryName={category.name}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            college={college}
            packSize={packSize}
          />
        );
      }
    }
    
    // Check if this is an infant product - only if image name contains "infant" or "onsie"
    // Youth products have "youth" in the name and should NOT use infant sizes
    // (For "Youth & Infant" category, we distinguish by image name, not category name)
    const lowerImageName = imageName.toLowerCase();
    const isInfantProduct = lowerImageName.includes('infant') || lowerImageName.includes('onsie');
    
    if (isInfantProduct && onInfantSizeCountsChange) {
      // Handle infant products with 6M/12M sizes
      const infantCounts: InfantSizeCounts = formData.infantSizeCounts?.[imagePath] || { '6M': 0, '12M': 0 };
      const packSize = packSizes['default'] || 6;
      
      return (
        <>
          <div style={{ textAlign: 'center' }}>Choose your sizes or select a curated pack</div>
          <div className="single-option-panel">
            <div className="field">
              <div className="field-label">Quantity</div>
              <div className="field-control">
                <InfantSizeSelector
                  counts={infantCounts}
                  onChange={(c: InfantSizeCounts) => onInfantSizeCountsChange(imagePath, c)}
                  packSize={packSize}
                  allowAnyQuantity={false}
                />
              </div>
            </div>
          </div>
        </>
      );
    }
    
    if (category.hasPantOptions) {
      // Pants with sweatpants/joggers and steel/black/dark navy options with size selection
      const pantOption = formData.pantOptions?.[imagePath] || {
        sweatpants: { steel: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 }, black: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 }, darkNavy: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 } },
        joggers: { steel: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 }, darkHeather: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 } }
      };
      
      return (
        <PantOptionsPanel
          pantOption={pantOption}
          onChange={(option) => onPantOptionChange?.(imagePath, option)}
          pantStyles={category.pantStyles}
          categoryPath={category.path}
          collegeKey={college}
          imagePath={imagePath}
          college={college}
        />
      );
    } else if (category.hasDisplayOptions) {
      const displayOption = formData.displayOptions?.[imagePath] || { displayOnly: '', displayStandardCasePack: '' };
      const displayTabs = ['displayOnly', 'displayStandardCasePack'];
      
      return (
        <>
          <div className="product-detail-tabs">
            {displayTabs.map((tab) => (
              <button
                key={tab}
                className={`product-detail-tab ${activeTab === tab ? 'product-detail-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'displayOnly' ? 'Display Only' : 'Display Standard Case Pack'}
              </button>
            ))}
          </div>
          <div className="product-detail-tab-content">
            {displayTabs.map((tab) => (
              <div 
                key={tab}
                className="product-detail-tab-panel"
                style={{ display: activeTab === tab ? 'block' : 'none' }}
              >
                <DisplayOptionCard
                  {...cardProps}
                  displayOption={displayOption}
                  onDisplayOptionChange={onDisplayOptionChange}
                  activeOption={tab as 'displayOnly' | 'displayStandardCasePack'}
                />
              </div>
            ))}
          </div>
        </>
      );
    } else if (category.hasShirtVersions && category.shirtVersions && getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages, category.crewOnlyImages, category.hoodOnlyImages).length > 0) {
      // Check if this product has color options
      const colors = hasColorOptions(imageName) ? getColorOptions(imageName) : [];
      const hasColors = colors.length > 0;
      const filteredVersions = getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages, category.crewOnlyImages, category.hoodOnlyImages);
      const hasMultipleVersions = filteredVersions.length > 1;
      
      // If only one version, display it as static text (not a tab) and show sizes immediately
      if (!hasMultipleVersions) {
        const version = filteredVersions[0];
        const versionKey = version;
        const packSize = packSizes[version] || packSizes['default'] || 6;

        if (hasColors) {
          // For products with colors, show ColorSizeSelector
          const colorSizeCounts = formData.shirtColorSizeCounts?.[imagePath]?.[versionKey as keyof ShirtVersion] || {};
          const sizesArray = getSizeOptions(category.path, version, college);
          return (
            <>
              <div style={{ 
                textAlign: 'center', 
                fontSize: '1rem',
                fontWeight: '500',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-3)'
              }}>
                {getVersionDisplayName(version, imageName)}
              </div>
              <div style={{ textAlign: 'center' }}>Choose your sizes or select a curated pack</div>
              <ColorSizeSelector
                colors={colors}
                colorSizeCounts={colorSizeCounts}
                onChange={(color, counts) => onShirtColorSizeCountsChange?.(imagePath, versionKey as keyof ShirtVersion, color, counts)}
                categoryPath={category.path}
                version={version}
                sizes={sizesArray}
                packSize={packSize}
                allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                collegeKey={college}
              />
            </>
          );
        } else {
          // For single-color products, show regular SizePackSelector
          const counts: SizeCounts = formData.shirtSizeCounts?.[imagePath]?.[versionKey as keyof ShirtVersion] || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 };
          const packSize = packSizes[version] || packSizes['default'] || 6;
          const sizesArray = getSizeOptions(category.path, version, college);
          return (
            <>
              <div style={{ 
                textAlign: 'center', 
                fontSize: '1rem',
                fontWeight: '500',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-3)'
              }}>
                {getVersionDisplayName(version, imageName)}
              </div>
              <div style={{ textAlign: 'center' }}>Choose your sizes or select a curated pack</div>
              <SizePackSelector
                counts={counts}
                sizes={sizesArray}
                onChange={(c: SizeCounts) => onSizeCountsChange?.(imagePath, versionKey as keyof ShirtVersion, c)}
                packSize={packSize}
                allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                categoryPath={category.path}
                version={version}
                collegeKey={college}
              />
            </>
          );
        }
      }
      
      // Render with style cards - large visual selector (only if more than 1 version)
      const productImageSrc = asset(`${getCollegeFolderName(college || '')}/${imagePath}`);
      const getStyleIconType = (version: string): 'hoodie' | 'longsleeve' | 'crewneck' | undefined => {
        if (version === 'hoodie' || version === 'longsleeve' || version === 'crewneck') {
          return version;
        }
        return undefined;
      };
      const styleOptions = filteredVersions.map((v) => ({
        id: v,
        label: getVersionDisplayName(v, imageName),
        imageSrc: productImageSrc,
        iconType: getStyleIconType(v),
      }));

      return (
        <>
          <StyleCardSelector
            options={styleOptions}
            selectedId={activeTab}
            onSelect={setActiveTab}
          />
          {activeTab && (
            <>
              <div className="product-detail-size-label">Choose your sizes or select a curated pack</div>
              <div className="product-detail-tab-content">
                {filteredVersions.map((version: string) => {
                  const versionKey = version;
                  const packSize = packSizes[version] || packSizes['default'] || 6;

                  if (hasColors) {
                    // For products with colors, show ColorSizeSelector
                    const colorSizeCounts = formData.shirtColorSizeCounts?.[imagePath]?.[versionKey as keyof ShirtVersion] || {};
                    const sizesArray = getSizeOptions(category.path, version, college);
                    return (
                      <div
                        key={version}
                        className="product-detail-tab-panel"
                        style={{ display: activeTab === version ? 'block' : 'none' }}
                      >
                      <ColorSizeSelector
                        colors={colors}
                        colorSizeCounts={colorSizeCounts}
                        onChange={(color, counts) => onShirtColorSizeCountsChange?.(imagePath, versionKey as keyof ShirtVersion, color, counts)}
                        categoryPath={category.path}
                        version={version}
                        sizes={sizesArray}
                        packSize={packSize}
                        allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                        collegeKey={college}
                      />
                      </div>
                    );
                  } else {
                    // For single-color products, show regular SizePackSelector
                    const counts: SizeCounts = formData.shirtSizeCounts?.[imagePath]?.[versionKey as keyof ShirtVersion] || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 };
                    const packSize = packSizes[version] || packSizes['default'] || 6;
                    const sizesArray = getSizeOptions(category.path, version, college);
                    return (
                      <div
                        key={version}
                        className="product-detail-tab-panel"
                        style={{ display: activeTab === version ? 'block' : 'none' }}
                      >
                        <SizePackSelector
                          counts={counts}
                          sizes={sizesArray}
                          onChange={(c: SizeCounts) => onSizeCountsChange?.(imagePath, versionKey as keyof ShirtVersion, c)}
                          packSize={packSize}
                          allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                          categoryPath={category.path}
                          version={version}
                          collegeKey={college}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            </>
          )}
        </>
      );
    } else if (category.hasSizeOptions) {
      // Single shirt version OR applique OR size options - render without tabs, show "Quantity" label with size selector
      let version = 'tshirt'; // default fallback

      if (category.shirtVersions && category.shirtVersions.length > 0) {
        const filteredVersions = getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages, category.crewOnlyImages, category.hoodOnlyImages);
        version = filteredVersions.length > 0 ? filteredVersions[0] : category.shirtVersions[0];
      } else if (category.path.includes('jacket')) {
        version = 'jacket';
      } else if (category.path.includes('sweatpant')) {
        version = 'sweatpants';
      } else if (category.path.includes('short')) {
        version = 'shorts';
      } else if (category.path.includes('flannel')) {
        version = 'flannels';
      } else if (category.path.includes('sock')) {
        version = 'socks';
      } else if (category.path.includes('sticker')) {
        version = 'stickers';
      }
      const versionKey = version;
      const counts: SizeCounts = formData.shirtSizeCounts?.[imagePath]?.[versionKey as keyof ShirtVersion] || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 };
      const packSize = packSizes[version] || packSizes['default'] || 6;
      const sizesArray = getSizeOptions(category.path, version, college);

      return (
        <>
          <div style={{ textAlign: 'center' }}>Choose your sizes or select a curated pack</div>
          <div className="single-option-panel">
            <div className="field">
              <div className="field-label">Quantity</div>
              <div className="field-control">
                <SizePackSelector
                  counts={counts}
                  sizes={sizesArray}
                  onChange={(c: SizeCounts) => onSizeCountsChange?.(imagePath, versionKey as keyof ShirtVersion, c)}
                  packSize={packSize}
                  allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                  categoryPath={category.path}
                  version={version}
                  collegeKey={college}
                />
              </div>
            </div>
          </div>
        </>
      );
    } else {
      // Check if this product has color options (for non-shirt items like hats)
      const colors = hasColorOptions(imageName) ? getColorOptions(imageName) : [];
      const hasColors = colors.length > 0;
      
      if (hasColors) {
        // For non-shirt items with colors (like hats), show ColorQuantitySelector
        const colorQuantities = formData.colorOptions?.[imagePath] || {};
        const packSize = packSizes['default'] || 6;
        return (
          <ColorQuantitySelector
            colors={colors}
            colorQuantities={colorQuantities}
            onChange={(color, value) => onColorOptionChange?.(imagePath, color, value)}
            packSize={packSize}
          />
        );
      } else {
        // Regular quantity selector
        const quantity = formData.quantities?.[imagePath] || '';
        return (
          <ProductCard
            {...cardProps}
            categoryName={category.name}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            sweatpantJoggerOption={category.name === 'Sweatpants/Joggers'
              ? (formData.sweatpantJoggerOptions?.[imagePath] || {sweatpantSteel: '', sweatpantBlack: '', sweatpantDarkNavy: '', joggerSteel: '', joggerDarkHeather: ''})
              : undefined}
            onSweatpantJoggerOptionChange={category.name === 'Sweatpants/Joggers' ? onSweatpantJoggerOptionChange : undefined}
          />
        );
      }
    }
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <div className="product-detail-header-inline">
          <button onClick={handleDone} className="product-detail-back">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
            </svg>
            Back
          </button>
          <h2 className="product-detail-category">{category.name}</h2>
        </div>

        <section className="product-detail-image-section">
          <div className="product-detail-image-container">
            <img
              src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
              alt={imageName}
              className="product-detail-image"
            />
            <div className="product-detail-hero-overlay">
              <h1 className="product-detail-title">{productName}</h1>
              {activeTab && category.hasShirtVersions && category.shirtVersions && getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages, category.crewOnlyImages, category.hoodOnlyImages).length > 1 && (
                <div className="product-detail-selected-style" aria-live="polite">
                  {getVersionDisplayName(activeTab, imageName)}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="product-detail-options-section">
          <div className="product-detail-options-header">
            <h3>Customize</h3>
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
              <strong>Display Only:</strong> Just the display unit without products.<br />
              <strong>Display Standard Case Pack:</strong> Display unit includes products.
            </div>
          )}
          <div className="product-detail-options-content">
            {renderConfigurationPanel()}
          </div>
        </section>
      </div>

      <div className="product-detail-bottom-stack">
        <div className="product-detail-summary-bar" aria-live="polite">
          <div className="product-detail-summary-item">
            <span>Item Count</span>
            <strong>{selectedGarmentTotal}</strong>
          </div>
          <div className="product-detail-summary-item">
            <span>Total</span>
            <strong>{orderTotalItems}</strong>
          </div>
        </div>
        <button onClick={handleDone} className="done-btn">
          Add to Order
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;

