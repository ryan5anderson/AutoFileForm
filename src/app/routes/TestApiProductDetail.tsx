import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import '../../styles/college-pages.css';
import '../../styles/product-detail.css';
import { fetchCollegeOrder, getProxiedImageUrl, type OrderItem } from '../../services/collegeApiService';

const TestApiProductDetailPage: React.FC = () => {
  const { orderTemplateId, itemId } = useParams<{ orderTemplateId: string; itemId: string }>();
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderTemplateId || !itemId) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchCollegeOrder(orderTemplateId);
        // Filter out ORDER REVIEW items
        const filteredData = data.filter(item => 
          item.SHIRTNAME && !item.SHIRTNAME.trim().toUpperCase().includes('ORDER REVIEW')
        );
        
        // Find the current item by matching Expr1 (primary) or fallback pattern
        let decodedItemId: string;
        try {
          decodedItemId = decodeURIComponent(itemId);
        } catch (e) {
          setError('Invalid product ID');
          setLoading(false);
          return;
        }
        
        const item = filteredData.find((i) => {
          // Primary match: Expr1 field (most reliable and URL-safe)
          if (i.Expr1 && i.Expr1 === decodedItemId) {
            return true;
          }
          // Fallback: ORDER_NUM-DESIGN_NUM pattern
          if (`${i.ORDER_NUM}-${i.DESIGN_NUM}` === decodedItemId) {
            return true;
          }
          // Fallback: Check if decodedItemId matches part of ORDER_NUM-DESIGN_NUM-Index pattern
          const fallbackPattern = `${i.ORDER_NUM}-${i.DESIGN_NUM}-`;
          if (decodedItemId.startsWith(fallbackPattern)) {
            return true;
          }
          return false;
        });
        
        if (item) {
          setCurrentItem(item);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order data');
        console.error('Error fetching order data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderTemplateId, itemId]);


  const handleBack = () => {
    navigate(`/test-api/${orderTemplateId}`);
  };

  if (loading) {
    return (
      <div className="summary-page-container">
        <main className="summary-page-main" style={{ maxWidth: 1200, padding: 'var(--space-4)' }}>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-8)', 
            color: 'var(--color-text)' 
          }}>
            Loading product details...
          </div>
        </main>
      </div>
    );
  }

  if (error || !currentItem) {
    return (
      <div className="summary-page-container">
        <main className="summary-page-main" style={{ maxWidth: 1200, padding: 'var(--space-4)' }}>
          <div style={{ 
            padding: 'var(--space-4)', 
            backgroundColor: 'var(--color-gray-50)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-danger)',
            marginBottom: 'var(--space-4)'
          }}>
            {error || 'Product not found'}
          </div>
          <button
            onClick={handleBack}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-bg)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            Back to Products
          </button>
        </main>
      </div>
    );
  }

  const imageUrl = getProxiedImageUrl(currentItem.productUrl);

  return (
    <div className="summary-page-container">
      <main className="summary-page-main" style={{ maxWidth: 1200, padding: 'var(--space-4)' }}>
        <button
          onClick={handleBack}
          style={{
            marginTop: 'var(--space-8)',
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--color-bg)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text)'
          }}
        >
          ← Back to Products
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 500px) 1fr',
          gap: 'var(--space-6)',
          marginTop: 'var(--space-4)'
        }}>
          {/* Product Image */}
          <div>
            {imageUrl ? (
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
              <img
                src={imageUrl}
                alt={currentItem.SHIRTNAME || 'Product image'}
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  border: '1px solid var(--color-border)',
                  objectFit: 'contain',
                  backgroundColor: 'var(--color-gray-50)'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                minHeight: '400px',
                backgroundColor: 'var(--color-gray-100)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gray-500)',
                fontSize: 'var(--font-size-base)'
              }}>
                No image available
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-4)'
            }}>
              {[currentItem.STYLE_NUM, currentItem.DESIGN_NUM, currentItem.COLOR_INIT].filter(Boolean).join(' ') || 'Unnamed Product'}
            </h1>

            {currentItem.Expr1 && (
              <div style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-6)',
                lineHeight: 'var(--line-height-relaxed)'
              }}>
                {currentItem.Expr1}
              </div>
            )}

            <div style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)'
            }}>
              <h2 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-4)'
              }}>
                Product Information
              </h2>
              
              <div style={{
                display: 'grid',
                gap: 'var(--space-3)'
              }}>
                {currentItem.ORDER_NUM && (
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Order Number:</strong>{' '}
                    <span style={{ color: 'var(--color-gray-700)' }}>{currentItem.ORDER_NUM}</span>
                  </div>
                )}
                {currentItem.STYLE_NUM && (
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Style Number:</strong>{' '}
                    <span style={{ color: 'var(--color-gray-700)' }}>{currentItem.STYLE_NUM.trim()}</span>
                  </div>
                )}
                {currentItem.DESIGN_NUM && (
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Design Number:</strong>{' '}
                    <span style={{ color: 'var(--color-gray-700)' }}>{currentItem.DESIGN_NUM}</span>
                  </div>
                )}
                {currentItem.COLOR_INIT && (
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Color:</strong>{' '}
                    <span style={{ color: 'var(--color-gray-700)' }}>{currentItem.COLOR_INIT}</span>
                  </div>
                )}
                {currentItem.UNITPRICE && (
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Unit Price:</strong>{' '}
                    <span style={{ color: 'var(--color-gray-700)' }}>${currentItem.UNITPRICE}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestApiProductDetailPage;

