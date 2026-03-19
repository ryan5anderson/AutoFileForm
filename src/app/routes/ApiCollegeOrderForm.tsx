import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApiCollegeOrder } from '../../contexts/ApiCollegeOrderContext';
import CategorySection from '../../features/components/CategorySection';
import StoreInfoForm from '../../features/components/StoreInfoForm';
import { getVersionDisplayName, validateStoreInfo } from '../../features/utils';
import { getDefaultProductSelection, getProductSelectionTotal, hasApiOrderProducts } from '../../features/utils/apiOrderState';
import { buildApiOrderPayload, getProxiedImageUrl, submitApiOrder } from '../../services/collegeApiService';
import CollapsibleSidebar from '../layout/CollapsibleSidebar';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import '../../styles/college-pages.css';

const ApiCollegeOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = React.useRef<HTMLFormElement>(null);
  const productSectionRef = React.useRef<HTMLDivElement>(null);

  const {
    orderTemplateId,
    loading,
    error,
    categories,
    productMap,
    rawPageData,
    formData,
    orderedByProduct,
    invalidProductPaths,
    validProductPaths,
    setFormData,
  } = useApiCollegeOrder();

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

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [orderJsonOpen, setOrderJsonOpen] = React.useState(false);
  const [copyFeedback, setCopyFeedback] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [sendState, setSendState] = React.useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ status: 'idle' });

  React.useEffect(() => {
    const state = location.state as { returnFromProduct?: boolean; returnScrollY?: number } | null;
    if (state?.returnFromProduct && typeof state.returnScrollY === 'number') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: state.returnScrollY, behavior: 'auto' });
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleFormSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      // Check products first so we don't scroll to store inputs at top when the real issue is no products
      if (!hasApiOrderProducts(orderedByProduct, productMap)) {
        setFormError('Please select at least one product before submitting your order.');
        return;
      }
      if (invalidProductPaths.length > 0) {
        setFormError('Some products have invalid pack quantities. Please adjust so each variant total is a multiple of the pack size.');
        return;
      }
      // Store fields are validated by native HTML5 (required) before submit fires.
      // Fallback: if store invalid, trigger native tooltip and stop
      const storeResult = validateStoreInfo(formData);
      if (!storeResult.isValid) {
        formRef.current?.reportValidity();
        return;
      }
      navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}/summary`);
    },
    [formData, orderTemplateId, navigate, orderedByProduct, productMap, invalidProductPaths]
  );

  const orderPayload = React.useMemo(
    () =>
      buildApiOrderPayload(rawPageData, orderedByProduct, productMap, {
        company: formData.company,
        storeNumber: formData.storeNumber,
        storeManager: formData.storeManager,
        orderedBy: formData.orderedBy,
        date: formData.date,
        orderNotes: formData.orderNotes,
      }),
    [rawPageData, orderedByProduct, productMap, formData.company, formData.storeNumber, formData.storeManager, formData.orderedBy, formData.date, formData.orderNotes]
  );

  const handleCopyJson = React.useCallback(async () => {
    if (!orderPayload) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(orderPayload, null, 2));
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setCopyFeedback(false);
    }
  }, [orderPayload]);

  const handleSendOrder = React.useCallback(async () => {
    if (!orderPayload) return;
    setSendState({ status: 'loading' });
    const result = await submitApiOrder(orderPayload);
    if (result.success) {
      setSendState({ status: 'success', message: result.message });
    } else {
      setSendState({ status: 'error', message: result.error });
    }
  }, [orderPayload]);

  const imageSrcResolver = React.useCallback(
    (_categoryPath: string, imageName: string) => {
      const product = productMap[imageName];
      return getProxiedImageUrl(product?.imageUrl) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    },
    [productMap]
  );

  const productTitleResolver = React.useCallback(
    (_categoryPath: string, imageName: string) => {
      const product = productMap[imageName];
      return product?.productName || 'Product';
    },
    [productMap]
  );

  const productDetailPathResolver = React.useCallback(
    (_categoryPath: string, imageName: string) => {
      return `/api-school/${encodeURIComponent(orderTemplateId || '')}/product/${encodeURIComponent(imageName)}`;
    },
    [orderTemplateId]
  );

  const getApiCartItems = React.useCallback(
    (imagePath: string, imageName: string): { label: string; qty: number }[] => {
      const product = productMap[imageName];
      const selection = orderedByProduct[imageName];
      if (!product || !selection) return [];

      const items: { label: string; qty: number }[] = [];
      const defaultVariant = product.defaultVariant || 'default';

      Object.entries(selection.variantQuantities || {}).forEach(([variant, sizeMap]) => {
        const total = Object.values(sizeMap).reduce((s, q) => s + (Number(q) || 0), 0);
        if (total > 0) {
          const displayName =
            variant === defaultVariant && !product.variantOptions?.length
              ? 'Qty'
              : getVersionDisplayName(variant);
          items.push({ label: displayName, qty: total });
        }
      });
      return items;
    },
    [productMap, orderedByProduct]
  );

  return (
    <div className="college-page-container api-schools-flow">
      <div className="college-page-header">
        <Header showSidebarToggle={true} onSidebarToggle={() => setSidebarOpen((s) => !s)} />
      </div>

      <CollapsibleSidebar
        categories={categories}
        activeSection={categories[0]?.name.toLowerCase().replace(/\s+/g, '-') || ''}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((s) => !s)}
        onBackToColleges={() => navigate('/')}
        showCategories={true}
      />

      <main className="college-page-main">
        <div className="college-page-title">
          <div className="college-page-title-actions">
            <button
              className="college-page-title-btn college-page-title-btn--back"
              type="button"
              onClick={() => navigate('/', { state: { showApiSchools: true } })}
            >
              Back to API Schools
            </button>
          </div>
          <h1>School Product Order Form</h1>
          <p>Select your merchandise and quantities below</p>
        </div>

        {loading && categories.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Loading order data...</div>
        )}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <form ref={formRef} onSubmit={handleFormSubmit}>
            <StoreInfoForm
              formData={formData}
              onFormDataChange={(updates) =>
                setFormData((prev) => ({
                  ...prev,
                  ...updates,
                }))
              }
            />

            <div ref={productSectionRef}>
            {categories.map((category) => (
              <CategorySection
                key={category.name}
                category={category}
                college="api-school"
                quantities={quantities}
                invalidProductPaths={invalidProductPaths}
                validProductPaths={validProductPaths}
                onQuantityChange={() => {}}
                imageSrcResolver={imageSrcResolver}
                productTitleResolver={productTitleResolver}
                productDetailPathResolver={productDetailPathResolver}
                showTapToSelectText={true}
                apiOrderedByProduct={orderedByProduct}
                apiProductMap={productMap}
                getApiCartItems={getApiCartItems}
              />
            ))}
            </div>

            {formError && (
              <div style={{ background: 'rgb(239 68 68 / 10%)', border: '1px solid rgb(239 68 68 / 30%)', borderRadius: 'var(--radius-lg)', color: '#dc2626', marginTop: 'var(--space-4)', padding: 'var(--space-3)' }}>
                {formError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="college-page-title-btn"
                style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: '180px',
                }}
              >
                Continue to Summary
              </button>
            </div>

            <div className="view-order-json-section" style={{ marginTop: 'var(--space-6)' }}>
              <button
                type="button"
                className="college-page-title-btn"
                onClick={() => setOrderJsonOpen((o) => !o)}
              >
                {orderJsonOpen ? 'Hide Order JSON' : 'View Order JSON'}
              </button>
              {orderJsonOpen && (
                <div
                  className="view-order-json-panel"
                  style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <pre
                    style={{
                      maxHeight: '400px',
                      overflow: 'auto',
                      padding: 'var(--space-4)',
                      margin: 0,
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--color-gray-100)',
                      borderRadius: 'var(--radius-md)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {orderPayload
                      ? JSON.stringify(orderPayload, null, 2)
                      : 'No order data available. Add products to your order.'}
                  </pre>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="college-page-title-btn"
                      onClick={handleCopyJson}
                      disabled={!orderPayload}
                    >
                      {copyFeedback ? 'Copied!' : 'Copy JSON'}
                    </button>
                    <button
                      type="button"
                      className="college-page-title-btn"
                      onClick={handleSendOrder}
                      disabled={!orderPayload || sendState.status === 'loading'}
                    >
                      {sendState.status === 'loading' ? 'Sending...' : 'Send Order'}
                    </button>
                  </div>
                  {sendState.status === 'success' && (
                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-success, #059669)', fontWeight: 500 }}>
                      {sendState.message}
                    </p>
                  )}
                  {sendState.status === 'error' && (
                    <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-error, #dc2626)', fontWeight: 500 }}>
                      {sendState.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ApiCollegeOrderForm;
