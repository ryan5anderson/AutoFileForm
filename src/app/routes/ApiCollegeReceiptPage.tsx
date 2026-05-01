import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useApiCollegeOrder } from '../../contexts/ApiCollegeOrderContext';
import { buildApiReceiptCategories } from '../../features/utils';
import { appendSearchToPath } from '../../features/utils/storeManagerLink';
import Footer from '../layout/Footer';
import '../../styles/college-pages.css';

const ApiCollegeReceiptPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    orderTemplateId,
    categories,
    productMap,
    formData,
    orderedByProduct,
  } = useApiCollegeOrder();

  const handleBackToSummary = () => {
    navigate(appendSearchToPath(`/api-school/${encodeURIComponent(orderTemplateId || '')}/summary`, searchParams), {
      state: { fromReceipt: true },
    });
  };

  const handleExit = () => {
    navigate(appendSearchToPath(`/api-school/${encodeURIComponent(orderTemplateId || '')}/thankyou`, searchParams));
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const receiptCategories = buildApiReceiptCategories(categories, orderedByProduct, productMap);

  return (
    <div className="api-schools-flow" style={{
      background: 'var(--color-bg)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
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
              <div><strong>Ordered By:</strong> {formData.orderedBy}</div>
              <div><strong>Date:</strong> {formData.date}</div>
            </div>
          </div>

          {receiptCategories.map((category) => (
            <div key={category.category} style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  borderBottom: '2px solid var(--color-primary)',
                  marginBottom: 'var(--space-3)',
                  paddingBottom: 'var(--space-2)',
                  color: 'var(--color-primary)',
                }}>
                  {category.category}
                </div>
                {category.products.map((product) => (
                    <div
                      key={`${product.sku}-${product.name}`}
                      style={{
                        marginBottom: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
                        {product.name}
                      </div>
                      {product.rows.map((row, idx) => (
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
                ))}
            </div>
          ))}

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
