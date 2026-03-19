import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useApiCollegeOrder } from '../../contexts/ApiCollegeOrderContext';
import SizePackSelector from '../../features/components/panels/SizePackSelector';
import { getVersionDisplayName } from '../../features/utils';
import {
  normalizeApiProductSelection,
  type ApiProductSelection,
  type ApiVariantQuantities,
} from '../../features/utils/apiOrderState';
import { getProxiedImageUrl } from '../../services/collegeApiService';
import { Size, SizeCounts } from '../../types';
import '../../styles/product-detail.css';

const ZERO_COUNTS: SizeCounts = {
  XS: 0,
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  XXL: 0,
  XXXL: 0,
  'S/M': 0,
  'L/XL': 0,
  SM: 0,
};

const UNISEX_TSHIRT_VARIANTS = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'];

const ApiCollegeProductDetail: React.FC = () => {
  const { orderTemplateId, productId } = useParams<{ orderTemplateId: string; productId: string }>();
  const navigate = useNavigate();
  const { productMap, orderedByProduct, updateOrderedByProduct, categories, loading, error } = useApiCollegeOrder();

  const decodedProductId = productId ? decodeURIComponent(productId) : '';
  const product = decodedProductId ? productMap[decodedProductId] ?? null : null;
  const defaultVariant = product?.defaultVariant || product?.variantOptions?.[0] || 'default';
  const sizeLabelsByVariant = product?.sizeOptionsByVariant || { [defaultVariant]: product?.sizeLabels || [] };
  const rawSelection = decodedProductId ? orderedByProduct[decodedProductId] : undefined;
  const selection = rawSelection
    ? normalizeApiProductSelection(rawSelection, defaultVariant, sizeLabelsByVariant)
    : null;
  const activeVariant = selection?.activeVariant || defaultVariant;

  const getVariantSizes = React.useCallback(
    (variant: string): string[] => {
      if (!product) return [];
      return product.sizeOptionsByVariant?.[variant] || product.sizeLabels || [];
    },
    [product]
  );

  const toSizeCounts = React.useCallback(
    (quantities: ApiVariantQuantities, sizes: string[]): SizeCounts => {
      const next: SizeCounts = { ...ZERO_COUNTS };
      sizes.forEach((size) => {
        const typedSize = size as Size;
        next[typedSize] = quantities[size] || 0;
      });
      return next;
    },
    []
  );

  const persistSelection = React.useCallback(
    (newSelection: ApiProductSelection) => {
      if (decodedProductId) {
        updateOrderedByProduct(decodedProductId, newSelection);
      }
    },
    [decodedProductId, updateOrderedByProduct]
  );

  const updateVariantCounts = React.useCallback(
    (variant: string, counts: SizeCounts) => {
      if (!selection || !product) return;
      const sizes = getVariantSizes(variant);
      const nextVariantQuantities = sizes.reduce<ApiVariantQuantities>((acc, size) => {
        const typedSize = size as Size;
        acc[size] = Math.max(0, Number(counts[typedSize] || 0));
        return acc;
      }, {});

      const newSelection: ApiProductSelection = {
        ...selection,
        activeVariant: variant,
        variantQuantities: {
          ...selection.variantQuantities,
          [variant]: nextVariantQuantities,
        },
      };
      persistSelection(newSelection);
    },
    [getVariantSizes, product, selection, persistSelection]
  );

  const handleVariantChange = (variant: string) => {
    if (!selection || !product) return;
    const sizes = getVariantSizes(variant);
    const defaultV = product.defaultVariant || variant;
    const normalized = normalizeApiProductSelection(selection, defaultV, {
      ...(product.sizeOptionsByVariant || { [defaultV]: product.sizeLabels }),
      [variant]: sizes,
    });
    normalized.activeVariant = variant;
    persistSelection(normalized);
  };

  const handleSaveAndReturn = () => {
    navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}`);
  };

  if (loading && !product) {
    return <div className="product-detail-container">Loading product details...</div>;
  }

  if (error) {
    return (
      <div className="product-detail-container">
        <div className="error-message">{error}</div>
        <button className="btn-secondary" onClick={() => navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}`)}>
          Back to Order Form
        </button>
      </div>
    );
  }

  if (!product || !selection) {
    return (
      <div className="product-detail-container">
        <div className="error-message">Product not found.</div>
        <button className="btn-secondary" onClick={() => navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}`)}>
          Back to Order Form
        </button>
      </div>
    );
  }

  const variantOptions = product.variantOptions && product.variantOptions.length > 0
    ? product.variantOptions
    : [product.defaultVariant || 'default'];
  const currentVariant = variantOptions.includes(activeVariant) ? activeVariant : variantOptions[0];
  const currentSizes = getVariantSizes(currentVariant);
  const currentQuantities = selection.variantQuantities[currentVariant] || {};
  const currentCounts = toSizeCounts(currentQuantities, currentSizes);
  const packSize = product.packSizeByVariant?.[currentVariant] || 1;
  const allowAnyQuantity = product.allowAnyQuantityByVariant?.[currentVariant] || false;
  const imageUrl = getProxiedImageUrl(product.imageUrl);

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <div className="product-detail-left-section">
          <div className="product-detail-header-inline">
            <button
              className="product-detail-back"
              type="button"
              onClick={() => navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}`)}
            >
              Back to Form
            </button>
            <h2 className="product-detail-category">{product.categoryName || 'Products'}</h2>
          </div>

          <div className="product-detail-image-section">
            <div className="product-detail-image-container">
              <img className="product-detail-image" src={imageUrl || ''} alt={product.productName} />
            </div>
          </div>
        </div>

        <div className="product-detail-right-section">
          <h1 className="product-detail-title">{product.productName}</h1>
          <div className="product-detail-options-section">
            <div className="product-detail-options-header">
              <h3>Configure Options</h3>
            </div>
            <div className="product-detail-options-content">
              {variantOptions.length > 1 && (
                <div className="product-detail-tabs">
                  {variantOptions.map((variant) => (
                    <button
                      key={variant}
                      className={`product-detail-tab ${currentVariant === variant ? 'product-detail-tab--active' : ''}`}
                      onClick={() => handleVariantChange(variant)}
                    >
                      {getVersionDisplayName(variant)}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>Choose your sizes or select a curated pack</div>
              <SizePackSelector
                counts={currentCounts}
                sizes={currentSizes as Size[]}
                onChange={(counts) => updateVariantCounts(currentVariant, counts)}
                packSize={packSize}
                allowAnyQuantity={allowAnyQuantity}
              />
            </div>
          </div>

          <button className="done-btn" type="button" onClick={handleSaveAndReturn}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiCollegeProductDetail;
