import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SizePackSelector from '../../features/components/panels/SizePackSelector';
import { getVersionDisplayName } from '../../features/utils';
import {
  normalizeApiProductSelection,
  type ApiProductSelection,
  type ApiVariantQuantities,
  loadApiSchoolOrderState,
  saveApiSchoolOrderState,
} from '../../features/utils/apiOrderState';
import { buildApiOrderCategoryModel, fetchApiSchoolPageData, getProxiedImageUrl, getSchoolPageFromCache } from '../../services/collegeApiService';
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

const ApiCollegeProductDetail: React.FC = () => {
  const { orderTemplateId, productId } = useParams<{ orderTemplateId: string; productId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [product, setProduct] = React.useState<ReturnType<typeof buildApiOrderCategoryModel>['productMap'][string] | null>(null);
  const [selection, setSelection] = React.useState<ApiProductSelection | null>(null);
  const [activeVariant, setActiveVariant] = React.useState<string>('');

  React.useEffect(() => {
    const load = async () => {
      if (!orderTemplateId || !productId) {
        setError('Missing product information.');
        setLoading(false);
        return;
      }

      const decodedProductId = decodeURIComponent(productId);

      // Sync cache check: skip loading when data is already cached
      const cached = getSchoolPageFromCache(orderTemplateId);
      if (cached) {
        const model = buildApiOrderCategoryModel(cached.items);
        const product = model.productMap[decodedProductId];
        if (!product) {
          setError('Product not found.');
          setLoading(false);
          return;
        }
        setProduct(product);
        const defaultVariant = product.defaultVariant || product.variantOptions?.[0] || 'default';
        const sizeLabelsByVariant = product.sizeOptionsByVariant || {
          [defaultVariant]: product.sizeLabels,
        };
        const stored = loadApiSchoolOrderState(orderTemplateId);
        const existing = normalizeApiProductSelection(
          stored?.orderedByProduct?.[decodedProductId],
          defaultVariant,
          sizeLabelsByVariant
        );
        setSelection(existing);
        setActiveVariant(existing.activeVariant || defaultVariant);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data: schoolPageData } = await fetchApiSchoolPageData(orderTemplateId);
        const model = buildApiOrderCategoryModel(schoolPageData.items);
        const product = model.productMap[decodedProductId];

        if (!product) {
          setError('Product not found.');
          return;
        }

        setProduct(product);

        const defaultVariant = product.defaultVariant || product.variantOptions?.[0] || 'default';
        const sizeLabelsByVariant = product.sizeOptionsByVariant || {
          [defaultVariant]: product.sizeLabels,
        };
        const stored = loadApiSchoolOrderState(orderTemplateId);
        const existing = normalizeApiProductSelection(
          stored?.orderedByProduct?.[decodedProductId],
          defaultVariant,
          sizeLabelsByVariant
        );
        setSelection(existing);
        setActiveVariant(existing.activeVariant || defaultVariant);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [orderTemplateId, productId]);

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

  const updateVariantCounts = React.useCallback(
    (variant: string, counts: SizeCounts) => {
      if (!selection || !product) return;
      const sizes = getVariantSizes(variant);
      const nextVariantQuantities = sizes.reduce<ApiVariantQuantities>((acc, size) => {
        const typedSize = size as Size;
        acc[size] = Math.max(0, Number(counts[typedSize] || 0));
        return acc;
      }, {});

      setSelection({
        ...selection,
        activeVariant: variant,
        variantQuantities: {
          ...selection.variantQuantities,
          [variant]: nextVariantQuantities,
        },
      });
    },
    [getVariantSizes, product, selection]
  );

  const handleVariantChange = (variant: string) => {
    if (!selection || !product) return;
    const sizes = getVariantSizes(variant);
    const defaultVariant = product.defaultVariant || variant;
    const normalized = normalizeApiProductSelection(selection, defaultVariant, {
      ...(product.sizeOptionsByVariant || { [defaultVariant]: product.sizeLabels }),
      [variant]: sizes,
    });
    normalized.activeVariant = variant;
    setSelection(normalized);
    setActiveVariant(variant);
  };

  const handleSaveAndReturn = () => {
    if (!orderTemplateId || !productId || !selection) {
      return;
    }
    const decodedProductId = decodeURIComponent(productId);
    const current = loadApiSchoolOrderState(orderTemplateId);
    saveApiSchoolOrderState(orderTemplateId, {
      formData: current?.formData || {
        company: '',
        storeNumber: '',
        storeManager: '',
        orderedBy: '',
        date: '',
      },
      orderedByProduct: {
        ...(current?.orderedByProduct || {}),
        [decodedProductId]: selection,
      },
    });
    navigate(`/api-school/${encodeURIComponent(orderTemplateId)}`);
  };

  if (loading) {
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
    return null;
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
