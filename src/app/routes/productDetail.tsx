import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getPackSize, allowsAnyQuantity } from '../../config/packSizes';
import ColorQuantitySelector from '../../features/components/panels/ColorQuantitySelector';
import ColorSizeSelector from '../../features/components/panels/ColorSizeSelector';
import DisplayOptionCard from '../../features/components/panels/DisplayOptionsPanel';
import InfantSizeSelector from '../../features/components/panels/InfantSizeSelector';
import PantOptionsPanel from '../../features/components/panels/PantOptionsPanel';
import ProductCard from '../../features/components/panels/QuantityPanel';
import SizePackSelector from '../../features/components/panels/SizePackSelector';
import { getDisplayProductName, getRackDisplayName, getVersionDisplayName, hasColorOptions, getColorOptions, getSizeOptions, getFilteredShirtVersions } from '../../features/utils';
import { Category, SizeCounts, PantOption, InfantSizeCounts } from '../../types';
import { asset, getCollegeFolderName } from '../../utils/asset';
import '../../styles/product-detail.css';

interface ProductDetailPageProps {
  categories: Category[];
  formData: any;
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: any, value: string) => void;
  onSizeCountsChange?: (imagePath: string, version: any, counts: any) => void;
  onDisplayOptionChange?: (imagePath: string, option: any, value: string) => void;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: any, value: string) => void;
  onPantOptionChange?: (imagePath: string, option: PantOption) => void;
  onColorOptionChange?: (imagePath: string, color: string, value: string) => void;
  onShirtColorSizeCountsChange?: (imagePath: string, version: any, color: string, counts: any) => void;
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
      // For applique products, default to hoodie. For others, use first available version
      if (isApplique) {
        return 'hoodie';
      }
      return category.shirtVersions[0];
    }
    return '';
  });

  // Scroll to top when product page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [imageName, categoryPath]);

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

  const imagePath = `${category.path}/${imageName}`;
  const productName = category.name === 'Display Options'
    ? getRackDisplayName(imageName)
    : getDisplayProductName(imageName);

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
    // Check if this is an infant product - only if image name contains "infant" or "onsie"
    // Youth products have "youth" in the name and should NOT use infant sizes
    // (For "Youth & Infant" category, we distinguish by image name, not category name)
    const lowerImageName = imageName.toLowerCase();
    const isInfantProduct = lowerImageName.includes('infant') || lowerImageName.includes('onsie');
    
    if (isInfantProduct && onInfantSizeCountsChange) {
      // Handle infant products with 6M/12M sizes
      const infantCounts: InfantSizeCounts = formData.infantSizeCounts?.[imagePath] || { '6M': 0, '12M': 0 };
      const packSize = getPackSize(category.path, undefined, imageName);
      
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
    } else if (category.hasShirtVersions && category.shirtVersions && (category.shirtVersions ? getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages).length > 1 : false)) {
      // Check if this product has color options
      const colors = hasColorOptions(imageName) ? getColorOptions(imageName) : [];
      const hasColors = colors.length > 0;
      
      // Render with tabs - each tab shows its own content when active (only if more than 1 version)
      return (
        <>
          <div className="product-detail-tabs">
            {getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages).map((version: string) => (
              <button
                key={version}
                className={`product-detail-tab ${activeTab === version ? 'product-detail-tab--active' : ''}`}
                onClick={() => setActiveTab(version)}
              >
                {getVersionDisplayName(version, imageName)}
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>Choose your sizes or select a curated pack</div>
          <div className="product-detail-tab-content">
            {getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages).map((version: string) => {
              const versionKey = version;
              const packSize = getPackSize(category.path, version, imageName);

              if (hasColors) {
                // For products with colors, show ColorSizeSelector
                const colorSizeCounts = (formData.shirtColorSizeCounts?.[imagePath] as any)?.[versionKey] || {};
                const sizesArray = getSizeOptions(category.path, version);
                return (
                  <div
                    key={version}
                    className="product-detail-tab-panel"
                    style={{ display: activeTab === version ? 'block' : 'none' }}
                  >
                  <ColorSizeSelector
                    colors={colors}
                    colorSizeCounts={colorSizeCounts}
                    onChange={(color, counts) => onShirtColorSizeCountsChange?.(imagePath, versionKey, color, counts)}
                    categoryPath={category.path}
                    version={version}
                    sizes={sizesArray}
                    packSize={packSize}
                    allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                  />
                  </div>
                );
              } else {
                // For single-color products, show regular SizePackSelector
                const counts: SizeCounts = (formData.shirtSizeCounts?.[imagePath] as any)?.[versionKey] || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 };
                const packSize = getPackSize(category.path, version, imageName);
                const sizesArray = getSizeOptions(category.path, version);
                return (
                  <div
                    key={version}
                    className="product-detail-tab-panel"
                    style={{ display: activeTab === version ? 'block' : 'none' }}
                  >
                    <SizePackSelector
                      counts={counts}
                      sizes={sizesArray}
                      onChange={(c: SizeCounts) => onSizeCountsChange?.(imagePath, versionKey, c)}
                      packSize={packSize}
                      allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                      categoryPath={category.path}
                      version={version}
                    />
                  </div>
                );
              }
            })}
          </div>
        </>
      );
    } else if ((category.hasShirtVersions && category.shirtVersions && category.shirtVersions.length === 1) || (category.shirtVersions ? getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages).length <= 1 : false) || category.hasSizeOptions) {
      // Single shirt version OR applique OR size options - render without tabs, show "Quantity" label with size selector
      let version = 'tshirt'; // default fallback

      if (category.shirtVersions && category.shirtVersions.length > 0) {
        const filteredVersions = getFilteredShirtVersions(imageName, category.shirtVersions, category.tieDyeImages);
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
      const counts: SizeCounts = (formData.shirtSizeCounts?.[imagePath] as any)?.[versionKey] || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 };
      const packSize = getPackSize(category.path, version, imageName);
      const sizesArray = getSizeOptions(category.path, version);

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
                  onChange={(c: SizeCounts) => onSizeCountsChange?.(imagePath, versionKey, c)}
                  packSize={packSize}
                  allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                  categoryPath={category.path}
                  version={version}
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
        const packSize = getPackSize(category.path, undefined, imageName);
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
        <div className="product-detail-left-section">
          <div className="product-detail-header-inline">
            <button onClick={handleDone} className="product-detail-back">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
              </svg>
              Back to Form
            </button>
            <h2 className="product-detail-category">{category.name}</h2>
          </div>
          
          <div className="product-detail-image-section">
            <div className="product-detail-image-container">
              <img
                src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
                alt={imageName}
                className="product-detail-image"
              />
            </div>
          </div>
        </div>

        <div className="product-detail-right-section">
          <h1 className="product-detail-title">{productName}</h1>
          <div className="product-detail-options-section">
            <div className="product-detail-options-header">
              <h3>Configure Options</h3>
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
          </div>
          
          <button onClick={handleDone} className="done-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

