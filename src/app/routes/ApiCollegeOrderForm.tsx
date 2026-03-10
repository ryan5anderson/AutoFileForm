import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CategorySection from '../../features/components/CategorySection';
import StoreInfoForm from '../../features/components/StoreInfoForm';
import {
  getDefaultProductSelection,
  getProductSelectionTotal,
  loadApiSchoolOrderState,
  normalizeApiProductSelection,
  saveApiSchoolOrderState,
  type ApiProductSelection,
} from '../../features/utils/apiOrderState';
import { buildApiOrderCategoryModel, fetchApiSchoolPageData, getProxiedImageUrl } from '../../services/collegeApiService';
import { ApiOrderProduct, Category, FormData } from '../../types';
import CollapsibleSidebar from '../layout/CollapsibleSidebar';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import '../../styles/college-pages.css';

const createInitialFormData = (): FormData => ({
  company: '',
  storeNumber: '',
  storeManager: '',
  orderedBy: '',
  date: '',
  orderNotes: '',
  quantities: {},
});

const ApiCollegeOrderForm: React.FC = () => {
  const { orderTemplateId } = useParams<{ orderTemplateId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [productMap, setProductMap] = React.useState<Record<string, ApiOrderProduct>>({});
  const [formData, setFormData] = React.useState<FormData>(createInitialFormData());
  const [orderedByProduct, setOrderedByProduct] = React.useState<Record<string, ApiProductSelection>>({});
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchOrder = async () => {
      if (!orderTemplateId) {
        setError('Missing order template ID.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const schoolPageData = await fetchApiSchoolPageData(orderTemplateId);
        const model = buildApiOrderCategoryModel(schoolPageData.items);
        setCategories(model.categories);
        setProductMap(model.productMap);

        const stored = loadApiSchoolOrderState(orderTemplateId);
        if (stored) {
          setFormData((prev) => ({
            ...prev,
            ...stored.formData,
          }));
          const normalizedState: Record<string, ApiProductSelection> = {};
          Object.keys(model.productMap).forEach((productId) => {
            const product = model.productMap[productId];
            const sizeLabelsByVariant = product.sizeOptionsByVariant || {
              [product.defaultVariant || 'default']: product.sizeLabels,
            };
            normalizedState[productId] = normalizeApiProductSelection(
              stored.orderedByProduct?.[productId],
              product.defaultVariant || 'default',
              sizeLabelsByVariant
            );
          });
          setOrderedByProduct(normalizedState);
        } else {
          setFormData(createInitialFormData());
          setOrderedByProduct({});
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load API order.');
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [orderTemplateId]);

  React.useEffect(() => {
    if (!orderTemplateId) {
      return;
    }
    saveApiSchoolOrderState(orderTemplateId, {
      formData: {
        company: formData.company,
        storeNumber: formData.storeNumber,
        storeManager: formData.storeManager,
        orderedBy: formData.orderedBy,
        date: formData.date,
      },
      orderedByProduct,
    });
  }, [formData.company, formData.date, formData.orderedBy, formData.storeManager, formData.storeNumber, orderTemplateId, orderedByProduct]);

  const quantities = React.useMemo(() => {
    const next: Record<string, string> = {};
    categories.forEach((category) => {
      category.images.forEach((imageName) => {
        const product = productMap[imageName];
        const defaultVariant = product?.defaultVariant || 'default';
        const sizeLabelsByVariant = product?.sizeOptionsByVariant || {
          [defaultVariant]: product?.sizeLabels || [],
        };
        const selection = orderedByProduct[imageName] || getDefaultProductSelection(defaultVariant, sizeLabelsByVariant[defaultVariant] || []);
        next[`${category.path}/${imageName}`] = String(getProductSelectionTotal(selection));
      });
    });
    return next;
  }, [categories, orderedByProduct, productMap]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const imageSrcResolver = (_categoryPath: string, imageName: string) => {
    const product = productMap[imageName];
    return getProxiedImageUrl(product?.imageUrl) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  };

  const productTitleResolver = (_categoryPath: string, imageName: string) => {
    const product = productMap[imageName];
    return product?.productName || 'Product';
  };

  const productDetailPathResolver = (_categoryPath: string, imageName: string) => {
    return `/api-school/${encodeURIComponent(orderTemplateId || '')}/product/${encodeURIComponent(imageName)}`;
  };

  return (
    <div className="college-page-container">
      <div className="college-page-header">
        <Header showSidebarToggle={true} onSidebarToggle={toggleSidebar} />
      </div>

      <CollapsibleSidebar
        categories={categories}
        activeSection={categories[0]?.name.toLowerCase().replace(/\s+/g, '-') || ''}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onBackToColleges={() => navigate('/')}
        showCategories={true}
      />

      <main className="college-page-main">
        <div className="college-page-title">
          <button
            className="btn-secondary"
            type="button"
            onClick={() => navigate('/', { state: { showApiSchools: true } })}
            style={{ marginBottom: 'var(--space-3)' }}
          >
            Back to API Schools
          </button>
          <h1>School Product Order Form</h1>
          <p>Select your merchandise and quantities below</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Loading order data...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <form onSubmit={(e) => e.preventDefault()}>
            <StoreInfoForm
              formData={formData}
              onFormDataChange={(updates) =>
                setFormData((prev) => ({
                  ...prev,
                  ...updates,
                }))
              }
            />

            {categories.map((category) => (
              <CategorySection
                key={category.name}
                category={category}
                college="api-school"
                quantities={quantities}
                onQuantityChange={() => {}}
                imageSrcResolver={imageSrcResolver}
                productTitleResolver={productTitleResolver}
                productDetailPathResolver={productDetailPathResolver}
                showTapToSelectText={true}
              />
            ))}
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ApiCollegeOrderForm;
