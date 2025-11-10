import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { colleges } from '../../config';
import { 
  getGarmentRatio, 
  getPackSizeFromRatios, 
  getSizeScaleFromRatios, 
  getSizeDistributionRatios,
  getGarmentName,
  clearRatiosCache
} from '../../config/garmentRatios';
import GarmentRatioEditor from '../../features/components/GarmentRatioEditor';
import { getDisplayProductName, getRackDisplayName, getVersionDisplayName } from '../../features/utils';
import { Category } from '../../types';
import { asset, getCollegeFolderName } from '../../utils/asset';
import '../../styles/product-detail.css';

const AdminProductDetail: React.FC = () => {
  const { collegeKey, category: categoryPath, productId } = useParams();
  const navigate = useNavigate();

  // Decode the product ID (image filename)
  const imageName = productId ? decodeURIComponent(productId) : '';
  const decodedCategoryPath = categoryPath ? decodeURIComponent(categoryPath) : '';

  // Get college config
  const collegeConfig = collegeKey ? colleges[collegeKey as keyof typeof colleges] : undefined;
  const categories: Category[] = collegeConfig?.categories ?? [];

  // Find the category from the categories list
  const category = categories.find(cat => cat.path === decodedCategoryPath);

  // State for active tab (for products with multiple versions)
  const [activeTab, setActiveTab] = useState<string>('default');
  
  // State for ratios and edit mode
  const [ratiosData, setRatiosData] = useState<{ [key: string]: any }>({});
  const [editingVersion, setEditingVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine if this is an infant product based on image name
  const isInfantProduct = imageName.toLowerCase().includes('infant') || imageName.toLowerCase().includes('onsie');

  // Update activeTab when category is available
  useEffect(() => {
    if (category?.hasShirtVersions && category.shirtVersions && category.shirtVersions.length > 0) {
      setActiveTab(category.shirtVersions[0]);
    }
  }, [category]);

  // Apply college-specific theme
  useEffect(() => {
    if (collegeKey === 'arizonastate') {
      document.documentElement.style.setProperty('--color-primary', '#8c2434');
    } else if (collegeKey === 'michiganstate') {
      document.documentElement.style.setProperty('--color-primary', '#166534');
    } else if (collegeKey === 'oregonuniversity') {
      document.documentElement.style.setProperty('--color-primary', '#007030');
    } else if (collegeKey === 'westvirginiauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#002855');
    } else if (collegeKey === 'pittsburghuniversity') {
      document.documentElement.style.setProperty('--color-primary', '#003594');
    } else if (collegeKey === 'alabamauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#9E1B32');
    } else {
      document.documentElement.style.setProperty('--color-primary', '#111111');
    }
  }, [collegeKey]);

  // Scroll to top when product page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [imageName, categoryPath]);

  // Load ratios data on mount
  useEffect(() => {
    if (!category || !collegeKey) return;
    
    const loadRatios = async () => {
      setLoading(true);
      try {
        const categoryPathToUse = isInfantProduct && category.path.includes('youth') ? 'infant' : category.path;
        const versionsToCheck = category.hasShirtVersions && category.shirtVersions 
          ? category.shirtVersions 
          : [undefined];
        
        const data: { [key: string]: any } = {};
        for (const version of versionsToCheck) {
          const ratio = await getGarmentRatio(categoryPathToUse, version, collegeKey);
          const packSize = await getPackSizeFromRatios(categoryPathToUse, version, collegeKey);
          const sizeScale = await getSizeScaleFromRatios(categoryPathToUse, version, collegeKey);
          const sizeDistribution = await getSizeDistributionRatios(categoryPathToUse, version, collegeKey);
          
          data[version || 'default'] = {
            ratio,
            packSize,
            sizeScale,
            sizeDistribution,
            version
          };
        }
        setRatiosData(data);
      } catch (error) {
        console.error('Error loading ratios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRatios();
  }, [category, collegeKey, isInfantProduct]);

  // Early return if category or image not found
  if (!category || !imageName || !collegeConfig) {
    return (
      <div className="product-detail-error">
        <h2>Product not found</h2>
        <button onClick={() => navigate(`/admin/college/${collegeKey}`)} className="btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  const imagePath = `${category.path}/${imageName}`;
  const productName = category.name === 'Display Options'
    ? getRackDisplayName(imageName)
    : getDisplayProductName(imageName);

  const handleBack = () => {
    navigate(`/admin/college/${collegeKey}`);
  };

  // Get garment ratio data (now from state)
  const getRatioInfo = (version?: string) => {
    return ratiosData[version || 'default'] || {
      ratio: null,
      packSize: null,
      sizeScale: null,
      sizeDistribution: null,
      version
    };
  };

  const handleEdit = (version?: string) => {
    setEditingVersion(version || 'default');
  };

  const handleSave = async () => {
    if (!editingVersion) return;
    
    // Reload ratios after save/revert
    const versionToReload = editingVersion === 'default' ? undefined : editingVersion;
    setEditingVersion(null);
    
    // Clear cache first to ensure fresh data
    clearRatiosCache(collegeKey);
    
    const categoryPathToUse = isInfantProduct && category.path.includes('youth') ? 'infant' : category.path;
    const ratio = await getGarmentRatio(categoryPathToUse, versionToReload, collegeKey);
    const packSize = await getPackSizeFromRatios(categoryPathToUse, versionToReload, collegeKey);
    const sizeScale = await getSizeScaleFromRatios(categoryPathToUse, versionToReload, collegeKey);
    const sizeDistribution = await getSizeDistributionRatios(categoryPathToUse, versionToReload, collegeKey);
    
    setRatiosData(prev => ({
      ...prev,
      [versionToReload || 'default']: { ratio, packSize, sizeScale, sizeDistribution, version: versionToReload }
    }));
  };

  const handleCancel = () => {
    setEditingVersion(null);
  };

  // Render ratio information for a version
  const renderRatioInfo = (version?: string) => {
    const { ratio, packSize, sizeScale, sizeDistribution } = getRatioInfo(version);
    const versionKey = version || 'default';
    const isEditing = editingVersion === versionKey;
    
    if (isEditing && ratio) {
      const garmentName = getGarmentName(
        isInfantProduct && category.path.includes('youth') ? 'infant' : category.path,
        version
      );
      if (garmentName) {
        return (
          <GarmentRatioEditor
            ratio={ratio}
            garmentName={garmentName}
            collegeKey={collegeKey || ''}
            onSave={handleSave}
            onCancel={handleCancel}
            onRevert={handleSave}
          />
        );
      }
    }
    
    if (!packSize && !sizeScale && !sizeDistribution) {
      return null;
    }

    return (
      <div key={version || 'default'} className="product-detail-tab-panel">
        <div className="single-option-panel">
          {packSize !== null && (
            <div className="field">
              <div className="field-label">Set Pack</div>
              <div className="field-control">
                <div style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-primary)',
                  padding: '0.5rem 0'
                }}>
                  {packSize}
                </div>
              </div>
            </div>
          )}
          
          {sizeScale && (
            <div className="field">
              <div className="field-label">Size Scale</div>
              <div className="field-control">
                <div style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text)',
                  padding: '0.5rem 0'
                }}>
                  {sizeScale}
                </div>
              </div>
            </div>
          )}
          
          {sizeDistribution && Object.keys(sizeDistribution).length > 0 && (
            <div className="field">
              <div className="field-label">Size Distribution (per pack)</div>
              <div className="field-control">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {Object.entries(sizeDistribution).map(([size, quantity]) => (
                    <div key={size} style={{
                      padding: '0.75rem',
                      background: 'var(--color-bg)',
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      textAlign: 'center',
                      boxShadow: '0 1px 3px rgb(0 0 0 / 10%)'
                    }}>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-gray-500)',
                        marginBottom: '0.25rem',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        {size}
                      </div>
                      <div style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--color-primary)'
                      }}>
                        {typeof quantity === 'number' ? quantity : 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get all versions to display
  const getVersionsToDisplay = (): (string | undefined)[] => {
    if (category.hasShirtVersions && category.shirtVersions) {
      return category.shirtVersions;
    }
    return [undefined]; // Just show default
  };

  const versionsToDisplay = getVersionsToDisplay();
  const hasAnyRatioInfo = versionsToDisplay.some(version => {
    const { packSize, sizeScale, sizeDistribution } = getRatioInfo(version);
    return packSize !== null || sizeScale || (sizeDistribution && Object.keys(sizeDistribution).length > 0);
  });

  if (loading) {
    return (
      <div className="product-detail-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading garment ratios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <div className="product-detail-left-section">
          <div className="product-detail-header-inline">
            <button onClick={handleBack} className="product-detail-back">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
              </svg>
              Back to Products
            </button>
            <h2 className="product-detail-category">{category.name}</h2>
          </div>
          
          <div className="product-detail-image-section">
            <div className="product-detail-image-container">
              <img
                src={asset(`${getCollegeFolderName(collegeKey || '')}/${imagePath}`)}
                alt={imageName}
                className="product-detail-image"
              />
            </div>
          </div>
        </div>

        <div className="product-detail-right-section">
          <h1 className="product-detail-title">{productName}</h1>
          
          <div className="product-detail-options-section">
            <div className="product-detail-options-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Garment Ratio Information</h3>
              {!editingVersion && hasAnyRatioInfo && (
                <button
                  onClick={() => handleEdit(activeTab === 'default' ? undefined : activeTab)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  Edit
                </button>
              )}
            </div>
            
            {hasAnyRatioInfo ? (
              <div className="product-detail-options-content">
                {versionsToDisplay.length > 1 ? (
                  <>
                    <div className="product-detail-tabs">
                      {versionsToDisplay.map((version) => {
                        const versionDisplayName = version ? getVersionDisplayName(version) : 'Default';
                        const { packSize, sizeScale, sizeDistribution } = getRatioInfo(version);
                        const hasInfo = packSize !== null || sizeScale || (sizeDistribution && Object.keys(sizeDistribution).length > 0);
                        
                        if (!hasInfo) return null;
                        
                        return (
                          <button
                            key={version || 'default'}
                            className={`product-detail-tab ${activeTab === (version || 'default') ? 'product-detail-tab--active' : ''}`}
                            onClick={() => setActiveTab(version || 'default')}
                          >
                            {versionDisplayName}
                          </button>
                        );
                      })}
                    </div>
                    <div className="product-detail-tab-content">
                      {versionsToDisplay.map((version) => {
                        const { packSize, sizeScale, sizeDistribution } = getRatioInfo(version);
                        const hasInfo = packSize !== null || sizeScale || (sizeDistribution && Object.keys(sizeDistribution).length > 0);
                        
                        if (!hasInfo) return null;
                        
                        return (
                          <div
                            key={version || 'default'}
                            className="product-detail-tab-panel"
                            style={{ display: activeTab === (version || 'default') ? 'block' : 'none' }}
                          >
                            {renderRatioInfo(version)}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="product-detail-options-content">
                    {renderRatioInfo(versionsToDisplay[0])}
                  </div>
                )}
              </div>
            ) : (
              <div className="product-detail-options-content">
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--color-gray-500)'
                }}>
                  <p style={{ margin: 0 }}>
                    No garment ratio information available for this product.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetail;

