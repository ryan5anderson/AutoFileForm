import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { colleges } from '../../config';
import { firebaseOrderService, Order } from '../../services/firebaseOrderService';
import { FormData, ReceiptCategoryGroup } from '../../types';
import Footer from '../layout/Footer';

import ReceiptPage from './receipt';

import '../../styles/college-pages.css';

function isReceiptCategoryList(value: unknown): value is ReceiptCategoryGroup[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (g) =>
      g &&
      typeof g === 'object' &&
      typeof (g as ReceiptCategoryGroup).category === 'string' &&
      Array.isArray((g as ReceiptCategoryGroup).products)
  );
}

/** Admin /shared receipt for API-school orders using data saved at submit time (same as confirmation email). */
const StoredApiReceiptFromEmail: React.FC<{
  formData: FormData;
  receiptCategories: ReceiptCategoryGroup[];
  onExit: () => void;
}> = ({ formData, receiptCategories, onExit }) => {
  const handlePrintReceipt = () => {
    window.print();
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', '#111111');
  }, []);

  return (
    <div
      className="api-schools-flow"
      style={{
        background: 'var(--color-bg)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        style={{
          flex: 1,
          padding: 'var(--space-4)',
          paddingTop: 'calc(64px + var(--space-4))',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        <h1
          style={{
            color: 'var(--color-primary)',
            margin: '0',
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '600',
            marginBottom: 'var(--space-6)',
          }}
        >
          Order Receipt
        </h1>

        <div
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              marginBottom: 'var(--space-4)',
              paddingBottom: 'var(--space-3)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
              }}
            >
              <div>
                <strong>Store Name:</strong> {formData.company}
              </div>
              <div>
                <strong>Store Number:</strong> {formData.storeNumber}
              </div>
              <div>
                <strong>Store Manager:</strong> {formData.storeManager}
              </div>
              <div>
                <strong>Ordered By:</strong> {formData.orderedBy || formData.storeManager}
              </div>
              <div>
                <strong>Date:</strong> {formData.date}
              </div>
            </div>
          </div>

          {receiptCategories.map((category) => (
            <div key={category.category} style={{ marginBottom: 'var(--space-4)' }}>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  borderBottom: '2px solid var(--color-primary)',
                  marginBottom: 'var(--space-3)',
                  paddingBottom: 'var(--space-2)',
                  color: 'var(--color-primary)',
                }}
              >
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
                  <div
                    style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      marginBottom: 'var(--space-2)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {product.name}
                  </div>
                  {product.details
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, idx) => {
                      const m = line.match(/^(.+?)\s*\|\s*Qty:\s*(\d+)\s*$/);
                      if (m) {
                        return (
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
                            <span>{m[1]}</span>
                            <span style={{ fontWeight: '500' }}>Qty: {m[2]}</span>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={idx}
                          style={{
                            fontSize: '0.875rem',
                            marginLeft: 'var(--space-3)',
                            padding: 'var(--space-1) 0',
                            color: 'var(--color-text)',
                          }}
                        >
                          {line}
                        </div>
                      );
                    })}
                  <div
                    style={{
                      fontSize: '0.875rem',
                      marginLeft: 'var(--space-3)',
                      marginTop: 'var(--space-2)',
                      fontWeight: '600',
                    }}
                  >
                    Total Quantity: {product.total_qty}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {formData.orderNotes && (
            <div
              style={{
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--color-primary)',
                }}
              >
                Order Notes
              </h3>
              <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', color: 'var(--color-text)' }}>
                {formData.orderNotes}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center',
            marginTop: 'var(--space-6)',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="college-page-title-btn"
            onClick={onExit}
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

const ApiReceiptTextFallback: React.FC<{
  formData: FormData;
  receiptText: string;
  onExit: () => void;
}> = ({ formData, receiptText, onExit }) => {
  const handlePrintReceipt = () => {
    window.print();
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', '#111111');
  }, []);

  return (
    <div
      className="api-schools-flow"
      style={{
        background: 'var(--color-bg)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        style={{
          flex: 1,
          padding: 'var(--space-4)',
          paddingTop: 'calc(64px + var(--space-4))',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <h1
          style={{
            color: 'var(--color-primary)',
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '600',
            marginBottom: 'var(--space-6)',
          }}
        >
          Order Receipt
        </h1>
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div>
              <strong>Store Name:</strong> {formData.company}
            </div>
            <div>
              <strong>Store Number:</strong> {formData.storeNumber}
            </div>
            <div>
              <strong>Store Manager:</strong> {formData.storeManager}
            </div>
            <div>
              <strong>Ordered By:</strong> {formData.orderedBy || formData.storeManager}
            </div>
            <div>
              <strong>Date:</strong> {formData.date}
            </div>
          </div>
          <pre style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.875rem', whiteSpace: 'pre-wrap', margin: 0 }}>
            {receiptText}
          </pre>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onExit}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            Exit
          </button>
          <button
            type="button"
            onClick={handlePrintReceipt}
            style={{
              border: '2px solid var(--color-primary)',
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
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

const OrderReceiptPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (orderId) {
        try {
          const stateOrder = (location.state as { order?: Order } | null)?.order;
          if (stateOrder) {
            setOrder(stateOrder);
            setLoading(false);
            return;
          }

          // Otherwise, fetch from Firebase
          const allOrders = await firebaseOrderService.getAllOrders();
          const foundOrder = allOrders.find(o => o.id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          }
        } catch (error) {
          console.error('Error loading order:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadOrder();
  }, [orderId, location.state]);

  // Get college categories for receipt display
  const getCollegeCategories = (collegeName: string) => {
    const collegeKeyMap: { [key: string]: string } = {
      'alabamauniversity': 'alabamauniversity',
      'arizonastate': 'arizonastate', 
      'michiganstate': 'michiganstate',
      'pittsburghuniversity': 'pittsburghuniversity',
      'westvirginiauniversity': 'westvirginiauniversity',
      'oregonuniversity': 'oregonuniversity'
    };
    
    const collegeKey = collegeKeyMap[collegeName.toLowerCase()] || collegeName.toLowerCase();
    const collegeConfig = colleges[collegeKey as keyof typeof colleges];
    
    return collegeConfig ? collegeConfig.categories : [];
  };

  // Convert Order to FormData for receipt component
  const convertOrderToFormData = (o: Order): FormData => {
    if (o.formData) {
      return o.formData;
    }
    
    return {
      company: o.college,
      storeNumber: o.storeNumber,
      storeManager: o.storeManager,
      orderedBy: o.orderedBy || o.storeManager,
      date: o.date,
      orderNotes: o.orderNotes || '',
      quantities: {},
      shirtVersions: {},
      displayOptions: {},
      sweatpantJoggerOptions: {},
      pantOptions: {},
      shirtSizeCounts: {},
      colorOptions: {},
      shirtColorSizeCounts: {},
    };
  };

  const handleExit = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Loading receipt...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: '16px'
      }}>
        <div style={{ fontSize: '1.125rem', color: '#dc2626' }}>Order not found</div>
        <button
          onClick={handleExit}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Back to Admin
        </button>
      </div>
    );
  }

  const formData = convertOrderToFormData(order);
  const isApiSchoolOrder = order.college.toLowerCase().startsWith('api-school:');
  const storedCategories = order.emailTemplateParams?.receipt_categories;

  if (isApiSchoolOrder && isReceiptCategoryList(storedCategories)) {
    return (
      <StoredApiReceiptFromEmail
        formData={formData}
        receiptCategories={storedCategories}
        onExit={handleExit}
      />
    );
  }

  if (isApiSchoolOrder) {
    const receiptText = order.emailTemplateParams?.receipt_text;
    if (typeof receiptText === 'string' && receiptText.trim()) {
      return <ApiReceiptTextFallback formData={formData} receiptText={receiptText} onExit={handleExit} />;
    }
  }

  return (
    <ReceiptPage
      formData={formData}
      categories={getCollegeCategories(order.college)}
      onExit={handleExit}
      hideBackToSummary={true}
    />
  );
};

export default OrderReceiptPage;
