import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useApiCollegeOrder } from '../../contexts/ApiCollegeOrderContext';
import { getVersionDisplayName } from '../../features/utils';
import { getProductSelectionTotal } from '../../features/utils/apiOrderState';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import '../../styles/college-pages.css';

const ApiCollegeReceiptPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    orderTemplateId,
    categories,
    productMap,
    formData,
    orderedByProduct,
  } = useApiCollegeOrder();

  const handleBackToSummary = () => {
    navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}/summary`);
  };

  const handleExit = () => {
    navigate(`/api-school/${encodeURIComponent(orderTemplateId || '')}/thankyou`);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div style={{
      background: 'var(--color-bg)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header showBackButton={true} />

      <main style={{
        flex: 1,
        padding: 'var(--space-4)',
        paddingTop: 'calc(64px + var(--space-4))',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}>
        <h1 style={{
          color: 'var(--color-primary)',
          margin: '0',
          textAlign: 'center',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: '600',
          marginBottom: 'var(--space-6)',
        }}>
          Order Receipt
        </h1>

        <div style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            marginBottom: 'var(--space-4)',
            paddingBottom: 'var(--space-3)',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
            }}>
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
          }).map((category) => {
            const itemsWithQty = category.images.filter((img) => {
              const selection = orderedByProduct[img];
              if (!selection) return false;
              return getProductSelectionTotal(selection) > 0;
            });
            if (itemsWithQty.length === 0) return null;

            return (
              <div key={category.name} style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  borderBottom: '2px solid var(--color-primary)',
                  marginBottom: 'var(--space-3)',
                  paddingBottom: 'var(--space-2)',
                  color: 'var(--color-primary)',
                }}>
                  {category.name}
                </div>
                {itemsWithQty.map((img) => {
                  const product = productMap[img];
                  const selection = orderedByProduct[img];
                  if (!product || !selection) return null;
                  const productName = product.productName || img;
                  const defaultVariant = product.defaultVariant || 'default';
                  const variantOptions = product.variantOptions?.length ? product.variantOptions : [defaultVariant];

                  const rows: { label: string; qty: number }[] = [];
                  variantOptions.forEach((variant: string) => {
                    const sizeMap = selection.variantQuantities[variant] || {};
                    const total = Object.values(sizeMap).reduce((s, q) => s + (Number(q) || 0), 0);
                    if (total > 0) {
                      const sizeParts = Object.entries(sizeMap)
                        .filter(([, q]) => (Number(q) || 0) > 0)
                        .map(([sz, q]) => `${sz}: ${q}`)
                        .join(', ');
                      const label =
                        variant === defaultVariant && !product.variantOptions?.length
                          ? (sizeParts || 'Qty')
                          : `${getVersionDisplayName(variant)} ${sizeParts}`.trim();
                      rows.push({ label, qty: total });
                    }
                  });

                  const totalQty = rows.reduce((sum, r) => sum + r.qty, 0);
                  if (totalQty === 0) return null;

                  return (
                    <div
                      key={img}
                      style={{
                        marginBottom: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
                        {productName}
                      </div>
                      {rows.map((row, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.875rem',
                            marginLeft: 'var(--space-3)',
                            padding: 'var(--space-1) 0',
                          }}
                        >
                          <span>{row.label}</span>
                          <span style={{ fontWeight: '500' }}>Qty: {row.qty}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {formData.orderNotes && (
            <div style={{
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--color-border)',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-2)', color: 'var(--color-primary)' }}>
                Order Notes
              </h3>
              <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', color: 'var(--color-text)' }}>
                {formData.orderNotes}
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'center',
          marginTop: 'var(--space-6)',
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            className="college-page-title-btn"
            onClick={handleBackToSummary}
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              border: '2px solid var(--color-primary)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            Back to Summary
          </button>
          <button
            type="button"
            className="college-page-title-btn"
            onClick={handleExit}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            Exit
          </button>
          <button
            type="button"
            className="college-page-title-btn"
            onClick={handlePrintReceipt}
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              border: '2px solid var(--color-primary)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            Print Receipt
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiCollegeReceiptPage;
