import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getDefaultOrderedFields,
  loadApiSchoolOrderState,
  saveApiSchoolOrderState,
  type ApiOrderedFields,
} from '../../features/utils/apiOrderState';
import { buildApiOrderCategoryModel, fetchCollegeOrder, getProxiedImageUrl } from '../../services/collegeApiService';
import '../../styles/product-detail.css';

const ApiCollegeProductDetail: React.FC = () => {
  const { orderTemplateId, productId } = useParams<{ orderTemplateId: string; productId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [productName, setProductName] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [sizeLabels, setSizeLabels] = React.useState<string[]>([]);
  const [orderedFields, setOrderedFields] = React.useState<ApiOrderedFields>(getDefaultOrderedFields());

  React.useEffect(() => {
    const load = async () => {
      if (!orderTemplateId || !productId) {
        setError('Missing product information.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const decodedProductId = decodeURIComponent(productId);
        const items = await fetchCollegeOrder(orderTemplateId);
        const model = buildApiOrderCategoryModel(items);
        const product = model.productMap[decodedProductId];

        if (!product) {
          setError('Product not found.');
          return;
        }

        setProductName(product.productName);
        setSubtitle(product.subtitle || '');
        setImageUrl(getProxiedImageUrl(product.imageUrl));
        setSizeLabels(product.sizeLabels.length > 0 ? product.sizeLabels : ['SM', 'MD', 'LG', 'XL', 'XXL']);

        const stored = loadApiSchoolOrderState(orderTemplateId);
        const existing = stored?.orderedByProduct?.[decodedProductId] || getDefaultOrderedFields();
        setOrderedFields(existing);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [orderTemplateId, productId]);

  const updateField = (index: number, value: string) => {
    const safeValue = value === '' ? '0' : String(Math.max(0, parseInt(value, 10) || 0));
    const next: ApiOrderedFields = { ...orderedFields };
    if (index === 0) next.ORDERED1 = safeValue;
    if (index === 1) next.ORDERED2 = safeValue;
    if (index === 2) next.ORDERED3 = safeValue;
    if (index === 3) next.ORDERED4 = safeValue;
    if (index === 4) next.ORDERED5 = safeValue;
    setOrderedFields(next);
  };

  const handleSaveAndReturn = () => {
    if (!orderTemplateId || !productId) {
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
        [decodedProductId]: orderedFields,
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

  const sizeValues = [
    orderedFields.ORDERED1,
    orderedFields.ORDERED2,
    orderedFields.ORDERED3,
    orderedFields.ORDERED4,
    orderedFields.ORDERED5,
  ];

  return (
    <div className="product-detail-container">
      <button
        className="product-detail-back"
        type="button"
        onClick={() => navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}`)}
      >
        Back to products
      </button>

      <div className="api-product-detail-main-card">
        <div className="api-product-detail-image-wrap">
          <img className="api-product-detail-image" src={imageUrl || ''} alt={productName} />
        </div>
        <div className="api-product-detail-info">
          <h1 className="api-product-detail-title">{productName}</h1>
          {subtitle && <p className="api-product-detail-subtitle">{subtitle}</p>}
          <div className="api-product-detail-sizes">
            <h3>Quantities</h3>
            <div className="api-product-detail-size-grid">
              {sizeLabels.slice(0, 5).map((label, index) => (
                <div key={label} className="api-product-detail-size-input">
                  <label>{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={sizeValues[index] || '0'}
                    onChange={(e) => updateField(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
          <button className="btn-primary" type="button" onClick={handleSaveAndReturn}>
            Save and Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiCollegeProductDetail;
