import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useApiCollegeOrder } from '../../contexts/ApiCollegeOrderContext';
import CategorySection from '../../features/components/CategorySection';
import { createApiTemplateParams, getVersionDisplayName } from '../../features/utils';
import { getApiSchoolStorageKey, getDefaultProductSelection, getProductSelectionTotal, hasApiOrderProducts } from '../../features/utils/apiOrderState';
import { getProxiedImageUrl } from '../../services/collegeApiService';
import { sendOrderEmail } from '../../services/emailService';
import { firebaseOrderService } from '../../services/firebaseOrderService';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import '../../styles/college-pages.css';

const ApiCollegeSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    orderTemplateId,
    categories,
    productMap,
    rawPageData,
    formData,
    orderedByProduct,
    invalidProductPaths,
  } = useApiCollegeOrder();

  const [sending, setSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);

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

  const imageSrcResolver = useCallback(
    (_categoryPath: string, imageName: string) => {
      const product = productMap[imageName];
      return getProxiedImageUrl(product?.imageUrl) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    },
    [productMap]
  );

  const productTitleResolver = useCallback(
    (_categoryPath: string, imageName: string) => {
      const product = productMap[imageName];
      return product?.productName || 'Product';
    },
    [productMap]
  );

  const getApiCartItems = useCallback(
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

  const handleBack = useCallback(() => {
    navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}`);
  }, [navigate, orderTemplateId]);

  const handleConfirm = useCallback(() => {
    setConfirmationError(null);
    if (!hasApiOrderProducts(orderedByProduct, productMap)) {
      setConfirmationError('Cannot submit an empty order. Please select at least one product before submitting.');
      return;
    }
    if (invalidProductPaths.length > 0) {
      setConfirmationError('Some products have invalid pack quantities. Please fix them before submitting.');
      return;
    }
    setShowConfirmModal(true);
  }, [orderedByProduct, productMap, invalidProductPaths]);

  const handleConfirmSubmit = useCallback(async () => {
    setConfirmationError(null);
    setSending(true);
    try {
      const totalItems = Object.values(quantities).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
      await firebaseOrderService.addOrder({
        college: `api-school:${orderTemplateId}`,
        storeNumber: formData.storeNumber,
        storeManager: formData.storeManager,
        orderedBy: formData.orderedBy || formData.storeManager,
        date: formData.date,
        status: 'pending',
        totalItems,
        orderNotes: formData.orderNotes,
        formData: { ...formData, quantities } as never,
      });

      const schoolName = rawPageData && typeof rawPageData === 'object' && 'schoolName' in rawPageData
        ? (rawPageData as { schoolName?: string }).schoolName
        : '';
      const templateParams = createApiTemplateParams(
        formData,
        categories,
        orderedByProduct,
        productMap,
        schoolName || ''
      );
      await sendOrderEmail(templateParams);

      localStorage.removeItem(getApiSchoolStorageKey(orderTemplateId || ''));

      setShowConfirmModal(false);
      navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}/receipt`);
    } catch (err) {
      console.error('Order submit error:', err);
      const message = err instanceof Error ? err.message : String(err);
      const isFirebaseError = message.toLowerCase().includes('firebase') || message.toLowerCase().includes('permission');
      setConfirmationError(
        isFirebaseError
          ? 'Failed to save order. Please check your Firebase connection and Firestore rules.'
          : 'Failed to send email. Please check your EmailJS configuration and try again.'
      );
    } finally {
      setSending(false);
    }
  }, [formData, categories, orderedByProduct, productMap, quantities, orderTemplateId, navigate, rawPageData]);

  const handleConfirmCancel = useCallback(() => {
    setShowConfirmModal(false);
    setConfirmationError(null);
  }, []);

  return (
    <div className="summary-page-container">
      <div className="college-page-header">
        <Header showBackButton={true} />
      </div>

      <main className="summary-page-main">
        <h1 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-6)', fontSize: '2rem', fontWeight: '600', textAlign: 'center' }}>
          Order Summary
        </h1>

        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-3)', borderBottom: '2px solid var(--color-primary)', paddingBottom: 'var(--space-2)' }}>
            Store Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            <div><strong>Store Name:</strong> {formData.company}</div>
            <div><strong>Store Number:</strong> {formData.storeNumber}</div>
            <div><strong>Store Manager:</strong> {formData.storeManager}</div>
            <div><strong>Ordered By:</strong> {formData.orderedBy || formData.storeManager}</div>
            <div><strong>Date:</strong> {formData.date}</div>
          </div>
        </div>

        {[...categories].sort((a, b) => {
          const aIsDisplay = a.name.toLowerCase().includes('display');
          const bIsDisplay = b.name.toLowerCase().includes('display');
          if (aIsDisplay && !bIsDisplay) return 1;
          if (!aIsDisplay && bIsDisplay) return -1;
          return 0;
        }).map((category) => (
          <CategorySection
            key={category.name}
            category={category}
            quantities={quantities}
            readOnly={true}
            college="api-school"
            imageSrcResolver={imageSrcResolver}
            productTitleResolver={productTitleResolver}
            apiOrderedByProduct={orderedByProduct}
            apiProductMap={productMap}
            getApiCartItems={getApiCartItems}
            invalidProductPaths={invalidProductPaths}
          />
        ))}

        {formData.orderNotes && (
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-3)', borderBottom: '2px solid var(--color-primary)', paddingBottom: 'var(--space-2)' }}>
              Order Notes
            </h2>
            <div style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
              {formData.orderNotes}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleBack} disabled={sending} className="college-page-title-btn" style={{ background: 'var(--color-bg)', color: 'var(--color-primary)', border: '2px solid var(--color-primary)', minWidth: '150px' }}>
            Back to Form
          </button>
          <button type="button" onClick={handleConfirm} disabled={sending} className="college-page-title-btn" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', minWidth: '150px' }}>
            {sending ? 'Sending...' : 'Send Order'}
          </button>
        </div>

        {confirmationError && !showConfirmModal && (
          <div style={{ background: 'rgb(239 68 68 / 10%)', border: '1px solid rgb(239 68 68 / 30%)', borderRadius: 'var(--radius-lg)', color: '#dc2626', marginTop: 'var(--space-4)', padding: 'var(--space-3)' }}>
            {confirmationError}
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmSubmit}
        onCancel={handleConfirmCancel}
        title="Confirm Order Submission"
        message="Are you sure you want to submit this order? This action cannot be undone."
        confirmText="Yes, Send Order"
        cancelText="Cancel"
        isProcessing={sending}
        error={confirmationError}
      />

      <Footer />
    </div>
  );
};

export default ApiCollegeSummaryPage;
