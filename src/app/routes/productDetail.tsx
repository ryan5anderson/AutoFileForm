import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category, SizeCounts, ShirtVersion } from '../../types';
import ProductCard from '../../features/components/panels/QuantityPanel';
import ColorVersionCard from '../../features/components/panels/ColorVersionPanel';
import ShirtColorVersionCard from '../../features/components/panels/ShirtColorPanel';
import DisplayOptionCard from '../../features/components/panels/DisplayOptionsPanel';
import SizePackSelector from '../../features/components/panels/SizePackSelector';
import { getProductName, getRackDisplayName, getImagePath, hasColorVersions, getVersionDisplayName } from '../../features/utils';
import { asset, getCollegeFolderName } from '../../utils/asset';
import '../../styles/product-detail.css';

interface ProductDetailPageProps {
  categories: Category[];
  formData: any;
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: any, value: string) => void;
  onSizeCountsChange?: (imagePath: string, version: any, counts: any) => void;
  onColorVersionChange?: (imagePath: string, color: any, value: string) => void;
  onShirtColorComboChange?: (imagePath: string, version: string, color: string, value: string) => void;
  onShirtColorComboSizeCountsChange?: (imagePath: string, version: string, color: string, counts: any) => void;
  onDisplayOptionChange?: (imagePath: string, option: any, value: string) => void;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: any, value: string) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  categories,
  formData,
  onQuantityChange,
  onShirtVersionChange,
  onSizeCountsChange,
  onColorVersionChange,
  onShirtColorComboChange,
  onShirtColorComboSizeCountsChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
}) => {
  const { college, category: categoryPath, productId } = useParams();
  const navigate = useNavigate();

  // Decode the product ID (image filename)
  const imageName = productId ? decodeURIComponent(productId) : '';
  const decodedCategoryPath = categoryPath ? decodeURIComponent(categoryPath) : '';

  // Find the category from the categories list
  const category = categories.find(cat => cat.path === decodedCategoryPath);

  // Tie-dye special case - calculate before hooks
  const tieDyeImages = [
    'M100965414 SHOUDC OU Go Green DTF on Forest.png',
    'M100482538 SHHODC Hover DTF on Black or Forest .png',
    'M100437896 SHOUDC Over Under DTF on Forest.png',
    'M102595496 SH2FDC Custom DTF on Maroon .png',
  ];
  const isTieDye = imageName ? tieDyeImages.includes(imageName) : false;
  const filteredShirtVersions = isTieDye && category?.shirtVersions
    ? category.shirtVersions.filter((v: string) => v !== 'crewneck')
    : category?.shirtVersions;

  // State for active tab (for shirt versions) - MUST be before any early returns
  const [activeTab, setActiveTab] = useState<string>(
    category?.hasShirtVersions && filteredShirtVersions ? filteredShirtVersions[0] : ''
  );

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
    if (category.hasDisplayOptions) {
      const displayOption = formData.displayOptions?.[imagePath] || { displayOnly: '', displayStandardCasePack: '' };
      return (
        <DisplayOptionCard
          {...cardProps}
          displayOption={displayOption}
          onDisplayOptionChange={onDisplayOptionChange}
        />
      );
    } else if (imageName === 'M100482538 SHHODC Hover DTF on Black or Forest .png' || imageName === 'M102595496 SH2FDC Custom DTF on Maroon .png') {
      const comboVersion = (formData.shirtColorComboSizeCounts?.[imagePath] as any) || {};
      return (
        <ShirtColorVersionCard
          {...cardProps}
          shirtColorComboVersion={comboVersion}
          availableVersions={filteredShirtVersions}
          availableColors={category.colorVersions}
          onShirtColorComboChange={onShirtColorComboChange}
          onShirtColorComboSizeCountsChange={onShirtColorComboSizeCountsChange}
        />
      );
    } else if (hasColorVersions(imageName)) {
      const colorVersion = formData.colorVersions?.[imagePath] || { black: '', forest: '', white: '', gray: '' };
      return (
        <ColorVersionCard
          {...cardProps}
          colorVersions={colorVersion}
          availableColors={category.colorVersions}
          onColorVersionChange={onColorVersionChange}
        />
      );
    } else if (category.hasShirtVersions && filteredShirtVersions && filteredShirtVersions.length > 0) {
      // Render with tabs - each tab shows its own content when active
      return (
        <>
          <div className="product-detail-tabs">
            {filteredShirtVersions.map((version: string) => (
              <button
                key={version}
                className={`product-detail-tab ${activeTab === version ? 'product-detail-tab--active' : ''}`}
                onClick={() => setActiveTab(version)}
              >
                {getVersionDisplayName(version, imageName)}
              </button>
            ))}
          </div>
          <div className="product-detail-tab-content">
            {filteredShirtVersions.map((version: string) => {
              const versionKey = version as keyof ShirtVersion;
              const counts: SizeCounts = formData.shirtSizeCounts?.[imagePath]?.[versionKey] || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
              
              return (
                <div 
                  key={version}
                  className="product-detail-tab-panel"
                  style={{ display: activeTab === version ? 'block' : 'none' }}
                >
                  <SizePackSelector
                    counts={counts}
                    sizes={category.path.includes('sock') ? (['S/M','L/XL'] as any) : undefined}
                    onChange={(c: SizeCounts) => onSizeCountsChange?.(imagePath, versionKey, c)}
                  />
                </div>
              );
            })}
          </div>
        </>
      );
    } else {
      const quantity = formData.quantities?.[imagePath] || '';
      return (
        <ProductCard
          {...cardProps}
          categoryName={category.name}
          quantity={quantity}
          onQuantityChange={onQuantityChange}
          sweatpantJoggerOption={category.name === 'Sweatpants/Joggers' 
            ? (formData.sweatpantJoggerOptions?.[imagePath] || {sweatpantSteel: '', sweatpantOxford: '', joggerSteel: '', joggerOxford: ''}) 
            : undefined}
          onSweatpantJoggerOptionChange={category.name === 'Sweatpants/Joggers' ? onSweatpantJoggerOptionChange : undefined}
        />
      );
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
            <h1 className="product-detail-name">{productName}</h1>
            <div className="product-detail-image-container">
              <img
                src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
                alt={imageName}
                className="product-detail-image"
              />
            </div>
          </div>
        </div>

        <div className="product-detail-options-section">
          <div className="product-detail-options-header">
            <h3>Configure Options</h3>
          </div>
          <div className="product-detail-options-content">
            {renderConfigurationPanel()}
          </div>
          <div className="product-detail-actions">
            <button onClick={handleDone} className="btn-primary btn-large">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

