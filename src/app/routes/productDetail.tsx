import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category, SizeCounts, PantOption } from '../../shared/types';
import ProductCard from '../../features/order-form/components/panels/QuantityPanel';
import DisplayOptionCard from '../../features/order-form/components/panels/DisplayOptionsPanel';
import SizePackSelector from '../../features/order-form/components/panels/SizePackSelector';
import ColorSizeSelector from '../../features/order-form/components/panels/ColorSizeSelector';
import ColorQuantitySelector from '../../features/order-form/components/panels/ColorQuantitySelector';
import PantOptionsPanel from '../../features/order-form/components/panels/PantOptionsPanel';
import { getProductName, getRackDisplayName, getImagePath, getVersionDisplayName, hasColorOptions, getColorOptions, getSizeOptions, getFilteredShirtVersions } from '../../features/order-form/utils';
import { asset, getCollegeFolderName } from '../../shared/utils/asset';
import { getPackSize, allowsAnyQuantity } from '../../config/packSizes';
import styles from './ProductDetailPage.module.css';

interface ProductDetailPageProps {
  categories: Category[];
  formData: any;
  onQuantityChange?: (imagePath: string, value: string) => void;

  onSizeCountsChange?: (imagePath: string, version: any, counts: any) => void;
  onDisplayOptionChange?: (imagePath: string, option: any, value: string) => void;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: any, value: string) => void;
  onPantOptionChange?: (imagePath: string, option: PantOption) => void;
  onColorOptionChange?: (imagePath: string, color: string, value: string) => void;
  onShirtColorSizeCountsChange?: (imagePath: string, version: any, color: string, counts: any) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  categories,
  formData,
  onQuantityChange,

  onSizeCountsChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  onPantOptionChange,
  onColorOptionChange,
  onShirtColorSizeCountsChange,
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

  // Early return AFTER all hooks
  if (!category || !imageName) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2 className={styles.errorTitle}>Product not found</h2>
          <button onClick={() => navigate(`/${college}`)} className={styles.errorButton}>
            Back to Form
          </button>
        </div>
      </div>
    );
  }

  const imagePath = getImagePath(category.path, imageName);
  const productName = category.name === 'Display Options'
    ? getRackDisplayName(imageName)
    : getProductName(imageName);

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
    if (category.hasPantOptions) {
      // Pants with sweatpants/joggers and steel/black/dark navy options with size selection
      const pantOption = formData.pantOptions?.[imagePath] || {
        sweatpants: { steel: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 }, black: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 }, darkNavy: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 } },
        joggers: { steel: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 }, darkHeather: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 } }
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
          <div className={styles.tabs} role="tablist">
            {displayTabs.map((tab) => (
              <button
                key={tab}
                className={styles.tab}
                data-active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`panel-${tab}`}
              >
                {tab === 'displayOnly' ? 'Display Only' : 'Display Standard Case Pack'}
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            {displayTabs.map((tab) => (
              <div 
                key={tab}
                id={`panel-${tab}`}
                className={styles.tabPanel}
                data-active={activeTab === tab}
                role="tabpanel"
                aria-labelledby={`tab-${tab}`}
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
    } else if (category.hasShirtVersions && category.shirtVersions && (category.shirtVersions ? getFilteredShirtVersions(imageName, category.shirtVersions).length > 1 : false)) {
      // Check if this product has color options
      const colors = hasColorOptions(imageName) ? getColorOptions(imageName) : [];
      const hasColors = colors.length > 0;
      
      // Render with tabs - each tab shows its own content when active (only if more than 1 version)
      return (
        <>
          <div className={styles.tabs} role="tablist">
            {getFilteredShirtVersions(imageName, category.shirtVersions).map((version: string) => (
              <button
                key={version}
                className={styles.tab}
                data-active={activeTab === version}
                onClick={() => setActiveTab(version)}
                role="tab"
                aria-selected={activeTab === version}
                aria-controls={`panel-${version}`}
              >
                {getVersionDisplayName(version, imageName)}
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            {getFilteredShirtVersions(imageName, category.shirtVersions).map((version: string) => {
              const versionKey = version;
              const packSize = getPackSize(category.path, version, imageName);

              if (hasColors) {
                // For products with colors, show ColorSizeSelector
                const colorSizeCounts = (formData.shirtColorSizeCounts?.[imagePath] as any)?.[versionKey] || {};
                const sizesArray = getSizeOptions(category.path, version);
                return (
                  <div
                    key={version}
                    id={`panel-${version}`}
                    className={styles.tabPanel}
                    data-active={activeTab === version}
                    role="tabpanel"
                    aria-labelledby={`tab-${version}`}
                  >
                  <ColorSizeSelector
                    colors={colors}
                    colorSizeCounts={colorSizeCounts}
                    onChange={(color, counts) => onShirtColorSizeCountsChange?.(imagePath, versionKey, color, counts)}
                    sizes={sizesArray}
                    packSize={packSize}
                    allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                  />
                  </div>
                );
              } else {
                // For single-color products, show regular SizePackSelector
                const counts: SizeCounts = (formData.shirtSizeCounts?.[imagePath] as any)?.[versionKey] || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 };
                const packSize = getPackSize(category.path, version, imageName);
                const sizesArray = getSizeOptions(category.path, version);
                return (
                  <div
                    key={version}
                    id={`panel-${version}`}
                    className={styles.tabPanel}
                    data-active={activeTab === version}
                    role="tabpanel"
                    aria-labelledby={`tab-${version}`}
                  >
                    <SizePackSelector
                      counts={counts}
                      sizes={sizesArray}
                      onChange={(c: SizeCounts) => onSizeCountsChange?.(imagePath, versionKey, c)}
                      packSize={packSize}
                      allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
                    />
                  </div>
                );
              }
            })}
          </div>
        </>
      );
    } else if ((category.hasShirtVersions && category.shirtVersions && category.shirtVersions.length === 1) || (category.shirtVersions ? getFilteredShirtVersions(imageName, category.shirtVersions).length <= 1 : false) || category.hasSizeOptions) {
      // Single shirt version OR applique OR size options - render without tabs, show "Quantity" label with size selector
      let version = 'tshirt'; // default fallback

      if (category.shirtVersions && category.shirtVersions.length > 0) {
        const filteredVersions = getFilteredShirtVersions(imageName, category.shirtVersions);
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
      const counts: SizeCounts = (formData.shirtSizeCounts?.[imagePath] as any)?.[versionKey] || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 };
      const packSize = getPackSize(category.path, version, imageName);
      const sizesArray = getSizeOptions(category.path, version);

      return (
        <div className={styles.singleOptionPanel}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Quantity</label>
            <div className={styles.fieldControl}>
              <SizePackSelector
                counts={counts}
                sizes={sizesArray}
                onChange={(c: SizeCounts) => onSizeCountsChange?.(imagePath, versionKey, c)}
                packSize={packSize}
                allowAnyQuantity={!isApplique && allowsAnyQuantity(category.path, version, imageName)}
              />
            </div>
          </div>
        </div>
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
    <div className={styles.container}>
      <main className={styles.productDetail}>
        {/* Image Section */}
        <section className={styles.imageSection}>
          <button onClick={handleDone} className={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
            </svg>
            Back to Form
          </button>
          
          <p className={styles.categoryBreadcrumb}>{category.name}</p>
          
          <div className={styles.imageContainer}>
            <img
              src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
              alt={productName}
              className={styles.productImage}
            />
          </div>
        </section>

        {/* Product Info Section */}
        <section className={styles.productInfo}>
          <header className={styles.productHeader}>
            <p className={styles.productCategory}>{category.name}</p>
            <h1 className={styles.productTitle}>{productName}</h1>
          </header>

          <div className={styles.configSection}>
            <div className={styles.configHeader}>
              <h2 className={styles.configTitle}>Configure Options</h2>
              {category.hasDisplayOptions && (
                <div className={styles.configDescription}>
                  <strong>Display Only:</strong> Just the display unit without garments.<br />
                  <strong>Display Standard Case Pack:</strong> Display unit includes garments.
                </div>
              )}
            </div>

            <div 
              className={styles.optionsContent}
              data-scrollable={!category.hasPantOptions}
            >
              {renderConfigurationPanel()}
            </div>

            <div className={styles.actions}>
              <button onClick={handleDone} className={styles.doneButton}>
                Done
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetailPage;

